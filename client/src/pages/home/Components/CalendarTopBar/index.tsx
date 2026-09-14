import { Plus, Eye, EyeOff } from "lucide-react";

import type { CalendarCategory } from "@/@types/calendar.types";

export interface CalendarTopBarCategory {
  key: CalendarCategory;
  label: string;
  color: string;
  active: boolean;
  onToggle: () => void;
}

interface CalendarTopBarProps {
  categories: CalendarTopBarCategory[];
  allActive: boolean;
  onToggleAll: () => void;
  onAddEvent: () => void;
}

export function CalendarTopBar({
  categories,
  allActive,
  onToggleAll,
  onAddEvent,
}: CalendarTopBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddEvent}
          className="
            inline-flex items-center gap-2
            rounded-md border border-neutral-700
            px-3 py-1.5 text-sm
            transition hover:bg-neutral-800
          "
        >
          <Plus className="h-4 w-4" />
          Novo evento
        </button>

        <button
          onClick={onToggleAll}
          className="
            inline-flex items-center gap-2
            rounded-md border border-neutral-700
            px-3 py-1.5 text-sm
            transition hover:bg-neutral-800
          "
        >
          {allActive ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ocultar todos
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Mostrar todos
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={cat.onToggle}
            className={`
              flex items-center gap-2
              rounded-md border px-2.5 py-1.5 text-xs
              transition
              ${
                cat.active
                  ? "border-neutral-600 bg-neutral-800 text-neutral-100"
                  : "border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }
            `}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
