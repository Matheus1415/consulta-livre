import { useState } from "react";
import type { CalendarCategory, CalendarEvent } from "@/@types/calendar.types";
import { CalendarLayout } from "./Components/CalendarLayout";
import { useAppointments } from "@/http/request/useAppointments";

const CATEGORY_COLORS: Record<CalendarCategory, string> = {
  Consulta: "#6366f1", 
  Bloqueio: "#f43f5e", 
  Feriados: "#059669",
  Outros: "#6b7280", 
};

export function Index() {
  const [currentDate, setCurrentDate] = useState({
    month: 9,
    year: 2026,
  });

  const { appointments, isLoading } = useAppointments({
    month: currentDate.month,
    year: currentDate.year,
  });

  const events: CalendarEvent[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.start,
    end: appointment.end,
    backgroundColor: CATEGORY_COLORS[appointment.calendar] ?? CATEGORY_COLORS.Outros,
    extendedProps: {
      calendar: appointment.calendar,
      pacienteNome: appointment.patientName,
      pacienteTelefone: appointment.patientPhone,
      motivo: appointment.blockReason,
    },
  }));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground animate-pulse">
          Carregando agendamentos...
        </span>
      </div>
    );
  }

  return <CalendarLayout events={events} />;
}