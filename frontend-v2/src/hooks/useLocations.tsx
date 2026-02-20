import type { Location } from "@/types/travel";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import LocationService from "@/services/LocationService";

const useLocations = () => {
  const queryClient = useQueryClient();

  // 1. Fetching logic with useQuery
  const { data: locations = [], error, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: LocationService.getAll,
  });

  // 2. Update logic with useMutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Location> }) =>
      LocationService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  // 3. Delete logic with useMutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => LocationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  return {
    locations,
    error,
    loading: isLoading,
    update: async (id: string, updates: Partial<Location>) =>
      updateMutation.mutateAsync({ id, updates }),
    remove: async (id: string) =>
      removeMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['locations'] })
  };
};

export default useLocations;
