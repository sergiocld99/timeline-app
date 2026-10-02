import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import CrossService from "@/services/CrossService";

const useCrosses = () => {
  const queryClient = useQueryClient();

  const { data: crosses = [], error, isLoading } = useQuery({
    queryKey: ['crosses'],
    queryFn: CrossService.getAll,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => CrossService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crosses'] });
    },
  });

  return {
    crosses,
    error,
    loading: isLoading,
    remove: async (id: string) =>
      removeMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['crosses'] })
  };
};

export default useCrosses;
