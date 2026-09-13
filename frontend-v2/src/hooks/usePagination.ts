import { useEffect, useMemo, useState } from "react";

const usePagination = <T,>(items: readonly T[], pageSize = 50) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const goToPage = (target: number) => {
    setPage(Math.min(Math.max(1, target), totalPages));
  };

  return {
    page,
    pageSize,
    totalPages,
    pageItems,
    goToPage,
    next: () => goToPage(page + 1),
    prev: () => goToPage(page - 1),
  };
};

export default usePagination;