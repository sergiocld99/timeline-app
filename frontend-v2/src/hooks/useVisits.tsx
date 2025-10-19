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

  const deleteVisit = async (id: string) => {
    await VisitService.delete(id).then(() => {
      setVisits((prev) => ({...prev, visits: prev.visits.filter(visit => visit._id !== id) }));
    }).catch((error) => {
      setError(error);
      throw error;
    });
  }

  useEffect(() => {
    fetchVisits();
  }, []);

  return { visits, error, loading, refetch: fetchVisits, deleteVisit };
};

export default useVisits;
