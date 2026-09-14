import type { CalendarEvent } from "@/@types/calendar.types";
import {
  CalendarCheck,
  CalendarOff,
  Clock,
  Phone,
  User,
  ClipboardList,
} from "lucide-react";

interface Props {
  data: CalendarEvent;
}

export function CalendarEventMetaTab({ data }: Props) {
  const title = data?.title ?? "Evento";
  const props = data?.extendedProps;
  const calendarType = props?.calendar ?? "Outros";

  return (
    <div className="grid gap-4 py-4 overflow-hidden">
      <table className="w-full text-sm text-neutral-300">
        <tbody className="divide-y divide-neutral-800">
          <tr>
            <td className="px-3 py-2 flex items-center gap-2 text-neutral-400">
              <ClipboardList className="h-4 w-4 text-indigo-400" />
              Título
            </td>
            <td className="px-3 py-2 font-medium text-neutral-100">
              {title}
            </td>
          </tr>

          {calendarType === "Consulta" && (
            <>
              {props.pacienteNome && (
                <tr>
                  <td className="px-3 py-2 flex items-center gap-2 text-neutral-400">
                    <User className="h-4 w-4 text-indigo-400" />
                    Paciente
                  </td>
                  <td className="px-3 py-2 font-medium text-neutral-100">
                    {props.pacienteNome}
                  </td>
                </tr>
              )}

              {props.pacienteTelefone && (
                <tr>
                  <td className="px-3 py-2 flex items-center gap-2 text-neutral-400">
                    <Phone className="h-4 w-4 text-indigo-400" />
                    Telefone
                  </td>
                  <td className="px-3 py-2 text-neutral-300">
                    {props.pacienteTelefone}
                  </td>
                </tr>
              )}
            </>
          )}

          {calendarType === "Bloqueio" && props.motivo && (
            <tr>
              <td className="px-3 py-2 flex items-center gap-2 text-neutral-400">
                <Clock className="h-4 w-4 text-rose-400" />
                Motivo do Bloqueio
              </td>
              <td className="px-3 py-2 text-neutral-300">
                {props.motivo}
              </td>
            </tr>
          )}

          {calendarType === "Feriados" && (
            <tr>
              <td className="px-3 py-2 flex items-center gap-2 text-neutral-400">
                <CalendarOff className="h-4 w-4 text-emerald-400" />
                Tipo de Feriado
              </td>
              <td className="px-3 py-2 text-neutral-300">
                {props.nacional ? "Feriado Nacional (API Nager.Date)" : "Feriado Local"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}