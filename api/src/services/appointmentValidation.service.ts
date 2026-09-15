import { toAppTimezone } from "@/config/timezone.config";
import { isWeekend, getHours, format } from "date-fns";
import { NagerPublicHoliday } from "./nager-date.provider";

// Cache em memória simples por ano para não sobrecarregar a API pública
const holidaysCache: Record<number, NagerPublicHoliday[]> = {};

export const AppointmentValidationService = {
  
  // Busca feriados da API do Nager.Date
  async fetchPublicHolidays(year: number): Promise<NagerPublicHoliday[]> {
    if (holidaysCache[year]) {
      return holidaysCache[year];
    }

    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/BR`
      );

      if (!response.ok) return [];

      const data: NagerPublicHoliday[] = await response.json();
      holidaysCache[year] = data;
      return data;
    } catch {
      return [];
    }
  },

  // Verifica se uma data específica é um feriado nacional
  async isPublicHoliday(date: Date): Promise<boolean> {
    const zonedDate = toAppTimezone(date);
    const year = zonedDate.getFullYear();
    const formattedDate = format(zonedDate, "yyyy-MM-dd");

    const holidays = await this.fetchPublicHolidays(year);
    return holidays.some((h) => h.date === formattedDate);
  },

  // Verifica se a data cai em um final de semana
  isWeekend(date: Date): boolean {
    const zonedDate = toAppTimezone(date);
    return isWeekend(zonedDate);
  },

  // Verifica se o horário está fora do expediente comercial
  isOutsideBusinessHours(date: Date): boolean {
    const zonedDate = toAppTimezone(date);
    const hours = getHours(zonedDate);
    return hours < 8 || hours >= 18;
  },

  // Suíte completa de validação
  async validate(
    start: Date,
    end: Date
  ): Promise<{ isValid: boolean; error?: string }> {
    const zonedStart = toAppTimezone(start);
    const zonedEnd = toAppTimezone(end);

    if (this.isWeekend(zonedStart)) {
      return {
        isValid: false,
        error: "Não é permitido agendar aos finais de semana.",
      };
    }

    const isHoliday = await this.isPublicHoliday(zonedStart);
    if (isHoliday) {
      return {
        isValid: false,
        error: "Não é possível agendar em feriados nacionais.",
      };
    }

    if (
      this.isOutsideBusinessHours(zonedStart) ||
      this.isOutsideBusinessHours(zonedEnd)
    ) {
      return {
        isValid: false,
        error: "Agendamentos devem ser entre 08:00 e 18:00.",
      };
    }

    if (zonedStart >= zonedEnd) {
      return {
        isValid: false,
        error: "O horário de início deve ser anterior ao término.",
      };
    }

    return { isValid: true };
  },
};