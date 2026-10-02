import type { AxiosErrorResponse } from "@/types/commons";
import type { TranslationFn } from "@/types/i18n";

import { formatWallClockDate } from "@/utils/date";

type ErrorMessageResolver = (params: Record<string, unknown>, t: TranslationFn) => string;

const API_ERROR_MESSAGES: Record<string, ErrorMessageResolver> = {
  cross_has_associated_travel: (params, t) =>
    t("messages.crossHasAssociatedTravel", {
      ...params,
      date: params.date ? formatWallClockDate(String(params.date)) : params.date,
    }),
  cross_has_associated_travels: (params, t) => t("messages.crossHasAssociatedTravels", params),
};

export const getApiErrorMessage = (
  error: unknown,
  t: TranslationFn,
  fallbackKey: string,
  extraParams: Record<string, unknown> = {}
) => {
  const { message, response } = (error ?? {}) as AxiosErrorResponse;
  const data = response?.data;
  const resolveMessage = data?.code ? API_ERROR_MESSAGES[data.code] : undefined;

  if (resolveMessage) {
    return resolveMessage({ ...data?.params, ...extraParams }, t);
  }

  return data?.message || message || t(fallbackKey);
}
