import type { Travel, TravelsData } from "@/types/travel";

import { useCallback, useEffect, useState } from "react";

import { useDateRange } from "@/contexts/DateRangeContext";
import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService";

const useTravels = (sortingField = 'duration', locFrom = '', locTo = '') => {
  const { dateFrom, dateTo } = useDateRange();
  const { currentUser, loading: userLoading } = useUser();
  const [travels, setTravels] = useState<TravelsData>({ travels: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback((crossIds?: string[]) => {
    setLoading(true);
    const userId = currentUser?.userId;

    TravelService.getAll({ dateFrom, dateTo, crossIds, sortingField, userId, locFrom, locTo }).then(data => {
      setTravels({ ...data, dateFrom, dateTo })
      setError(null)
      setLoading(false)
    }).catch(err => {
      setError(err)
      setLoading(false)
    })
  }, [dateFrom, dateTo, sortingField, currentUser, locFrom, locTo]);

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
    if (!userLoading) {
      refetch();
    }
  }, [dateFrom, dateTo, refetch, userLoading]);

  return { travels, error, loading, refetch, updateTravel, deleteTravel };
};

export default useTravels;
