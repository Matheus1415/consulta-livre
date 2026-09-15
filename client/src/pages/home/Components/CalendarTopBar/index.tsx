import { Plus, Eye, EyeOff, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import type { CalendarCategory } from "@/@types/calendar.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CalendarTopBarCategory {
  key: CalendarCategory;
  label: string;
  color: string;
  active: boolean;
  onToggle: () => void;
}

export interface CurrentDateState {
  month: number;
  year: number;
}

interface CalendarTopBarProps {
  categories?: CalendarTopBarCategory[];
  allActive?: boolean;
  onToggleAll?: () => void;
  onAddEvent?: () => void;
  currentDate?: CurrentDateState;
  onDateChange?: (newDate: CurrentDateState) => void;
}

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

export function CalendarTopBar({
  categories = [],
  allActive = false,
  onToggleAll,
  onAddEvent,
  currentDate = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  onDateChange,
}: CalendarTopBarProps) {
  // Garantia contra exceções de 'undefined' no render
  const currentMonth = currentDate?.month ?? new Date().getMonth() + 1;
  const currentYearVal = currentDate?.year ?? new Date().getFullYear();

  const handleMonthChange = (value: string) => {
    onDateChange?.({
      month: Number(value),
      year: currentYearVal,
    });
  };

  const handleYearChange = (value: string) => {
    onDateChange?.({
      month: currentMonth,
      year: Number(value),
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    onDateChange?.({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 shadow-sm">
      {/* Ações Principais e Filtro de Data */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onAddEvent}
            size="sm"
            className="border border-indigo-500/30 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Novo evento
          </Button>

          <Button
            onClick={onToggleAll}
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            {allActive ? (
              <>
                <EyeOff className="mr-1.5 h-4 w-4" />
                Ocultar todos
              </>
            ) : (
              <>
                <Eye className="mr-1.5 h-4 w-4" />
                Mostrar todos
              </>
            )}
          </Button>
        </div>

        {/* Seleção Rápida de Mês/Ano (shadcn/ui) */}
        <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-1">
          <div className="flex items-center gap-1.5 px-2 text-neutral-400">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-xs font-medium">Ir para:</span>
          </div>

          <Select
            value={String(currentMonth)}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-[120px] border-neutral-700 bg-neutral-900 text-xs text-neutral-200 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="border-neutral-800 bg-neutral-900 text-neutral-200">
              {MONTHS.map((m) => (
                <SelectItem
                  key={m.value}
                  value={String(m.value)}
                  className="text-xs focus:bg-neutral-800 focus:text-white"
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(currentYearVal)}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[90px] border-neutral-700 bg-neutral-900 text-xs text-neutral-200 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="border-neutral-800 bg-neutral-900 text-neutral-200">
              {YEARS.map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  className="text-xs focus:bg-neutral-800 focus:text-white"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGoToToday}
            variant="ghost"
            size="sm"
            title="Voltar para o mês atual"
            className="h-8 border border-neutral-800 bg-neutral-800/60 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Hoje
          </Button>
        </div>
      </div>

      {/* Tags de Categorias */}
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-800/60 pt-2">
        {categories.map((cat) => (
          <Button
            key={cat.key}
            onClick={cat.onToggle}
            variant="outline"
            size="sm"
            className={`h-7 border px-2.5 text-xs font-medium transition-colors ${
              cat.active
                ? "border-neutral-600 bg-neutral-800 text-neutral-100 hover:bg-neutral-750 hover:text-white"
                : "border-neutral-800/80 bg-transparent text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
            }`}
          >
            <span
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
}