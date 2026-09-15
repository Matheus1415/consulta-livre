import { isWeekend, getHours, isSameDay } from "date-fns";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Configurações do negócio
const BUSINESS_HOURS = {
  START: 8,
  END: 18,
};

export const AppointmentValidationService = {
  // Verifica se a data cai em um final de semana
  isWeekend(date: Date): boolean {
    return isWeekend(date);
  },

  // Verifica se o horário está fora do expediente comercial
  isOutsideBusinessHours(date: Date): boolean {
    const hours = getHours(date);
    return hours < BUSINESS_HOURS.START || hours >= BUSINESS_HOURS.END;
  },

  // Valida se a data é um feriado cadastrado
  isHoliday(date: Date, holidayList: Date[] = []): boolean {
    return holidayList.some((holiday) => isSameDay(holiday, date));
  },

  // validações para um agendamento
  validate(start: Date, end: Date, holidayList: Date[] = []): ValidationResult {
    if (this.isWeekend(start) || this.isWeekend(end)) {
      return {
        isValid: false,
        error: "Não é permitido realizar agendamentos aos finais de semana.",
      };
    }

    if (this.isHoliday(start, holidayList)) {
      return {
        isValid: false,
        error: "Não é possível agendar em datas marcadas como feriado.",
      };
    }

    if (
      this.isOutsideBusinessHours(start) ||
      this.isOutsideBusinessHours(end)
    ) {
      return {
        isValid: false,
        error: `Atendimentos devem ser agendados entre ${BUSINESS_HOURS.START}:00 e ${BUSINESS_HOURS.END}:00.`,
      };
    }

    if (start >= end) {
      return {
        isValid: false,
        error: "O horário de início deve ser anterior ao horário de término.",
      };
    }

    return { isValid: true };
  },
};
