import useSWR from "swr";
import type { ApiSuccess } from "@/http/types/ApiSuccess";
import type { ApiError } from "@/http/types/ApiErro";
import { Api } from "@/lib/axios/api";

export type CalendarCategory = "Consulta" | "Feriados" | "Bloqueio" | "Outros";

export interface Appointment {
  id: string;
  title: string;
  calendar: CalendarCategory;
  patientName: string | null;
  patientPhone: string | null;
  blockReason: string | null;
  start: string;
  end: string;
}

export interface AppointmentFilters {
  month: number;
  year: number;
}

export function useAppointments(filters: AppointmentFilters) {
  const fetcher = ({ url, params }: { url: string; params: AppointmentFilters }) =>
    Api.get(url, { params }).then((res) => res.data);

  const key =
    filters?.month && filters?.year
      ? {
          url: "/appointments",
          params: filters,
        }
      : null;

  const { data, error, isLoading, mutate } = useSWR<
    ApiSuccess<Appointment[]>,
    ApiError
  >(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
  });

  return {
    appointments: data?.data ?? [],
    error,
    isLoading,
    mutate,
  };
}