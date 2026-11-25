"use client";

import type { StatByLine } from "@/types/stats";

import { BusFront } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import LineSortSelector, { getLineSortValue, sortLines, type LineSortOption } from "@/components/selectors/LineSortSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  stats: StatByLine[];
  selectedLine: string | null;
  onSelect: (line: string) => void;
};

const HIGH_RIDES_THRESHOLD = 6;

const LineRanking = ({ stats, selectedLine, onSelect }: Props) => {
  const t = useTranslations("Lines");
  const [sortBy, setSortBy] = useState<LineSortOption>("rides");
  const sortedStats = useMemo(() => sortLines(stats, sortBy), [stats, sortBy]);
  const maxValue = useMemo(
    () => Math.max(...stats.map(stat => getLineSortValue(stat, sortBy)), 1),
    [stats, sortBy]
  );
  const rankingTitles: Record<LineSortOption, string> = {
    rides: t("rankingTitle.rides"),
    speed: t("rankingTitle.speed"),
    duration: t("rankingTitle.duration"),
    km: t("rankingTitle.km"),
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">{rankingTitles[sortBy]}</CardTitle>
        <LineSortSelector value={sortBy} onValueChange={setSortBy} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sortedStats.map((stat, index) => {
          const isSelected = selectedLine === stat.line;
          const isHighRides = stat.count >= HIGH_RIDES_THRESHOLD;

          return (
            <button
              key={stat.line}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(stat.line)}
              className={cn(
                "w-full rounded-md border border-transparent p-3 text-left transition-colors",
                !isSelected && "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                isSelected && "ring-2 ring-blue-600"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <span className="w-5 text-xs font-normal text-gray-400">{index + 1}</span>
                  <BusFront
                    className={cn(
                      "h-4 w-4",
                      isHighRides ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                    )}
                    aria-hidden="true"
                  />
                  {stat.line}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t("rides", { count: stat.count })}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{stat.totalKm} km - {t("minutes", { minutes: stat.totalMinutes })}</span>
                <span>{t("speed", { speed: stat.averageSpeed })}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isHighRides ? "bg-green-600" : "bg-blue-600"
                  )}
                  style={{ width: `${(getLineSortValue(stat, sortBy) / maxValue) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LineRanking;
