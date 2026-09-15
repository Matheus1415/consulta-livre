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
      setSelectedEvent(plainEvent);
      setSheetOpen(true);
    };

    const handleDateClick = (info: DateClickArg) => {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: "Novo evento",
        start: info.dateStr,
        allDay: info.allDay,
        extendedProps: {
          calendar: "Outros",
          priority: "low",
        },
      };
    };

    const handleEventDrop = (info: EventDropArg) => {
      const { event } = info;
    };

    const handleEventResize = (info: EventResizeDoneArg) => {
      const { event } = info;
    };

    const handleSaveEvent = (updatedEvent: CalendarEvent) => {
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
