import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, eq, gt, gte, lt, lte } from "drizzle-orm";

export const createAppointment: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/appointments",
    {
      schema: {
        summary: "Criar novo agendamento",
        tags: ["Appointments"],
        body: z.object({
          title: z.string().min(1, "O título é obrigatório"),
          calendar: z.enum(["Consulta", "Feriados", "Bloqueio", "Outros"]),
          patientName: z.string().optional().nullable(),
          patientPhone: z.string().optional().nullable(),
          blockReason: z.string().optional().nullable(),
          start: z.string().datetime({
            message: "A data inicial deve estar no formato ISO 8601 válido",
          }),
          end: z.string().datetime({
            message: "A data final deve estar no formato ISO 8601 válido",
          }),
        }),
        response: {
          201: z.object({
            status: z.string(),
            message: z.string(),
            data: z.object({
              id: z.string(),
            }),
          }),
          400: z.object({
            status: z.string(),
            message: z.string(),
          }),
          409: z.object({
            status: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const {
        title,
        calendar,
        patientName,
        patientPhone,
        blockReason,
        start,
        end,
      } = request.body;

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Validação de consistência básica
      if (startDate >= endDate) {
        return reply.status(400).send({
          status: "error",
          message: "A data inicial deve ser anterior à data final.",
        });
      }

      // Validação de Feriados
      if (calendar !== "Feriados") {
        const dayStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0,
        );

        const dayEnd = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          23,
          59,
          59,
          999,
        );

        const [holiday] = await db
          .select({ title: appointments.title })
          .from(appointments)
          .where(
            and(
              eq(appointments.calendar, "Feriados"),
              gte(appointments.start, dayStart),
              lte(appointments.start, dayEnd),
            ),
          )
          .limit(1);

        if (holiday) {
          return reply.status(400).send({
            status: "error",
            message: `Não é possível agendar nesta data pois é feriado (${holiday.title}).`,
          });
        }
      }

      // Validação de Horário Comercial (08:00 e 18:00)
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      const endMinutes = endDate.getMinutes();

      const isStartValid = startHour >= 8 && startHour < 18;
      const isEndValid = endHour < 18 || (endHour === 18 && endMinutes === 0);

      if (!isStartValid || !isEndValid) {
        return reply.status(400).send({
          status: "error",
          message: "Agendamentos só podem ser realizados entre 08:00 e 18:00.",
        });
      }

      // Validação de Choque/Sobreposição de Horários
      const conflictingAppointments = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(lt(appointments.start, endDate), gt(appointments.end, startDate)),
        )
        .limit(1);

      if (conflictingAppointments.length > 0) {
        return reply.status(409).send({
          status: "error",
          message: "Já existe um agendamento cadastrado para este horário.",
        });
      }

      const result = await db
        .insert(appointments)
        .values({
          title,
          calendar,
          patientName: patientName ?? null,
          patientPhone: patientPhone ?? null,
          blockReason: blockReason ?? null,
          start: startDate,
          end: endDate,
        })
        .returning({ id: appointments.id });

      return reply.status(201).send({
        status: "success",
        message: "Agendamento criado com sucesso!",
        data: {
          id: result[0].id,
        },
      });
    },
  );
};
