import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { appointments } from "@/db/schema";
import { db } from "@/db";
import { and, eq, gt, lt } from "drizzle-orm";
import { AppointmentValidationService } from "@/services/appointmentValidation.service";

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

      // Validações de Regra de Negócio via Service (Com AWAIT corrigido)
      if (calendar !== "Feriados") {
        const validation = await AppointmentValidationService.validate(startDate, endDate);

        if (!validation.isValid) {
          return reply.status(400).send({
            status: "error",
            message: validation.error!,
          });
        }
      }

      // Validação de Choque/Sobreposição de Horários no Banco
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
          id: String(result[0].id),
        },
      });
    },
  );
};