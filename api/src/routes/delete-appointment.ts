import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const deleteAppointment: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/appointments/:id",
    {
      schema: {
        summary: "Deletar agendamento existente",
        tags: ["Appointments"],
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            status: z.string(),
            message: z.string(),
            data: z.object({
              id: z.string(),
            }),
          }),
          400: z.object({ status: z.string(), message: z.string() }),
          404: z.object({ status: z.string(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const targetId = isNaN(Number(id)) ? id : Number(id);

      const existingAppointment = await db
        .select({
          id: appointments.id,
          calendar: appointments.calendar,
        })
        .from(appointments)
        .where(eq(appointments.id, targetId as any))
        .limit(1);

      if (existingAppointment.length === 0) {
        return reply.status(404).send({
          status: "error",
          message: "Agendamento não encontrado.",
        });
      }

      const item = existingAppointment[0];

      // Impede a remoção se for um feriado
      if (item.calendar === "Feriados") {
        return reply.status(400).send({
          status: "error",
          message: "Feriados não podem ser removidos da agenda.",
        });
      }

      await db
        .delete(appointments)
        .where(eq(appointments.id, targetId as any));

      return reply.status(200).send({
        status: "success",
        message: "Agendamento removido com sucesso!",
        data: { id },
      });
    }
  );
};