"use client";

import type { StatByLine } from "@/types/stats";

import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type LineSortOption = "rides" | "speed" | "duration" | "km";

type NumericLineStatKey = "count" | "averageSpeed" | "totalMinutes" | "totalKm";

export const LINE_SORT_VALUE_KEYS: Record<LineSortOption, NumericLineStatKey> = {
  rides: "count",
  speed: "averageSpeed",
  duration: "totalMinutes",
  km: "totalKm",
};

export const getLineSortValue = (stat: StatByLine, option: LineSortOption): number =>
  stat[LINE_SORT_VALUE_KEYS[option]];

export const sortLines = (stats: readonly StatByLine[], option: LineSortOption): StatByLine[] => {
  // Array#sort is stable, so ties keep the backend's rides/minutes/line order.
  return [...stats].sort((a, b) => getLineSortValue(b, option) - getLineSortValue(a, option));
};

type Props = {
  value: LineSortOption;
  onValueChange: (value: LineSortOption) => void;
};

const LineSortSelector = ({ value, onValueChange }: Props) => {
  const t = useTranslations("Lines");

  const options: Array<{ value: LineSortOption; label: string }> = [
    { value: "rides", label: t("sort.rides") },
    { value: "speed", label: t("sort.speed") },
    { value: "duration", label: t("sort.duration") },
    { value: "km", label: t("sort.km") },
  ];

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <ArrowUpDown className="h-4 w-4" />
      <span className="hidden sm:inline">{t("sort.by")}</span>
      <Select value={value} onValueChange={(next) => onValueChange(next as LineSortOption)}>
        <SelectTrigger className="w-36 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
};

export default LineSortSelector;
