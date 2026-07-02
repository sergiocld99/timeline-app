"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getStartDateFromCurrent, getTodayEndTime } from "@/utils";
import { parseDateRangeFromSearchParams } from "@/utils/dateRange";
import { getDaysRange } from "@/utils/date";

interface DateRangeContextType {
  dateFrom: string;
  dateTo: string;
  daysRange: number;
  updateDateRange: (dateFrom: string, dateTo: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

interface DateRangeProviderProps {
  children: ReactNode;
  initialDays?: number;
};

type UrlSyncProps = {
  setDateFrom: Dispatch<SetStateAction<string>>;
  setDateTo: Dispatch<SetStateAction<string>>;
};

const DateRangeUrlSync = ({ setDateFrom, setDateTo }: UrlSyncProps) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const parsed = parseDateRangeFromSearchParams(searchParams);
    if (!parsed) return;

    setDateFrom((current) => (current === parsed.dateFrom ? current : parsed.dateFrom));
    setDateTo((current) => (current === parsed.dateTo ? current : parsed.dateTo));
  }, [searchParams, setDateFrom, setDateTo]);

  return null;
};

export const DateRangeProvider = ({ children, initialDays = 30 }: DateRangeProviderProps) => {
  const [dateFrom, setDateFrom] = useState(getStartDateFromCurrent(initialDays));
  const [dateTo, setDateTo] = useState(getTodayEndTime());

  const updateDateRange = useCallback((newDateFrom: string, newDateTo: string) => {
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
  }, []);

  const daysRange = useMemo(() => getDaysRange(dateFrom, dateTo), [dateFrom, dateTo]);

  return (
    <DateRangeContext.Provider value={{ dateFrom, dateTo, daysRange, updateDateRange }}>
      <Suspense fallback={null}>
        <DateRangeUrlSync setDateFrom={setDateFrom} setDateTo={setDateTo} />
      </Suspense>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};
