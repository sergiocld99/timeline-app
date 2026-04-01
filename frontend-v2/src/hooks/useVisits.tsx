import type { Visit, VisitsData, VisitsStats } from "@/types/visit";;

import { useEffect, useState } from "react";

import { useDateRange } from "@/contexts/DateRangeContext";
import { useUser } from "@/contexts/UserContext";
import VisitService from "@/services/VisitService";

const calculateStats = (visits: Visit[]): VisitsStats => {
  const totalPercentage = 100
  const totalLat = visits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / totalPercentage;
  const totalLong = visits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / totalPercentage;

  return {
    averageLatitude: totalLat,
    averageLongitude: totalLong
  }
}

const useVisits = () => {
  const { dateFrom, dateTo } = useDateRange();
  const { currentUser, loading: userLoading } = useUser();
  const [visits, setVisits] = useState<VisitsData>({ visits: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async (dateFrom?: string, dateTo?: string, userId?: number) => {
    try {
      setLoading(true);
      // const userId = currentUser?.userId || 1;
      const data = await VisitService.getAll(dateFrom, dateTo, userId);
      setVisits({ visits: data, stats: calculateStats(data), dateFrom, dateTo });
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVisit = async (id: string) => {
    await VisitService.delete(id).then(() => {
      setVisits((prev) => ({ ...prev, visits: prev.visits.filter(visit => visit._id !== id) }));
    }).catch((error) => {
      setError(error);
      throw error;
    });
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      const updatedVisit = await VisitService.update(id, updates);
      fetchVisits(dateFrom, dateTo, currentUser?.userId);
      return updatedVisit;
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchVisits(dateFrom, dateTo, currentUser?.userId);
    }
  }, [dateFrom, dateTo, currentUser, userLoading]);

  return { visits, error, loading, refetch: fetchVisits, deleteVisit, updateVisit };
};

export default useVisits;
