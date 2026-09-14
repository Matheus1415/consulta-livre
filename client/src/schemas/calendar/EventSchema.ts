import { z } from "zod";

export const EventSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  start: z.string().min(1, "A data inicial é obrigatória"),
  end: z.string().optional().nullable(),
  calendar: z.enum(["Consulta", "Feriados", "Bloqueio", "Outros"], {
    errorMap: () => ({ message: "Selecione uma categoria válida" }),
  }),
});

export type EventFormData = z.infer<typeof EventSchema>;