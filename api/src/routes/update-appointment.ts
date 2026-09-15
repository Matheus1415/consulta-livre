import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, eq, gt, lt, ne } from "drizzle-orm";

export const updateAppointment: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/appointments/:id",
    {
      schema: {
        summary: "Atualizar agendamento existente",
        tags: ["Appointments"],
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          title: z.string().min(1, "O título é obrigatório"),
          calendar: z.enum(["Consulta", "Feriados", "Bloqueio", "Outros"]),
          patientName: z.string().optional().nullable(),
          patientPhone: z.string().optional().nullable(),
          blockReason: z.string().optional().nullable(),
          start: z.string().datetime({ message: "A data inicial deve estar no formato ISO 8601 válido" }),
          end: z.string().datetime({ message: "A data final deve estar no formato ISO 8601 válido" }),
        }),
        response: {
          200: z.object({
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
          404: z.object({
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
      const { id } = request.params;
      const { title, calendar, patientName, patientPhone, blockReason, start, end } = request.body;

      // Verifica se o agendamento existe
      const existingAppointment = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);

      if (existingAppointment.length === 0) {
        return reply.status(404).send({
          status: "error",
          message: "Agendamento não encontrado.",
        });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Validação de consistência básica
      if (startDate >= endDate) {
        return reply.status(400).send({
          status: "error",
          message: "A data inicial deve ser anterior à data final.",
        });
      }

      // Validação de Horário Comercial (08:00 às 18:00)
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

      // Validação de Choque de Horários (ignorando o próprio evento sendo editado)
      const conflictingAppointments = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            ne(appointments.id, id),
            lt(appointments.start, endDate),
            gt(appointments.end, startDate)
          )
        )
        .limit(1);

      if (conflictingAppointments.length > 0) {
        return reply.status(409).send({
          status: "error",
          message: "Já existe outro agendamento cadastrado para este horário.",
        });
      }

      // Executa a atualização
      await db
        .update(appointments)
        .set({
          title,
          calendar,
          patientName: patientName ?? null,
          patientPhone: patientPhone ?? null,
          blockReason: blockReason ?? null,
          start: startDate,
          end: endDate,
        })
        .where(eq(appointments.id, id));

      return reply.status(200).send({
        status: "success",
        message: "Agendamento atualizado com sucesso!",
        data: {
          id,
        },
      });
    }
  );
};