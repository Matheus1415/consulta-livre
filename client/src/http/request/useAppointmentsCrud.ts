import { DEFAULT_API_ERROR } from "@/http/responses/default";
import type { ApiError } from "@/http/types/ApiErro";
import type { ApiSuccess } from "@/http/types/ApiSuccess";
import { Api } from "@/lib/axios/api";
import { AxiosError } from "axios";
import { mutate } from "swr";

export interface AppointmentPayload {
  title: string;
  calendar: "Consulta" | "Feriados" | "Bloqueio" | "Outros";
  start: string;
  end: string;
  patientName?: string | null;
  patientPhone?: string | null;
  blockReason?: string | null;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  isOccupied: boolean;
}

export interface AvailableSlotsData {
  date: string;
  isHoliday: boolean;
  slots: AvailableSlot[];
}

export function useAppointmentsCrud() {
  const URL_BASE = "/appointments";

  const revalidateAppointments = () => {
    mutate((key) => {
      if (typeof key === "string") {
        return key.startsWith(URL_BASE);
      }

      if (Array.isArray(key)) {
        return key[0] === URL_BASE;
      }

      if (typeof key === "object" && key !== null) {
        const swrKey = key as { url?: string };
        return swrKey.url === URL_BASE;
      }

      return false;
    });
  };

  async function appointmentCreate<T = AppointmentPayload>(
    data: AppointmentPayload,
  ): Promise<ApiSuccess<T>> {
    try {
      const response = await Api.post<ApiSuccess<T>>(URL_BASE, data);

      revalidateAppointments();

      return response.data;
    } catch (error) {
      const apiError =
        (error as AxiosError<ApiError>).response?.data ?? DEFAULT_API_ERROR;
      throw apiError;
    }
  }

  async function appointmentEdit<T = AppointmentPayload>(
    id: string | number,
    data: Partial<AppointmentPayload>,
  ): Promise<ApiSuccess<T>> {
    const URL_EDIT = `${URL_BASE}/${id}`;

    try {
      const response = await Api.put<ApiSuccess<T>>(URL_EDIT, data);

      revalidateAppointments();

      return response.data;
    } catch (error) {
      const apiError =
        (error as AxiosError<ApiError>).response?.data ?? DEFAULT_API_ERROR;
      throw apiError;
    }
  }

  async function appointmentDelete(
    id: string | number,
  ): Promise<ApiSuccess<void>> {
    const URL_DELETE = `${URL_BASE}/${id}`;

    try {
      const response = await Api.delete<ApiSuccess<void>>(URL_DELETE);

      revalidateAppointments();

      return response.data;
    } catch (error) {
      const apiError =
        (error as AxiosError<ApiError>).response?.data ?? DEFAULT_API_ERROR;
      throw apiError;
    }
  }

  async function getAvailableSlots(
    date: string,
  ): Promise<ApiSuccess<AvailableSlotsData>> {
    const URL_AVAILABLE_SLOTS = `${URL_BASE}/available-slots`;

    try {
      const response = await Api.get<ApiSuccess<AvailableSlotsData>>(
        URL_AVAILABLE_SLOTS,
        {
          params: { date },
        },
      );

      return response.data;
    } catch (error) {
      const apiError =
        (error as AxiosError<ApiError>).response?.data ?? DEFAULT_API_ERROR;
      throw apiError;
    }
  }

  return {
    appointmentCreate,
    appointmentEdit,
    appointmentDelete,
    getAvailableSlots
  };
}
