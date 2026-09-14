import type { CalendarCategory } from "@/@types/calendar.types";
import {
  CalendarCheck,
  CalendarOff,
  Clock,
  MoreHorizontal,
} from "lucide-react";

export const categories = [
  {
    key: "Consulta",
    label: "Consultas",
    color: "#6366f1",
    className: "fc-bg-consulta",
    icon: CalendarCheck,
  },
  {
    key: "Feriados",
    label: "Feriados",
    color: "#059669",
    className: "fc-bg-feriados",
    icon: CalendarOff,
  },
  {
    key: "Bloqueio",
    label: "Horário Bloqueado",
    color: "#f43f5e",
    className: "fc-bg-bloqueio",
    icon: Clock,
  },
  {
    key: "Outros",
    label: "Outros",
    color: "#94a3b8",
    className: "fc-bg-outros",
    icon: MoreHorizontal,
  },
] as const satisfies readonly {
  key: CalendarCategory;
  label: string;
  color: string;
  className: string;
  icon: React.ElementType;
}[];