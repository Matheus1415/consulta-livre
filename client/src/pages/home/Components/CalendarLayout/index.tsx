import { useMemo, useRef, useState } from "react";
import type { CalendarCategory, CalendarEvent } from "@/@types/calendar.types";

import { CalendarTopBar } from "../CalendarTopBar";
import { CalendarView } from "../CalendarView";
import FullCalendar from "@fullcalendar/react";
import { categories } from "@/styles/colors/calendar";

interface Props {
  events: CalendarEvent[];
}

export function CalendarLayout({ events }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);

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

  const handleAddEvent = () => {
    console.log("Adicionar agendamento");
  };

  const toggleAllCategories = () => {
    setActiveCategories(
      activeCategories.length === ALL_CATEGORIES.length ? [] : ALL_CATEGORIES
    );
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
        />

        <div className="w-full overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl p-4">
          <CalendarView
            ref={calendarRef}
            events={filteredEvents}
          />
        </div>
      </div>
    </div>
  );
}