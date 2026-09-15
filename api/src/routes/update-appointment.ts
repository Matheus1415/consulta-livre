import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, eq, gt, lt, not, ne } from "drizzle-orm";
import { AppointmentValidationService } from "@/services/appointmentValidation.service";

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
          400: z.object({ status: z.string(), message: z.string() }),
          404: z.object({ status: z.string(), message: z.string() }),
          409: z.object({ status: z.string(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { title, calendar, patientName, patientPhone, blockReason, start, end } = request.body;

      const targetId = isNaN(Number(id)) ? id : Number(id);

      // Verifica se o agendamento existe
      const existingAppointment = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(eq(appointments.id, targetId as any))
        .limit(1);

      if (existingAppointment.length === 0) {
        return reply.status(404).send({
          status: "error",
          message: "Agendamento não encontrado.",
        });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Validações de Regra de Negócio via Service (Horário comercial, Fim de semana e Cronologia)
      if (calendar !== "Feriados") {
        const validation = AppointmentValidationService.validate(startDate, endDate);

        if (!validation.isValid) {
          return reply.status(400).send({
            status: "error",
            message: validation.error!,
          });
        }
      }

      // Validação de Choque de Horários no Banco de Dados
      const conflictStartParam = appointments.start.dataType === "string" ? start : startDate;
      const conflictEndParam = appointments.end.dataType === "string" ? end : endDate;

      const conflictingAppointments = await db
        .select({ 
          id: appointments.id,
          title: appointments.title,
          calendar: appointments.calendar 
        })
        .from(appointments)
        .where(
          and(
            not(eq(appointments.id, targetId as any)),
            ne(appointments.calendar, "Feriados"),
            lt(appointments.start, conflictEndParam as any),
            gt(appointments.end, conflictStartParam as any)
          )
        )
        .limit(1);

      if (conflictingAppointments.length > 0) {
        return reply.status(409).send({
          status: "error",
          message: `Já existe outro agendamento ("${conflictingAppointments[0].title}") cadastrado para este horário.`,
        });
      }

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
        .where(eq(appointments.id, targetId as any));

      return reply.status(200).send({
        status: "success",
        message: "Agendamento atualizado com sucesso!",
        data: { id },
      });
    }
  );
};