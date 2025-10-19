"use client";

import { useEffect, useState } from "react";
import type { Travel, TravelsData } from "@/types/travel";
import TravelService from "@/services/TravelService";
import { useDateRange } from "@/contexts/DateRangeContext";

const useTravels = () => {
  const { dateFrom, dateTo } = useDateRange();
  const [travels, setTravels] = useState<TravelsData>({ travels: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchTravels = async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true);
      const data = await TravelService.getAll(dateFrom, dateTo);
      setTravels({ travels: data, dateFrom, dateTo });
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchTravels(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  return { travels, error, loading, refetch: fetchTravels, updateTravel, deleteTravel };
};

export default useTravels;
