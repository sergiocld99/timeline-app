import type { AxiosErrorResponse } from "@/types/commons";
import type { TranslationFn } from "@/types/i18n";

const API_ERROR_MESSAGE_KEYS: Record<string, string> = {
  cross_has_associated_travel: "messages.crossHasAssociatedTravel",
  cross_has_associated_travels: "messages.crossHasAssociatedTravels",
};

export const getApiErrorMessage = (
  error: unknown,
  t: TranslationFn,
  fallbackKey: string,
  extraParams: Record<string, unknown> = {}
) => {
  const { message, response } = (error ?? {}) as AxiosErrorResponse;
  const data = response?.data;
  const messageKey = data?.code ? API_ERROR_MESSAGE_KEYS[data.code] : undefined;

  if (messageKey) {
    return t(messageKey, { ...data?.params, ...extraParams });
  }

  return data?.message || message || t(fallbackKey);
}
