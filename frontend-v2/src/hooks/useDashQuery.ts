import type { TravelStats } from "@/types/travel";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import TravelService from "@/services/TravelService";
import { EMPTY_TRAVEL_STATS } from "@/constants";
import { useUser } from "@/contexts/UserContext";

export const useDashQuery = () => {
  const { currentUser, loading: userLoading } = useUser();
  const searchParams = useSearchParams();

  // Read offset query param (defaulting to 0)
  const offset = useMemo(() => {
    const offsetParam = searchParams.get("offset");
    if (!offsetParam) return 0;
    const parsed = parseInt(offsetParam, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [searchParams]);

  // Calculate current range and previous range based on offset
  const ranges = useMemo(() => {
    const now = new Date();
    
    // Safely add/subtract months to a date to avoid overflow rollover (e.g., May 31 + 1 month -> June 30, not July 1)
    const addMonths = (date: Date, months: number): Date => {
      const result = new Date(date);
      const targetMonth = result.getMonth() + months;
      result.setDate(1); // Set to a safe day first
      result.setMonth(targetMonth);
      const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
      result.setDate(Math.min(date.getDate(), maxDay));
      return result;
    };

    const currentToDate = addMonths(now, offset);
    
    // Current period start date: 10 months before shifted 'now', start of month
    const currentFromDate = new Date(currentToDate);
    currentFromDate.setDate(1); // Set to 1st first to prevent month overflow
    currentFromDate.setMonth(currentFromDate.getMonth() - 10);
    currentFromDate.setHours(0, 0, 0, 0);

    // Previous period start and end dates: exactly 1 year prior to current period
    const prevFromDate = new Date(currentFromDate);
    prevFromDate.setFullYear(prevFromDate.getFullYear() - 1);

    const prevToDate = new Date(currentToDate);
    prevToDate.setFullYear(prevToDate.getFullYear() - 1);

    return {
      currentFrom: currentFromDate.toISOString(),
      currentTo: currentToDate.toISOString(),
      prevFrom: prevFromDate.toISOString(),
      prevTo: prevToDate.toISOString(),
    };
  }, [offset]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["home_stats", ranges.currentFrom, ranges.currentTo, currentUser],
    queryFn: async () => {
      const res = await TravelService.getDashboardStats(ranges.currentFrom, ranges.currentTo, currentUser?.userId);
      return { ...EMPTY_TRAVEL_STATS, ...res } as TravelStats;
    },
    enabled: !userLoading,
  });

  const { data: prevData, isLoading: isPrevLoading } = useQuery({
    queryKey: ["home_stats_prev", ranges.prevFrom, ranges.prevTo, currentUser],
    queryFn: async () => {
      const res = await TravelService.getDashboardStats(ranges.prevFrom, ranges.prevTo, currentUser?.userId);
      return { ...EMPTY_TRAVEL_STATS, ...res } as TravelStats;
    },
    enabled: !userLoading,
  });

  return {
    data,
    prevData,
    isLoading: isLoading || isPrevLoading,
    error,
    currentFrom: ranges.currentFrom,
    currentTo: ranges.currentTo
  };
};
