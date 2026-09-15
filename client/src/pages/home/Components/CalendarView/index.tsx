import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventResizeDoneArg,
} from "@fullcalendar/core";
import type { CalendarEvent } from "@/@types/calendar.types";

import { CalendarEventSheet } from "../CalendarEventSheet";
import { useAppointmentsCrud } from "@/http/request/useAppointmentsCrud";
import { findAvailableSlot } from "../../utils";
import { toast } from "@/components/ui/use-toast";

interface Props {
  events: CalendarEvent[];
  onDatesSet?: (dateInfo: DatesSetArg) => void;
}

export const CalendarView = forwardRef<FullCalendar, Props>(
  ({ events, onDatesSet }, ref) => {
    // 1. Ref local para o CalendarView conseguir interagir com a API do FullCalendar
    const localCalendarRef = useRef<FullCalendar>(null);

    // Repassa a ref local para a ref externa vinda do pai
    useImperativeHandle(ref, () => localCalendarRef.current as FullCalendar);

    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { appointmentCreate, appointmentEdit } = useAppointmentsCrud();

    const handleEventClick = (info: EventClickArg) => {
      const plainEvent = info.event.toPlainObject() as CalendarEvent;
      setSelectedEvent(plainEvent);
      setSheetOpen(true);
    };

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

        setSelectedEvent(createdEvent);
        setSheetOpen(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao criar agendamento",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Não foi possível criar o agendamento.",
        });
      }
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

    const handleSaveEvent = async (updatedEvent: CalendarEvent) => {
      try {
        const payload = {
          title: updatedEvent.title,
          calendar: updatedEvent.extendedProps?.calendar ?? "Outros",
          patientName: updatedEvent.extendedProps?.pacienteNome ?? null,
          patientPhone: updatedEvent.extendedProps?.pacienteTelefone ?? null,
          blockReason: updatedEvent.extendedProps?.motivo ?? null,
          start: new Date(updatedEvent.start).toISOString(),
          end: new Date(updatedEvent.end || updatedEvent.start).toISOString(),
        };

        await appointmentEdit(updatedEvent.id, payload);

        toast({
          title: "Agendamento atualizado",
          description: "As alterações foram salvas com sucesso.",
        });

        setSheetOpen(false);
        setSelectedEvent(null);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Não foi possível salvar as alterações do agendamento.",
        });
      }
    };

    const handleDeleteSuccess = (deletedId: string) => {
      const calendarApi = localCalendarRef.current?.getApi();
      const eventApi = calendarApi?.getEventById(deletedId);
      if (eventApi) {
        eventApi.remove();
      }

      setSelectedEvent(null);
      setSheetOpen(false);
    };

    return (
      <>
        <FullCalendar
          ref={localCalendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          selectable
          editable
          nowIndicator
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={() => {}}
          dateClick={handleDateClick}
          datesSet={onDatesSet}
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
          onDeleteSuccess={handleDeleteSuccess}
          onSave={handleSaveEvent}
        />
      </>
    );
  }
);

CalendarView.displayName = "CalendarView";

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div className="w-full overflow-hidden flex items-center px-1">
      <span className="fc-event-title truncate text-xs font-medium leading-tight">
        {eventInfo.event.title}
      </span>
    </div>
  );
}