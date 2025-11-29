"use client";

import { useEffect, useState, useCallback } from "react";
import type { Travel, TravelsData } from "@/types/travel";
import TravelService from "@/services/TravelService";
import { useDateRange } from "@/contexts/DateRangeContext";

const useTravels = (sortingField = 'duration') => {
  const { dateFrom, dateTo } = useDateRange();
  const [travels, setTravels] = useState<TravelsData>({ travels: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback((crossIdArr?: string[]) => {
    setLoading(true);

    TravelService.getAll(dateFrom, dateTo, crossIdArr, sortingField).then(data => {
      setTravels({ ...data, dateFrom, dateTo })
      setError(null)
      setLoading(false)
    }).catch(err => {
      setError(err)
      setLoading(false)
    })
  }, [dateFrom, dateTo, sortingField]);

  const updateTravel = async (id: string, updates: Partial<Travel>) => {
    try {
      const updatedTravel = await TravelService.update(id, updates);
      setTravels(prev => ({
        ...prev,
        travels: prev.travels.map(travel => travel._id === updatedTravel._id ? {
          ...travel,
          ...updatedTravel
        } : travel)
      }))
      return updatedTravel
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  const deleteTravel = async (id: string) => {
    try {
      await TravelService.delete(id);
      setTravels(prev => ({ ...prev, travels: prev.travels.filter(travel => travel._id !== id) }));
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    refetch();
  }, [dateFrom, dateTo, refetch]);

  return { travels, error, loading, refetch, updateTravel, deleteTravel };
};

export default useTravels;
