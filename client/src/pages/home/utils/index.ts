import type { CalendarEvent } from "@/@types/calendar.types";

// Função auxiliar para encontrar o próximo slot de 1h livre no dia
export function findAvailableSlot(
  clickedDate: Date,
  isAllDay: boolean,
  existingEvents: CalendarEvent[],
): { start: Date; end: Date } {
  const WORK_START_HOUR = 8;
  const WORK_END_HOUR = 18;
  const DURATION_HOURS = 1;

  const candidateStart = new Date(clickedDate);

  // Se clicou no dia inteiro ou fora do horário de funcionamento, ajusta para 08:00
  if (
    isAllDay ||
    candidateStart.getHours() < WORK_START_HOUR ||
    candidateStart.getHours() >= WORK_END_HOUR
  ) {
    candidateStart.setHours(WORK_START_HOUR, 0, 0, 0);
  } else {
    // Arredonda minutos para o início da hora clicada
    candidateStart.setMinutes(0, 0, 0);
  }

  const parsedEvents = existingEvents.map((evt) => ({
    start: new Date(evt.start),
    end: new Date(evt.end || evt.start),
  }));

  // O último horário possível para iniciar uma consulta de 1h é 17:00
  const maxStartHour = WORK_END_HOUR - DURATION_HOURS;

  while (
    candidateStart.getHours() < maxStartHour ||
    (candidateStart.getHours() === maxStartHour &&
      candidateStart.getMinutes() === 0)
  ) {
    const candidateEnd = new Date(candidateStart);
    candidateEnd.setHours(candidateEnd.getHours() + DURATION_HOURS);

    // Valida sobreposição (StartA < EndB && EndA > StartB)
    const hasOverlap = parsedEvents.some(
      (evt) => candidateStart < evt.end && candidateEnd > evt.start,
    );

    if (!hasOverlap) {
      return { start: candidateStart, end: candidateEnd };
    }

    // Avança 30 minutos para tentar o próximo encaixe
    candidateStart.setMinutes(candidateStart.getMinutes() + 30);
  }

  // Fallback se o dia estiver totalmente lotado: define 08:00 às 09:00
  const fallbackStart = new Date(clickedDate);
  fallbackStart.setHours(WORK_START_HOUR, 0, 0, 0);

  const fallbackEnd = new Date(fallbackStart);
  fallbackEnd.setHours(WORK_START_HOUR + DURATION_HOURS);

  return { start: fallbackStart, end: fallbackEnd };
}
