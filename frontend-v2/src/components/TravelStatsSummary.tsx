"use client";

import type { Travel, TravelStats } from "@/types/travel";

import { CalendarSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useTravelStats } from "@/hooks/useTravelStats";
import { extractDate } from "@/utils/date";

import { PointWithCopyBtn } from "./render/coordinates";

type Props = {
  travels: Travel[];
  initialStats?: TravelStats;
};

type LabeledCount = {
  label: string;
  count: number;
};

type DayCount = LabeledCount & {
  date: string;
};

const mostFrequent = <T extends LabeledCount>(entries: T[]): T | null => {
  return entries.reduce<T | null>((best, entry) => (
    !best || entry.count > best.count ? entry : best
  ), null);
};

// Same pattern as TravelTableContent's handleGoToDate: opens in a new tab so the
// user keeps the date range they had here; startTime carries Argentina wall-clock
// digits, so the date part is taken literally instead of being timezone-converted.
const handleGoToDate = (date: string) => {
  window.open(`${window.location.pathname}?dateFrom=${date}&dateTo=${date}`, '_blank');
};

const StatLabel = ({ children }: { children: string }) => (
  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{children}:</span>
);

const TravelStatsSummary = ({ travels, initialStats }: Props) => {
  const t = useTranslations("Travels");
  const tRoot = useTranslations();
  const { stats } = useTravelStats(travels, initialStats);
  const { placesVisited } = stats || {};

  // Not sourced from `stats`: the from-ids endpoint that recomputes stats on filter
  // doesn't return topRoutes/records, so these are derived straight from `travels`
  // to stay in sync with chart filters the same way the totals above do.
  const mostActiveDay = useMemo(() => {
    const zipcodesByDay = new Map<string, { label: string; zipcodes: Set<string> }>();
    travels.forEach(travel => {
      const date = travel.startTime.split('T')[0];
      const entry = zipcodesByDay.get(date) || { label: extractDate(travel.startTime, tRoot), zipcodes: new Set<string>() };
      entry.zipcodes.add(travel.origin.zipcode);
      entry.zipcodes.add(travel.destination.zipcode);
      zipcodesByDay.set(date, entry);
    });
    const entries: DayCount[] = [...zipcodesByDay.entries()].map(([date, { label, zipcodes }]) => ({ date, label, count: zipcodes.size }));
    return mostFrequent(entries);
  }, [travels, tRoot]);

  const renderCenter = ({ averageLatitude, averageLongitude }: TravelStats) => (
    <div className="flex-1 min-w-56 flex items-baseline gap-1 flex-wrap">
      <StatLabel>{t("summary.coordinates")}</StatLabel>
      <span className="font-medium text-gray-900 dark:text-white">
        <PointWithCopyBtn latitude={averageLatitude} longitude={averageLongitude} />
      </span>
    </div>
  )

  const renderPlacesCount = () => {
    const showTooltip = !!(placesVisited && placesVisited.count <= 14 && placesVisited.zipcodes.length);
    const tooltipText = showTooltip ? placesVisited.zipcodes.sort().join(", ") : undefined;

    return (
      <div className="flex-1 min-w-56 flex items-baseline gap-1">
        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.placesVisited")}</span>
        <span
          className={`font-medium text-gray-900 dark:text-white ${showTooltip ? "cursor-help border-b border-dotted border-gray-400 dark:border-gray-500" : ""}`}
          title={tooltipText}
        >
          {t("footer.placesCount", { count: placesVisited?.count || 0 })}
        </span>
      </div>
    )
  }

  const renderMostActiveDay = ({ date, label, count }: DayCount) => (
    <div className="flex-1 min-w-56 flex items-baseline gap-1">
      <StatLabel>{t("summary.mostActiveDay")}</StatLabel>
      <button
        type="button"
        onClick={() => handleGoToDate(date)}
        title={tRoot("Actions.goToDate")}
        className="inline-flex items-baseline gap-1 font-medium text-gray-900 dark:text-white hover:underline cursor-pointer"
      >
        <CalendarSearchIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 self-center" />
        {label}{" "}
        <span className="font-normal text-gray-500 dark:text-gray-400">({t("footer.placesCount", { count })})</span>
      </button>
    </div>
  )

  return (
    <div className="flex flex-wrap gap-x-8">
      {mostActiveDay && renderMostActiveDay(mostActiveDay)}
      {stats && renderCenter(stats)}
      {placesVisited?.count ? renderPlacesCount() : undefined}
    </div>
  );
};

export default TravelStatsSummary;
