import { forwardRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

import type {
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
} from "@fullcalendar/core";
import type { CalendarEvent } from "@/@types/calendar.types";

import { CalendarEventSheet } from "../CalendarEventSheet";
import { useAppointmentsCrud } from "@/http/request/useAppointmentsCrud";
import { findAvailableSlot } from "../../utils";

interface Props {
  events: CalendarEvent[];
}

export const CalendarView = forwardRef<FullCalendar, Props>(
  ({ events }, calendarRef) => {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
      null
    );

    const { appointmentCreate } = useAppointmentsCrud();
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleEventClick = (info: EventClickArg) => {
      const plainEvent = info.event.toPlainObject() as CalendarEvent;
      console.log("[CalendarView] Evento selecionado para edição:", plainEvent);

      setSelectedEvent(plainEvent);
      setSheetOpen(true);
    };

    // Handler de novo evento
    const handleDateClick = async (info: DateClickArg) => {
      const { start, end } = findAvailableSlot(info.date, info.allDay, events);

      const defaultPatient = {
        nome: "Matheus Pereira da Silva",
        telefone: "(85) 99999-8888",
      };

      const payload = {
        title: `Consulta - ${defaultPatient.nome}`,
        calendar: "Consulta" as const,
        patientName: defaultPatient.nome,
        patientPhone: defaultPatient.telefone,
        blockReason: null,
        start: start.toISOString(),
        end: end.toISOString(),
      };

      try {
        const response = await appointmentCreate(payload);

        const createdEvent: CalendarEvent = {
          id: response.data.id,
          title: payload.title,
          start: payload.start,
          end: payload.end,
          allDay: false,
          extendedProps: {
            calendar: payload.calendar,
            pacienteNome: payload.patientName,
            pacienteTelefone: payload.patientPhone,
            motivo: payload.blockReason,
          },
        };

        // Atualiza o evento e abre o modal
        setSelectedEvent(createdEvent);
        setSheetOpen(true);
      } catch (error) { }
    };

    const handleEventDrop = (info: EventDropArg) => {
      const updatedEvent = info.event.toPlainObject() as CalendarEvent;
      console.log("[CalendarView] Evento movido (Drop):", {
        id: updatedEvent.id,
        title: updatedEvent.title,
        newStart: info.event.startStr,
        newEnd: info.event.endStr,
        event: updatedEvent,
      });
    };

    const handleEventResize = (info: EventResizeDoneArg) => {
      const updatedEvent = info.event.toPlainObject() as CalendarEvent;
      console.log("[CalendarView] Evento redimensionado (Resize):", {
        id: updatedEvent.id,
        title: updatedEvent.title,
        newStart: info.event.startStr,
        newEnd: info.event.endStr,
        event: updatedEvent,
      });
    };

    const handleSaveEvent = (updatedEvent: CalendarEvent) => {
      console.log("[CalendarView] Evento salvo/enviado pelo Sheet:", updatedEvent);
      setSheetOpen(false);
      setSelectedEvent(null);
    };

    return (
      <>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          selectable
          editable
          nowIndicator
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          dateClick={handleDateClick}
          dayMaxEvents={true}
          eventDisplay="block"
          displayEventTime={false}
          eventClassNames={(arg) => {
            const rawCategory = arg.event.extendedProps.calendar || "Outros";
            const normalized = rawCategory.toLowerCase();
            return [`fc-bg-${normalized}`];
          }}
          headerToolbar={{
            left: "prev,next title",
            center: "",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventContent={renderEventContent}
        />

        <CalendarEventSheet
          open={sheetOpen}
          event={selectedEvent}
          onClose={() => {
            setSheetOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      </>
    );
  }
);

CalendarView.displayName = "CalendarView";

function renderEventContent(eventInfo: any) {
  return (
    <div className="w-full overflow-hidden flex items-center px-1">
      <span className="fc-event-title truncate text-xs font-medium leading-tight">
        {eventInfo.event.title}
      </span>
    </div>
  );
}