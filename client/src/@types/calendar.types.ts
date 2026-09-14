import type { EventInput } from "@fullcalendar/core";

export type CalendarCategory = 
  | "Consulta"   
  | "Feriados"   
  | "Bloqueio"   
  | "Outros";

export interface CalendarEventMeta {
  calendar: CalendarCategory;
  pacienteNome: string | null;
  pacienteTelefone: string | null;
  motivo: string | null;
  nacional: boolean | null;
}

export interface CalendarEvent extends EventInput {
  extendedProps: CalendarEventMeta;
}