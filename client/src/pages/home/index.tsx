import type { CalendarEvent } from "@/@types/calendar.types";
import { useState, useEffect } from "react";
import { CalendarLayout } from "./Components/CalendarLayout";

export function Index() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Definido para Setembro de 2026 (mês 8 no objeto Date, pois começa em 0)
    const year = 2026;
    const month = 8; // Setembro

    setEvents([
      {
        id: "1",
        title: "Consulta - Maria Silva",
        start: new Date(year, month, 15, 9, 0).toISOString(),
        end: new Date(year, month, 15, 10, 0).toISOString(),
        backgroundColor: "#6366f1",
        extendedProps: {
          calendar: "Consulta",
          pacienteNome: "Maria Silva",
          pacienteTelefone: "(11) 98765-4321",
          status: "confirmado",
          description: "Primeira consulta de rotina",
          priority: "high",
        },
      },
      {
        id: "2",
        title: "Consulta - João Santos",
        start: new Date(year, month, 15, 14, 0).toISOString(),
        end: new Date(year, month, 15, 15, 0).toISOString(),
        backgroundColor: "#6366f1",
        extendedProps: {
          calendar: "Consulta",
          pacienteNome: "João Santos",
          pacienteTelefone: "(11) 91234-5678",
          status: "agendado",
          description: "Retorno exames",
          priority: "medium",
        },
      },
      {
        id: "3",
        title: "Almoço / Pausa",
        start: new Date(year, month, 16, 12, 0).toISOString(),
        end: new Date(year, month, 16, 13, 0).toISOString(),
        backgroundColor: "#f43f5e",
        extendedProps: {
          calendar: "Bloqueio",
          motivo: "Horário de almoço da equipe",
          priority: "low",
        },
      },
      {
        id: "4",
        title: "Independência do Brasil (Feriado)",
        start: new Date(year, month, 7).toISOString(),
        allDay: true,
        backgroundColor: "#059669",
        extendedProps: {
          calendar: "Feriados",
          nacional: true,
          description: "Feriado nacional sincronizado (Nager.Date)",
          priority: "low",
        },
      },
    ]);
  }, []);

  return <CalendarLayout events={events} onEventsChange={setEvents} />;
}