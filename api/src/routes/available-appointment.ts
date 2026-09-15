import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, gte, lte } from "drizzle-orm";

export const getAvailableSlots: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/appointments/available-slots",
    {
      schema: {
        summary: "Verificar horários disponíveis para uma data",
        tags: ["Appointments"],
        querystring: z.object({
          date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD")
            .describe("Data do agendamento (ex: 2026-03-25)"),
        }),
        response: {
          200: z.object({
            status: z.string(),
            message: z.string(),
            data: z.object({
              date: z.string(),
              isHoliday: z.boolean(),
              slots: z.array(
                z.object({
                  time: z.string(),
                  available: z.boolean(),
                  isOccupied: z.boolean(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { date } = request.query;

      // Define os limites de início e fim do dia consultado
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);

      // Busca todos os eventos/agendamentos cadastrados no dia
      const eventsOnDay = await db
        .select()
        .from(appointments)
        .where(
          and(
            gte(appointments.start, dayStart),
            lte(appointments.start, dayEnd)
          )
        );

      // Checa se o dia possui algum bloqueio por Feriado
      const isHoliday = eventsOnDay.some(
        (ev) => ev.calendar === "Feriados"
      );

      const slots: { time: string; available: boolean; isOccupied: boolean }[] = [];
      const WORK_START_HOUR = 8;
      const WORK_END_HOUR = 18;
      const SLOT_DURATION_MINUTES = 60;

      // Se for feriado, não gera a grade de horários disponíveis
      if (!isHoliday) {
        for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
          const timeString = `${String(hour).padStart(2, "0")}:00`;

          const slotStart = new Date(`${date}T${timeString}:00.000Z`);
          const slotEnd = new Date(
            slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000
          );

          // Verifica se algum agendamento colide com esta janela de 1 hora
          const isOccupied = eventsOnDay.some((ev) => {
            const evStart = new Date(ev.start);
            const evEnd = ev.end
              ? new Date(ev.end)
              : new Date(evStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

            return slotStart < evEnd && slotEnd > evStart;
          });

          slots.push({
            time: timeString,
            available: !isOccupied,
            isOccupied,
          });
        }
      }

      return reply.status(200).send({
        status: "success",
        message: "Horários consultados com sucesso.",
        data: {
          date,
          isHoliday,
          slots,
        },
      });
    }
  );
};