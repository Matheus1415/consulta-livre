import { Api } from "../axios/api";
import { AxiosError } from "axios";
import { DEFAULT_API_ERROR } from "@/http/responses/default";
import type { ApiResponse } from "@/http/types/ApiResponse";
import type { ApiError } from "@/http/types/ApiErro";
import { isApiError } from "@/utils/typeGuards";

export const fetcher = async (url: string) => {
    try {
        const response = await Api.get<ApiResponse>(url)
        return response.data;
    } catch (error) {
        const axiosError: ApiError = (error as AxiosError<ApiError>).response?.data ?? DEFAULT_API_ERROR;
        throw axiosError;
    }
}

export const blobFetcher = async (url: string) => {
    try {
        const response = await Api.get<Blob>(url, {
            responseType: 'blob'
        })
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<Blob>;
    
        // Se o erro veio como Blob mas é um JSON do backend
        if (axiosError.response?.data instanceof Blob) {
            const text = await axiosError.response.data.text();

            const apiError: ApiError = JSON.parse(text);

            if (isApiError(apiError)) {
                throw apiError;
            }
        }

        // Se não for Blob, usa o erro padrão
        const apiError: ApiError =
            (axiosError.response?.data as unknown as ApiError) ?? DEFAULT_API_ERROR;
            
        throw apiError;
    }
}