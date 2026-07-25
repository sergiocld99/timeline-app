"use client";

import type { ReactNode } from "react";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getStartDateFromCurrent, getTodayEndTime } from "@/utils";
import { parseDateRangeFromSearchParams } from "@/utils/dateRange";
import { getDaysRange } from "@/utils/date";

type DateRangeContextType = {
  dateFrom: string;
  dateTo: string;
  daysRange: number;
  updateDateRange: (dateFrom: string, dateTo: string) => void;
  resetDateRange: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

type DateRangeProviderProps = {
  children: ReactNode;
  initialDays?: number;
};

const DateRangeProviderInner = ({ children, initialDays = 30 }: DateRangeProviderProps) => {
  const searchParams = useSearchParams();

  // Lazy init reads the URL on the very first render (SSR included, since these
  // routes are already dynamic), so the first fetch already uses the right range
  // instead of defaults-then-correct via a post-mount effect (which caused a
  // double fetch + double map/stats animation when dateFrom/dateTo were in the URL).
  const [dateFrom, setDateFrom] = useState(
    () => parseDateRangeFromSearchParams(searchParams)?.dateFrom ?? getStartDateFromCurrent(initialDays)
  );
  const [dateTo, setDateTo] = useState(
    () => parseDateRangeFromSearchParams(searchParams)?.dateTo ?? getTodayEndTime()
  );

  const updateDateRange = useCallback((newDateFrom: string, newDateTo: string) => {
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
  }, []);

  const resetDateRange = useCallback(() => {
    setDateFrom(getStartDateFromCurrent(initialDays));
    setDateTo(getTodayEndTime());
  }, [initialDays]);

  // Only reacts to subsequent client-side navigations that change the URL's
  // dateFrom/dateTo without remounting the provider (e.g. dashboard chart links).
  useEffect(() => {
    const parsed = parseDateRangeFromSearchParams(searchParams);
    if (!parsed) return;

    setDateFrom((current) => (current === parsed.dateFrom ? current : parsed.dateFrom));
    setDateTo((current) => (current === parsed.dateTo ? current : parsed.dateTo));
  }, [searchParams]);

  const daysRange = useMemo(() => getDaysRange(dateFrom, dateTo), [dateFrom, dateTo]);

  return (
    <DateRangeContext.Provider value={{ dateFrom, dateTo, daysRange, updateDateRange, resetDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const DateRangeProvider = (props: DateRangeProviderProps) => (
  <Suspense fallback={null}>
    <DateRangeProviderInner {...props} />
  </Suspense>
);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};
