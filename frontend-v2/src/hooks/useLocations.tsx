"use client";

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

  useEffect(() => {
    fetchLocations();
  }, []);

  return { locations, error, loading, refetch: fetchLocations };
};

export default useLocations;
