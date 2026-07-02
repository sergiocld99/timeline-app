const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FORM_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const isValidFormDateTime = (value: string): boolean => {
  if (!FORM_DATETIME_PATTERN.test(value)) return false;

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;

  const date = new Date(year, month - 1, day, hours, minutes);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes
  );
};

/** Build datetime-local value without UTC conversion (toISOString shifts the day). */
export const toFormDateFromParts = (
  datePart: string,
  boundary: "start" | "end"
): string => {
  return boundary === "start" ? `${datePart}T00:00` : `${datePart}T23:59`;
};

export const parseDateParamToFormDate = (
  value: string,
  boundary: "start" | "end"
): string | null => {
  if (!value) return null;

  if (DATE_ONLY_PATTERN.test(value)) {
    return toFormDateFromParts(value, boundary);
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toUrlDateParam = (formDate: string): string => {
  return formDate.slice(0, 10);
};

export const buildDateRangeSearch = (dateFrom: string, dateTo: string): string => {
  const params = new URLSearchParams();
  params.set("dateFrom", toUrlDateParam(dateFrom));
  params.set("dateTo", toUrlDateParam(dateTo));
  return params.toString();
};

export const getMonthDateRangeSearch = (yearMonth: string): string => {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  const paddedMonth = monthStr.padStart(2, "0");

  return buildDateRangeSearch(
    `${yearStr}-${paddedMonth}-01`,
    `${yearStr}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`
  );
};

export const parseDateRangeFromSearchParams = (
  searchParams: URLSearchParams | Readonly<URLSearchParams>
): { dateFrom: string; dateTo: string } | null => {
  const fromParam = searchParams.get("dateFrom");
  const toParam = searchParams.get("dateTo");

  if (!fromParam || !toParam) return null;

  const dateFrom = parseDateParamToFormDate(fromParam, "start");
  const dateTo = parseDateParamToFormDate(toParam, "end");

  if (!dateFrom || !dateTo) return null;
  if (new Date(dateFrom) > new Date(dateTo)) return null;

  return { dateFrom, dateTo };
};

export const replaceDateRangeInUrl = (dateFrom: string, dateTo: string) => {
  if (typeof window === "undefined") return;
  const search = buildDateRangeSearch(dateFrom, dateTo);
  window.history.replaceState(null, "", `${window.location.pathname}?${search}`);
};
