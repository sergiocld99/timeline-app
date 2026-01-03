import { useEffect, useState } from "react";
import type { Location } from "@/types/travel";
import LocationService from "@/services/LocationService";

const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await LocationService.getAll();
      setLocations(data);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<Location>) => {
    try {
      const updatedItem = await LocationService.update(id, updates);
      setLocations(prev => prev.map(l => l._id === updatedItem._id ? updatedItem : l) )
      return updatedItem
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return { locations, error, loading, update, refetch: fetchLocations };
};

export default useLocations;
