import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarCategory, CalendarEvent } from "@/@types/calendar.types";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { categories } from "@/styles/colors/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  PlusCircle,
  Lock,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppointmentsCrud } from "@/http/request/useAppointmentsCrud";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export interface EventFormData {
  title: string;
  calendar: CalendarCategory;
  date: Date | undefined;
  time: string;
  patientName?: string;
  patientPhone?: string;
  blockReason?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (newEvent: CalendarEvent) => void;
  initialDate?: Date | null;
  existingEvents?: CalendarEvent[];
}

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 18;
const SLOT_DURATION_MINUTES = 60; // Duração de 1 hora

const availableCategories = categories.filter((c) => c.key !== "Feriados");

export function CreateAppointmentSheet({
  open,
  onClose,
  onCreated,
  initialDate,
  existingEvents = [],
}: Props) {
  const { appointmentCreate, getAvailableSlots } = useAppointmentsCrud();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<
    { time: string; available: boolean; isOccupied: boolean }[]
  >([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsHoliday, setSlotsHoliday] = useState(false);

  const form = useForm<EventFormData>({
    defaultValues: {
      title: "",
      calendar: "Consulta",
      date: undefined,
      time: "",
      patientName: "",
      patientPhone: "",
      blockReason: "",
    },
  });

  const { handleSubmit, watch, setValue, reset } = form;

  const categoryKey = watch("calendar");
  const selectedDateValue = watch("date");
  const selectedTime = watch("time");

  // Reseta o formulário ao abrir o modal
  useEffect(() => {
    if (open) {
      const baseDate = initialDate || new Date();
      const hours = String(baseDate.getHours()).padStart(2, "0");

      reset({
        title: "",
        calendar: "Consulta",
        date: baseDate,
        time: `${hours}:00`,
        patientName: "",
        patientPhone: "",
        blockReason: "",
      });
    }
  }, [open, initialDate, reset]);

  const activeCategory =
    availableCategories.find((c) => c.key === categoryKey) ||
    availableCategories[0];

  // Verifica se a data selecionada é um Feriado nos eventos existentes
  const existingHoliday = useMemo(() => {
    if (!selectedDateValue) return false;
    const dateStr = format(selectedDateValue, "yyyy-MM-dd");
    return existingEvents.some((ev) => {
      const evDate = format(new Date(ev.start), "yyyy-MM-dd");
      return evDate === dateStr && ev.extendedProps?.calendar === "Feriados";
    });
  }, [selectedDateValue, existingEvents]);

  const isHoliday = slotsHoliday || existingHoliday;

  useEffect(() => {
    if (!selectedDateValue) {
      setTimeSlots([]);
      setSlotsHoliday(false);
      return;
    }

    let cancelled = false;
    const date = format(selectedDateValue, "yyyy-MM-dd");

    setValue("time", "");
    setTimeSlots([]);
    setSlotsHoliday(false);
    setIsLoadingSlots(true);

    getAvailableSlots(date)
      .then((response) => {
        if (cancelled) return;
        setTimeSlots(response.data?.slots ?? []);
        setSlotsHoliday(response.data?.isHoliday ?? false);
      })
      .catch((error: any) => {
        if (cancelled) return;
        toast({
          variant: "destructive",
          title: "Erro ao carregar horários",
          description:
            error?.message || "Não foi possível carregar os horários disponíveis.",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDateValue]);

  const onSubmit = async (data: EventFormData) => {
    if (!data.date || !data.time) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Selecione a data e o horário para o agendamento.",
      });
      return;
    }

    const dateStr = format(data.date, "yyyy-MM-dd");
    const startDate = new Date(`${dateStr}T${data.time}:00`);
    const endDate = new Date(
      startDate.getTime() + SLOT_DURATION_MINUTES * 60 * 1000
    );

    let title = data.title.trim();
    if (!title) {
      if (data.calendar === "Consulta") {
        title = `Consulta - ${data.patientName || "Cliente"}`;
      } else if (data.calendar === "Bloqueio") {
        title = `Bloqueio: ${data.blockReason || "Indisponível"}`;
      } else {
        title = "Novo Evento";
      }
    }

    const payload = {
      title,
      calendar: data.calendar,
      patientName: data.patientName || null,
      patientPhone: data.patientPhone || null,
      blockReason: data.blockReason || null,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };

    setIsSubmitting(true);

    try {
      const response = await appointmentCreate(payload);

      const createdEvent: CalendarEvent = {
        id: response.data?.id || String(Date.now()),
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

      toast({
        title: "Agendamento criado com sucesso!",
        description: `Agendado para ${format(data.date, "dd/MM/yyyy")} às ${data.time} (Duração: 1h).`,
      });

      onCreated(createdEvent);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar o agendamento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-neutral-950 border-neutral-800 text-white overflow-y-auto px-6 py-6 flex flex-col justify-between">
        <div>
          <SheetHeader className="space-y-4 px-1">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 shrink-0"
                style={{
                  backgroundColor: `${activeCategory.color}15`,
                  border: `1px solid ${activeCategory.color}30`,
                }}
              >
                <activeCategory.icon
                  className="h-7 w-7"
                  style={{ color: activeCategory.color }}
                />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <SheetTitle className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                  Novo Agendamento
                </SheetTitle>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border bg-neutral-900"
                    style={{
                      color: activeCategory.color,
                      borderColor: `${activeCategory.color}40`,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activeCategory.color }}
                    />
                    {activeCategory.label}
                  </span>
                </div>
              </div>
            </div>

            <SheetDescription className="text-sm text-neutral-400 leading-relaxed">
              Preencha os dados e escolha um horário disponível de 1 hora para cadastrar o agendamento.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              id="create-appointment-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-1 space-y-5 mt-6"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium text-neutral-300">
                      Data do Atendimento
                    </FormLabel>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start rounded-xl border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 text-xs h-9",
                              fieldState.error && "border-red-500 text-red-400",
                              !field.value && "text-neutral-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-neutral-400" />
                            {field.value && !isNaN(new Date(field.value).getTime()) ? (
                              format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span className="text-neutral-500">Selecione uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0 bg-neutral-900 border-neutral-800 text-white" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(newDate) => {
                            field.onChange(newDate);
                            setIsCalendarOpen(false);
                          }}
                          locale={ptBR}
                          className="rounded-md border-neutral-800"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isHoliday && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Esta data é um feriado cadastrado. Selecione outra data para agendar.</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-400" /> Título do Agendamento
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isHoliday}
                        placeholder="Ex: Consulta Médica, Retorno, Bloqueio..."
                        className="w-full bg-neutral-900 border-neutral-800 text-white focus:ring-neutral-700 placeholder:text-neutral-500 disabled:opacity-50"
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
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-medium text-neutral-300">
                      Tipo de Agendamento
                    </FormLabel>
                    <Select
                      disabled={isHoliday}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as CalendarCategory)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white focus:ring-neutral-700 disabled:opacity-50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full bg-neutral-900 border-neutral-800 text-white">
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat.key} value={cat.key}>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" /> Horários Disponíveis
                  </Label>
                  <span className="text-[11px] text-neutral-500">
                    Grade de 1 hora
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 p-2 bg-neutral-900/50 rounded-xl border border-neutral-800 max-h-48 overflow-y-auto">
                  {isLoadingSlots ? (
                    <p className="col-span-4 text-xs text-neutral-500 text-center py-4">
                      Carregando horários disponíveis...
                    </p>
                  ) : timeSlots.length === 0 ? (
                    <p className="col-span-4 text-xs text-neutral-500 text-center py-4">
                      {isHoliday
                        ? "Nenhum horário disponível em feriados."
                        : "Selecione uma data para visualizar os horários."}
                    </p>
                  ) : (
                    timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isOccupied || isHoliday}
                          onClick={() => setValue("time", slot.time)}
                          className={`
                            flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all
                            ${
                              slot.isOccupied || isHoliday
                                ? "bg-neutral-900/40 text-neutral-600 border border-neutral-850 cursor-not-allowed line-through"
                                : isSelected
                                ? "bg-white text-black font-semibold shadow-md border border-white"
                                : "bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 hover:bg-neutral-700 hover:text-white"
                            }
                          `}
                        >
                          {slot.isOccupied ? (
                            <Lock className="w-3 h-3 text-neutral-600 shrink-0" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-3 h-3 text-black shrink-0" />
                          ) : null}
                          {slot.time}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center gap-4 px-1 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-neutral-700" />
                    <span>Livre</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-neutral-900 border border-neutral-700" />
                    <span className="text-neutral-500">Ocupado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span className="text-white font-medium">Selecionado</span>
                  </div>
                </div>
              </div>

              {categoryKey === "Bloqueio" ? (
                <FormField
                  control={form.control}
                  name="blockReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-neutral-300">
                        Motivo do Bloqueio
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isHoliday}
                          placeholder="Ex: Almoço, Reunião Externa, Imprevisto"
                          className="w-full bg-neutral-900 border-neutral-800 text-white disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-neutral-400" /> Nome do Paciente / Cliente
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isHoliday}
                            placeholder="Nome completo"
                            className="w-full bg-neutral-900 border-neutral-800 text-white disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" /> Telefone / WhatsApp
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isHoliday}
                            placeholder="(00) 00000-0000"
                            className="w-full bg-neutral-900 border-neutral-800 text-white disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </div>

        <SheetFooter className="pt-4 mt-6 border-t border-neutral-800 flex flex-row items-center justify-end gap-2 px-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="create-appointment-form"
            disabled={isSubmitting || !selectedTime || isHoliday}
            className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 font-medium disabled:opacity-50"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? "Criando..." : "Criar Agendamento"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
