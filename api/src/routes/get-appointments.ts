import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, gte, lte } from "drizzle-orm";

export const getAppointments: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/appointments",
    {
      schema: {
        summary: "Listar agendamentos por mês",
        tags: ["Appointments"],
        querystring: z.object({
          month: z.coerce.number().min(1).max(12).describe("Mês do filtro (1 a 12)"),
          year: z.coerce.number().min(2000).describe("Ano do filtro (ex: 2026)"),
        }),
        response: {
          200: z.object({
            status: z.string(),
            message: z.string(),
            data: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                calendar: z.enum(["Consulta", "Feriados", "Bloqueio", "Outros"]),
                patientName: z.string().nullable(),
                patientPhone: z.string().nullable(),
                blockReason: z.string().nullable(),
                start: z.date(),
                end: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { month, year } = request.query;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const result = await db
        .select()
        .from(appointments)
        .where(
          and(
            gte(appointments.start, startDate),
            lte(appointments.start, endDate)
          )
        )
        .orderBy(appointments.start);

      return reply.status(200).send({
        status: "success",
        message: "Agendamentos recuperados com sucesso.",
        data: result,
      });
    }
  );
};