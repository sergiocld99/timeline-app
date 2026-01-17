import type { Cross } from "@/types/cross";

import { useEffect, useState } from "react";

import CrossService from "@/services/CrossService";

const useCrosses = () => {
  const [crosses, setCrosses] = useState<Cross[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);

    CrossService.getAll().then((data) => {
      setCrosses(data);
      setError(null);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    })
  };

  useEffect(() => {
    refetch();
  }, []);

  return { crosses, error, loading, refetch };
};

export default useCrosses;
