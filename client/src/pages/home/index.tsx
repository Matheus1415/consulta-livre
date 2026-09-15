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

export interface CurrentDateState {
  month: number;
  year: number;
}

export function Index() {
  const [currentDate, setCurrentDate] = useState<CurrentDateState>({
    month: new Date().getMonth() + 1, // Mês atual (1-12)
    year: new Date().getFullYear(),
  });

  const { appointments = [], isLoading } = useAppointments({
    month: currentDate.month,
    year: currentDate.year,
  });

  const events: CalendarEvent[] = (appointments ?? []).map((appointment) => ({
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

  return (
    <div className="relative">
      <CalendarLayout
        events={events}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/40">
          <span className="text-muted-foreground animate-pulse">
            Carregando agendamentos...
          </span>
        </div>
      )}
    </div>
  );
}
