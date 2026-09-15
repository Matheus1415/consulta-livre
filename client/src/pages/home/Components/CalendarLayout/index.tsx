import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { CalendarCategory, CalendarEvent } from "@/@types/calendar.types";

import { CalendarTopBar } from "../CalendarTopBar";
import { CalendarView } from "../CalendarView";
import FullCalendar from "@fullcalendar/react";
import { categories } from "@/styles/colors/calendar";
import { CreateAppointmentSheet } from "../CreateAppointmentSheet";

export interface CurrentDateState {
  month: number;
  year: number;
}

interface Props {
  events: CalendarEvent[];
  currentDate: CurrentDateState;
  setCurrentDate: Dispatch<SetStateAction<CurrentDateState>>;
}

export function CalendarLayout({
  events,
  currentDate,
  setCurrentDate,
}: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);

  // Estado para controlar a visibilidade da Sheet de Criação a partir da TopBar
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const ALL_CATEGORIES: CalendarCategory[] = [
    "Consulta",
    "Feriados",
    "Bloqueio",
    "Outros",
  ];

  const [activeCategories, setActiveCategories] =
    useState<CalendarCategory[]>(ALL_CATEGORIES);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      activeCategories.includes(event.extendedProps.calendar)
    );
  }, [events, activeCategories]);

  const toggleCategory = (category: CalendarCategory) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Abre o modal de criação ao clicar no botão da TopBar
  const handleAddEvent = () => {
    setIsCreateOpen(true);
  };

  const handleCreatedSuccess = (newEvent: CalendarEvent) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().addEvent(newEvent);
    }
  };

  const toggleAllCategories = () => {
    setActiveCategories(
      activeCategories.length === ALL_CATEGORIES.length ? [] : ALL_CATEGORIES
    );
  };

  // Disparado quando o usuário altera o mês/ano pelos Selects da TopBar
  const handleDateChange = (newDate: CurrentDateState) => {
    setCurrentDate(newDate);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const monthStr = String(newDate.month).padStart(2, "0");
      calendarApi.gotoDate(`${newDate.year}-${monthStr}-01`);
    }
  };

  // Disparado quando o usuário navega usando as setas do próprio FullCalendar (prev/next/today)
  const handleDatesSet = (dateInfo: { view: { currentStart: Date } }) => {
    const viewDate = dateInfo.view.currentStart;
    const newMonth = viewDate.getMonth() + 1;
    const newYear = viewDate.getFullYear();

    setCurrentDate((prev) => {
      if (prev.month === newMonth && prev.year === newYear) return prev;
      return { month: newMonth, year: newYear };
    });
  };

  return (
    <div className="flex flex-col w-full py-6 px-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Agenda da Clínica
          </h1>
          <p className="text-sm text-neutral-400 max-w-3xl">
            Gerencie os horários de atendimento, visualize as consultas agendadas,
            acompanhe os feriados nacionais sincronizados e controle os bloqueios de horário.
          </p>
        </div>

        <CalendarTopBar
          onAddEvent={handleAddEvent}
          onToggleAll={toggleAllCategories}
          allActive={activeCategories.length === ALL_CATEGORIES.length}
          categories={categories.map((cat) => ({
            ...cat,
            active: activeCategories.includes(cat.key),
            onToggle: () => toggleCategory(cat.key),
          }))}
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />

        <div className="w-full overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl p-4">
          <CalendarView
            ref={calendarRef}
            events={filteredEvents}
            onDatesSet={handleDatesSet}
          />
        </div>
      </div>

      <CreateAppointmentSheet
        open={isCreateOpen}
        existingEvents={events}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreatedSuccess}
      />
    </div>
  );
}