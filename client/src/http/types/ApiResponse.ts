import type { ApiError } from "./ApiErro";
import type { ApiSuccess } from "./ApiSuccess";

export type ApiResponse<DataType = unknown> = ApiSuccess<DataType> | ApiError