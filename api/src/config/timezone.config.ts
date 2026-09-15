// config/timezone.ts
import { toZonedTime, fromZonedTime, format as formatTZ } from "date-fns-tz";

export const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Sao_Paulo";

// Converte qualquer data (UTC ou ISO) para o horário local configurado no .env
export function toAppTimezone(date: Date | string): Date {
  return toZonedTime(new Date(date), APP_TIMEZONE);
}

//  Converte um horário local (do .env)
export function toUTC(date: Date | string): Date {
  return fromZonedTime(date, APP_TIMEZONE);
}

// Formata datas já considerando a timezone do .env
export function formatInAppTimezone(
  date: Date | string,
  formatStr: string,
): string {
  return formatTZ(toAppTimezone(date), formatStr, { timeZone: APP_TIMEZONE });
}
