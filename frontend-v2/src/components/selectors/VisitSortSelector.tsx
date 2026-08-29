"use client";

import type { Visit } from "@/types/visit";

import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = "date" | "duration";

export const sortVisits = (visits: Visit[], option: SortOption): Visit[] => {
  if (option === "duration") {
    return [...visits].sort((a, b) => b.durationMinutes - a.durationMinutes);
  }
  return [...visits].sort((a, b) => b.arrivalTime.localeCompare(a.arrivalTime));
};

type Props = {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
};

const VisitSortSelector = ({ value, onValueChange }: Props) => {
  const t = useTranslations("Visits");

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: "date", label: t("sort.date") },
    { value: "duration", label: t("sort.duration") },
  ];

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <ArrowUpDown className="h-4 w-4" />
      <span className="hidden sm:inline">{t("sort.by")}</span>
      <Select value={value} onValueChange={(v) => onValueChange(v as SortOption)}>
        <SelectTrigger className="w-44 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
};

export default VisitSortSelector;