import type { CalendarEvent } from "@/@types/calendar.types";
import {
  EventSchema,
  type EventFormData,
} from "@/schemas/calendar/EventSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { format, startOfDay, endOfDay } from "date-fns";
import { Save, CalendarIcon, Tag, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export type CalendarCategory = "Consulta" | "Feriados" | "Bloqueio" | "Outros";

interface Props {
  data: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
}

function toLocalDateTimeString(date: Date): string {
  return date.toISOString();
}

export function CalendarEventGeneralTab({ data, onSave }: Props) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: data.title ?? "",
      start: data.start ? new Date(data.start).toISOString() : "",
      end: data.end ? new Date(data.end).toISOString() : "",
      calendar: (data.extendedProps?.calendar as CalendarCategory) ?? "Outros",
    },
  });

  const calendarType = form.watch("calendar");
  const isHoliday = calendarType === "Feriados";

  // Ajusta automaticamente para o dia todo (00:00 até 23:59) se a categoria for Feriados
  useEffect(() => {
    if (isHoliday) {
      const currentStart = form.getValues("start");
      const baseDate = currentStart && !isNaN(new Date(currentStart).getTime()) 
        ? new Date(currentStart) 
        : new Date();

      const startDate = startOfDay(baseDate);
      const endDate = endOfDay(baseDate);

      form.setValue("start", toLocalDateTimeString(startDate));
      form.setValue("end", toLocalDateTimeString(endDate));
    }
  }, [calendarType, isHoliday, form]);

  function onSubmit(values: EventFormData) {
    if (isHoliday) return;

    const payload: CalendarEvent = {
      ...data,
      title: values.title,
      start: values.start ? new Date(values.start).toISOString() : data.start,
      end: values.end ? new Date(values.end).toISOString() : data.end,
      extendedProps: {
        ...data.extendedProps,
        calendar: values.calendar,
      },
    };

    onSave(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isHoliday && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Eventos marcados como feriado não podem ser editados.</span>
          </div>
        )}

        <div className="grid gap-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título / Descrição do Evento</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isHoliday}
                      placeholder="Ex: Consulta - Maria Silva" 
                      className="bg-neutral-900 border-neutral-700 text-neutral-200 disabled:opacity-50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calendar"
              render={({ field }) => (
                <FormItem className="md:col-span-2 relative">
                  <FormLabel>Categoria do Calendário</FormLabel>
                  <Select 
                    disabled={data.extendedProps?.calendar === "Feriados"} 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none z-10" />
                        <SelectTrigger className="w-full h-11 bg-neutral-900 border border-neutral-700 rounded-xl pl-10 text-neutral-200 hover:border-neutral-600 transition-all focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 disabled:opacity-50">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </div>
                    </FormControl>

                    <SelectContent className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl text-neutral-200">
                      <SelectGroup>
                        <SelectLabel className="text-neutral-500 text-[10px] uppercase tracking-widest px-2 py-1.5">
                          Tipo de Evento
                        </SelectLabel>

                        <SelectItem value="Consulta" className="rounded-md data-[highlighted]:bg-neutral-800 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Consulta</span>
                          </div>
                        </SelectItem>

                        <SelectItem value="Feriados" className="rounded-md data-[highlighted]:bg-neutral-800 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Feriados</span>
                          </div>
                        </SelectItem>

                        <SelectItem value="Bloqueio" className="rounded-md data-[highlighted]:bg-neutral-800 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Bloqueio</span>
                          </div>
                        </SelectItem>

                        <SelectItem value="Outros" className="rounded-md data-[highlighted]:bg-neutral-800 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Outros</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {calendarType === "Consulta" && (
              <>
                <FormItem>
                  <FormLabel>Nome do Paciente</FormLabel>
                  <Input 
                    disabled={isHoliday}
                    defaultValue={data.extendedProps?.pacienteNome ?? ""} 
                    placeholder="Digite o nome do paciente" 
                    className="bg-neutral-900 border-neutral-700 text-neutral-200 disabled:opacity-50" 
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <Input 
                    disabled={isHoliday}
                    defaultValue={data.extendedProps?.pacienteTelefone ?? ""} 
                    placeholder="Digite o telefone" 
                    className="bg-neutral-900 border-neutral-700 text-neutral-200 disabled:opacity-50" 
                  />
                </FormItem>
              </>
            )}

            {calendarType === "Bloqueio" && (
              <FormItem className="md:col-span-2">
                <FormLabel>Motivo do Bloqueio</FormLabel>
                <Textarea 
                  disabled={isHoliday}
                  defaultValue={data.extendedProps?.motivo ?? ""} 
                  placeholder="Digite o motivo do bloqueio"
                  className="bg-neutral-900 border-neutral-700 text-neutral-200 min-h-[80px] resize-none disabled:opacity-50" 
                />
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="start"
              render={({ field, fieldState }) => {
                const selectedDate = field.value ? new Date(field.value) : null;
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 flex items-center gap-1.5",
                        fieldState.error && "text-red-400"
                      )}
                    >
                      Data / Hora Inicial
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild disabled={isHoliday}>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isHoliday}
                            className={cn(
                              "w-full justify-start rounded-xl border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 text-xs h-9 disabled:opacity-50",
                              fieldState.error && "border-red-500 text-red-400",
                              !field.value && "text-neutral-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-neutral-400" />
                            {selectedDate && !isNaN(selectedDate.getTime()) ? (
                              format(selectedDate, "dd/MM/yyyy HH:mm", { locale: ptBR })
                            ) : (
                              <span className="text-neutral-500">Selecione data e hora</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto border-neutral-800 bg-neutral-950 p-0 rounded-xl shadow-2xl text-neutral-200" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                            date.setHours(current.getHours(), current.getMinutes(), 0);
                            field.onChange(toLocalDateTimeString(date));
                          }}
                          locale={ptBR}
                          initialFocus
                        />

                        <div className="flex items-center justify-between border-t border-neutral-900 p-3 bg-neutral-950/50 rounded-b-xl gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Horário
                          </span>

                          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                            <Select
                              value={selectedDate && !isNaN(selectedDate.getTime()) ? String(selectedDate.getHours()).padStart(2, "0") : "00"}
                              onValueChange={(val) => {
                                const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                                const updated = new Date(current);
                                updated.setHours(Number(val));
                                field.onChange(toLocalDateTimeString(updated));
                              }}
                            >
                              <SelectTrigger className="h-7 w-[54px] bg-transparent border-none text-xs text-neutral-200 focus:ring-0 p-1 justify-center gap-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" className="max-h-[160px] w-[65px] overflow-y-auto bg-neutral-900 border-neutral-800 text-neutral-200">
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = String(i).padStart(2, "0");
                                  return (
                                    <SelectItem key={i} value={hour} className="text-xs focus:bg-neutral-800 focus:text-neutral-100">
                                      {hour}h
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            <span className="text-neutral-600 text-xs">:</span>

                            <Select
                              value={selectedDate && !isNaN(selectedDate.getTime()) ? String(selectedDate.getMinutes()).padStart(2, "0") : "00"}
                              onValueChange={(val) => {
                                const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                                const updated = new Date(current);
                                updated.setMinutes(Number(val));
                                field.onChange(toLocalDateTimeString(updated));
                              }}
                            >
                              <SelectTrigger className="h-7 w-[54px] bg-transparent border-none text-xs text-neutral-200 focus:ring-0 p-1 justify-center gap-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" className="max-h-[160px] w-[65px] overflow-y-auto bg-neutral-900 border-neutral-800 text-neutral-200">
                                {Array.from({ length: 60 }, (_, i) => {
                                  const min = String(i).padStart(2, "0");
                                  return (
                                    <SelectItem key={i} value={min} className="text-xs focus:bg-neutral-800 focus:text-neutral-100">
                                      {min}m
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field, fieldState }) => {
                const selectedDate = field.value ? new Date(field.value) : null;
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 flex items-center gap-1.5",
                        fieldState.error && "text-red-400"
                      )}
                    >
                      Data / Hora Final
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild disabled={isHoliday}>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isHoliday}
                            className={cn(
                              "w-full justify-start rounded-xl border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 text-xs h-9 disabled:opacity-50",
                              fieldState.error && "border-red-500 text-red-400",
                              !field.value && "text-neutral-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-neutral-400" />
                            {selectedDate && !isNaN(selectedDate.getTime()) ? (
                              format(selectedDate, "dd/MM/yyyy HH:mm", { locale: ptBR })
                            ) : (
                              <span className="text-neutral-500">Selecione data e hora</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto border-neutral-800 bg-neutral-950 p-0 rounded-xl shadow-2xl text-neutral-200" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                            date.setHours(current.getHours(), current.getMinutes(), 0);
                            field.onChange(toLocalDateTimeString(date));
                          }}
                          locale={ptBR}
                          initialFocus
                        />

                        <div className="flex items-center justify-between border-t border-neutral-900 p-3 bg-neutral-950/50 rounded-b-xl gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Horário
                          </span>

                          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                            <Select
                              value={selectedDate && !isNaN(selectedDate.getTime()) ? String(selectedDate.getHours()).padStart(2, "0") : "00"}
                              onValueChange={(val) => {
                                const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                                const updated = new Date(current);
                                updated.setHours(Number(val));
                                field.onChange(toLocalDateTimeString(updated));
                              }}
                            >
                              <SelectTrigger className="h-7 w-[54px] bg-transparent border-none text-xs text-neutral-200 focus:ring-0 p-1 justify-center gap-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" className="max-h-[160px] w-[65px] overflow-y-auto bg-neutral-900 border-neutral-800 text-neutral-200">
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = String(i).padStart(2, "0");
                                  return (
                                    <SelectItem key={i} value={hour} className="text-xs focus:bg-neutral-800 focus:text-neutral-100">
                                      {hour}h
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            <span className="text-neutral-600 text-xs">:</span>

                            <Select
                              value={selectedDate && !isNaN(selectedDate.getTime()) ? String(selectedDate.getMinutes()).padStart(2, "0") : "00"}
                              onValueChange={(val) => {
                                const current = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
                                const updated = new Date(current);
                                updated.setMinutes(Number(val));
                                field.onChange(toLocalDateTimeString(updated));
                              }}
                            >
                              <SelectTrigger className="h-7 w-[54px] bg-transparent border-none text-xs text-neutral-200 focus:ring-0 p-1 justify-center gap-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" className="max-h-[160px] w-[65px] overflow-y-auto bg-neutral-900 border-neutral-800 text-neutral-200">
                                {Array.from({ length: 60 }, (_, i) => {
                                  const min = String(i).padStart(2, "0");
                                  return (
                                    <SelectItem key={i} value={min} className="text-xs focus:bg-neutral-800 focus:text-neutral-100">
                                      {min}m
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isHoliday}
          className="
            w-full p-2 mt-6
            rounded-xl
            bg-neutral-800
            text-white
            font-medium
            flex items-center justify-center gap-2
            transition-all
            hover:bg-neutral-700
            active:scale-[0.98]
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <Save className="h-4 w-4" />
          Salvar alterações
        </Button>
      </form>
    </Form>
  );
}