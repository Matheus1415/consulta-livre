import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { syncHolidaysUseCase } from "@/use-cases/sync-holidays.use-case";

export const syncHolidays: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/appointments/sync-holidays",
    {
      schema: {
        summary: "Sincronizar feriados nacionais com a API Nager.Date",
        tags: ["Appointments"],
        body: z.object({
          year: z
            .number()
            .min(2000)
            .max(2100)
            .default(() => new Date().getFullYear())
            .describe("Ano dos feriados a serem sincronizados (ex: 2026)"),
        }),
        response: {
          200: z.object({
            status: z.string(),
            message: z.string(),
            data: z.object({
              totalFetched: z.number(),
              totalCreated: z.number(),
              totalSkipped: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { year } = request.body;

      const result = await syncHolidaysUseCase(year);

      return reply.status(200).send({
        status: "success",
        message: `Feriados do ano ${year} sincronizados com sucesso.`,
        data: result,
      });
    }
  );
};