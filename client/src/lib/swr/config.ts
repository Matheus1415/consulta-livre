import type { SWRConfiguration } from "swr";
import { fetcher } from "./fetcher";

export const SwrOptions: SWRConfiguration = {
  fetcher: fetcher,
  shouldRetryOnError: false
}