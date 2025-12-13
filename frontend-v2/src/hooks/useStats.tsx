import StatsService from "@/services/StatsService";
import { StatByMode } from "@/types/stats";
import { useEffect, useState, useCallback } from "react";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useUser } from "@/contexts/UserContext";

const useStats = () => {
  const { dateFrom, dateTo } = useDateRange();
  const { currentUser } = useUser();
  const [statsByMode, setStatsByMode] = useState<StatByMode[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchByMode = useCallback(async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      const userId = currentUser?.userId;
      const data = await StatsService.getTravelStatsByMode(dateFrom, dateTo, userId);
      setStatsByMode(data);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchByMode(dateFrom, dateTo);
  }, [dateFrom, dateTo, fetchByMode]);

  return { statsByMode, error, loading, refetch: fetchByMode };
}

export default useStats;