import type { TravelStats } from "@/types/travel";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import TravelService from "@/services/TravelService";
import { useUser } from "@/contexts/UserContext";

export const useDashQuery = () => {
  const [dateFrom, setDateFrom] = useState("");
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    const now = new Date();
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(now.getMonth() - 10);
    tenMonthsAgo.setDate(1); // Start of month
    setDateFrom(tenMonthsAgo.toISOString());
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["home_stats", dateFrom, currentUser],
    queryFn: async () => {
      if (!dateFrom) return null;
      const res = await TravelService.getAll({ 
        dateFrom, 
        userId: currentUser?.userId,
        statsOnly: true
      });
      return res.stats as TravelStats;
    },
    enabled: !!dateFrom && !userLoading,
  });

  const { data: prevData, isLoading: isPrevLoading } = useQuery({
    queryKey: ["home_stats_prev", dateFrom, currentUser],
    queryFn: async () => {
      if (!dateFrom) return null;
      
      const prevDateFrom = new Date(dateFrom);
      prevDateFrom.setFullYear(prevDateFrom.getFullYear() - 1);
      
      const prevDateTo = new Date();
      prevDateTo.setFullYear(prevDateTo.getFullYear() - 1);
      
      const res = await TravelService.getAll({ 
        dateFrom: prevDateFrom.toISOString(),
        dateTo: prevDateTo.toISOString(),
        userId: currentUser?.userId,
        statsOnly: true
      });
      return res.stats as TravelStats;
    },
    enabled: !!dateFrom && !userLoading,
  });

  return {
    data,
    prevData,
    isLoading: isLoading || isPrevLoading,
    error
  };
};
