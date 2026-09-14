import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";

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
          start: z.string().datetime({ message: "A data inicial deve estar no formato ISO 8601 válido" }),
          end: z.string().datetime({ message: "A data final deve estar no formato ISO 8601 válido" }),
        }),
        response: {
          201: z.object({
            id: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, calendar, patientName, patientPhone, blockReason, start, end } = request.body;

      const result = await db
        .insert(appointments)
        .values({
          title,
          calendar,
          patientName: patientName ?? null,
          patientPhone: patientPhone ?? null,
          blockReason: blockReason ?? null,
          start: new Date(start),
          end: new Date(end),
        })
        .returning({ id: appointments.id });

      return reply.status(201).send({
        id: result[0].id,
        message: "Agendamento criado com sucesso!",
      });
    },
  );
};