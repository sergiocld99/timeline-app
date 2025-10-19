import StatsService from "@/services/StatsService";
import { StatByMode } from "@/types/stats";
import { useEffect, useState } from "react";
import { useDateRange } from "@/contexts/DateRangeContext";

const useStats = () => {
  const { dateFrom, dateTo } = useDateRange();
  const [statsByMode, setStatsByMode] = useState<StatByMode[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchByMode = async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      const data = await StatsService.getTravelStatsByMode(dateFrom, dateTo);
      setStatsByMode(data);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchByMode(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  return { statsByMode, error, loading, refetch: fetchByMode };
}

export default useStats;