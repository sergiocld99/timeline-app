"use client";

import { useEffect, useState } from "react";
import type { Visit, VisitsData, VisitsStats } from "@/types/travel";
import VisitService from "@/services/VisitService";
import { useDateRange } from "@/contexts/DateRangeContext";

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
  const [visits, setVisits] = useState<VisitsData>({ visits: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      const data = await VisitService.getAll(dateFrom, dateTo);
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
      setVisits((prev) => ({...prev, visits: prev.visits.filter(visit => visit._id !== id) }));
    }).catch((error) => {
      setError(error);
      throw error;
    });
  }

  useEffect(() => {
    fetchVisits(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  return { visits, error, loading, refetch: fetchVisits, deleteVisit };
};

export default useVisits;
