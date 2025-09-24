"use client";

import { useEffect, useState } from "react";
import type { VisitsData } from "@/types/travel";
import VisitService from "@/services/VisitService";

const useVisits = () => {
  const [visits, setVisits] = useState<VisitsData>({ visits: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      const data = await VisitService.getAll(dateFrom, dateTo);
      setVisits({ visits: data, dateFrom, dateTo });
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  return { visits, error, loading, refetch: fetchVisits };
};

export default useVisits;
