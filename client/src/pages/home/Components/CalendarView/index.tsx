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

interface Props {
  events: CalendarEvent[];
}

export const CalendarView = forwardRef<FullCalendar, Props>(
  ({ events }, calendarRef) => {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
      null
    );
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleEventClick = (info: EventClickArg) => {
      const plainEvent = info.event.toPlainObject() as CalendarEvent;
      console.log("[CalendarView] Evento selecionado para edição:", plainEvent);

      setSelectedEvent(plainEvent);
      setSheetOpen(true);
    };

    // Função auxiliar para encontrar o próximo slot de 1h livre no dia
    function findAvailableSlot(
      clickedDate: Date,
      isAllDay: boolean,
      existingEvents: CalendarEvent[]
    ): { start: Date; end: Date } {
      const candidateStart = new Date(clickedDate);

      // Se clicou na visão mensal (allDay), inicia a busca a partir das 08:00
      if (isAllDay) {
        candidateStart.setHours(8, 0, 0, 0);
      } else {
        // Arredonda para o início da hora clicada
        candidateStart.setMinutes(0, 0, 0);
      }

      // Converte as datas dos eventos existentes para objetos Date para comparação
      const parsedEvents = existingEvents.map((evt) => ({
        start: new Date(evt.start),
        end: new Date(evt.end || evt.start),
      }));

      // Limite da agenda no dia (ex: até 20:00)
      const maxHour = 20;

      while (candidateStart.getHours() < maxHour) {
        const candidateEnd = new Date(candidateStart);
        candidateEnd.setHours(candidateEnd.getHours() + 1);

        // Verifica se há colisão (StartA < EndB && EndA > StartB)
        const hasOverlap = parsedEvents.some(
          (evt) => candidateStart < evt.end && candidateEnd > evt.start
        );

        if (!hasOverlap) {
          return { start: candidateStart, end: candidateEnd };
        }

        // Avança 30 minutos para testar o próximo horário
        candidateStart.setMinutes(candidateStart.getMinutes() + 30);
      }

      // Fallback se o dia estiver lotado: usa as 08:00 do dia clicado
      const fallbackStart = new Date(clickedDate);
      if (isAllDay) fallbackStart.setHours(8, 0, 0, 0);
      const fallbackEnd = new Date(fallbackStart);
      fallbackEnd.setHours(fallbackEnd.getHours() + 1);

      return { start: fallbackStart, end: fallbackEnd };
    }

    // Handler dentro do componente CalendarView
    const handleDateClick = (info: DateClickArg) => {
      const { start, end } = findAvailableSlot(info.date, info.allDay, events);

      const defaultPatient = {
        nome: "Matheus Pereira da Silva",
        telefone: "(85) 99999-8888",
      };

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: `Consulta - ${defaultPatient.nome}`,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        extendedProps: {
          calendar: "Consulta",
          pacienteNome: defaultPatient.nome,
          pacienteTelefone: defaultPatient.telefone,
        },
      };

      console.log("[CalendarView] Slot livre encontrado e evento criado:", newEvent);

      setSelectedEvent(newEvent);
      setSheetOpen(true);
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