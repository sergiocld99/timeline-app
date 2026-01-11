"use client";

import { createContext, type ReactNode,useContext, useState } from 'react';

import { getStartDateFromCurrent, getTodayEndTime } from '@/utils';

interface DateRangeContextType {
  dateFrom: string;
  dateTo: string;
  updateDateRange: (dateFrom: string, dateTo: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

interface DateRangeProviderProps {
  children: ReactNode;
}

export const DateRangeProvider = ({ children }: DateRangeProviderProps) => {
  const [dateFrom, setDateFrom] = useState(getStartDateFromCurrent(30));
  const [dateTo, setDateTo] = useState(getTodayEndTime());

  const updateDateRange = (newDateFrom: string, newDateTo: string) => {
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
  };

  return (
    <DateRangeContext.Provider value={{ dateFrom, dateTo, updateDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};
