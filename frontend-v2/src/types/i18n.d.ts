export type TranslationFn = (key: string, values?: Record<string, any>) => string;

export type DateFormatter = {
  dateTime(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
};
