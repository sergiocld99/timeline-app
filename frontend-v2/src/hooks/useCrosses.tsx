import { useQuery, useQueryClient } from "@tanstack/react-query";

import CrossService from "@/services/CrossService";

const useCrosses = () => {
  const queryClient = useQueryClient();

  const { data: crosses = [], error, isLoading } = useQuery({
    queryKey: ['crosses'],
    queryFn: CrossService.getAll,
  });

  return {
    crosses,
    error,
    loading: isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['crosses'] })
  };
};

export default useCrosses;
