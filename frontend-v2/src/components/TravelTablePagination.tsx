"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
};

const getPageNumbers = (page: number, totalPages: number): Array<number | "ellipsis"> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const result: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) result.push("ellipsis");
  for (let p = start; p <= end; p++) result.push(p);
  if (end < totalPages - 1) result.push("ellipsis");
  result.push(totalPages);

  return result;
};

const TravelTablePagination = ({ page, totalPages, totalItems, pageSize, onPrev, onNext, onGoToPage }: Props) => {
  const t = useTranslations("Travels.pagination");

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t("showing", { from, to, total: totalItems })}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={page <= 1}
          aria-label={t("previous")}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers(page, totalPages).map((pageNumber, idx) =>
          pageNumber === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-gray-400 dark:text-gray-500">
              …
            </span>
          ) : (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "outline"}
              size="icon"
              onClick={() => onGoToPage(pageNumber)}
              aria-label={t("goToPage", { page: pageNumber })}
              className="h-8 w-8 text-sm"
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={page >= totalPages}
          aria-label={t("next")}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TravelTablePagination;