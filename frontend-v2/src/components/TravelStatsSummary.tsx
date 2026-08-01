"use client";

import type { Travel, TravelStats } from "@/types/travel";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useTravelStats } from "@/hooks/useTravelStats";
import { getHoursAndMinutes } from "@/utils";
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

const mostFrequent = (entries: LabeledCount[]): LabeledCount | null => {
  return entries.reduce<LabeledCount | null>((best, entry) => (
    !best || entry.count > best.count ? entry : best
  ), null);
};

const TravelStatsSummary = ({ travels, initialStats }: Props) => {
  const t = useTranslations("Travels");
  const tRoot = useTranslations();
  const { stats } = useTravelStats(travels, initialStats);
  const {
    averageLatitude,
    averageLongitude,
    totalDistance = 0,
    totalMinutes = 0,
    placesVisited,
  } = stats || {};

  const showTooltip = !!(placesVisited && placesVisited.count <= 14 && placesVisited.zipcodes.length);
  const tooltipText = showTooltip ? placesVisited.zipcodes.sort().join(", ") : undefined;

  // Not sourced from `stats`: the from-ids endpoint that recomputes stats on filter
  // doesn't return topRoutes/records, so these are derived straight from `travels`
  // to stay in sync with chart filters the same way the totals above do.
  const mostActiveDay = useMemo(() => {
    const zipcodesByDay = new Map<string, Set<string>>();
    travels.forEach(travel => {
      const label = extractDate(travel.startTime, tRoot);
      const zipcodes = zipcodesByDay.get(label) || new Set<string>();
      zipcodes.add(travel.origin.zipcode);
      zipcodes.add(travel.destination.zipcode);
      zipcodesByDay.set(label, zipcodes);
    });
    const entries = [...zipcodesByDay.entries()].map(([label, zipcodes]) => ({ label, count: zipcodes.size }));
    return mostFrequent(entries);
  }, [travels, tRoot]);

  const topRoute = useMemo(() => {
    const counts = new Map<string, LabeledCount>();
    travels.forEach(travel => {
      const key = `${travel.origin._id}->${travel.destination._id}`;
      const label = `${travel.origin.name} → ${travel.destination.name}`;
      counts.set(key, { label, count: (counts.get(key)?.count || 0) + 1 });
    });
    return mostFrequent([...counts.values()]);
  }, [travels]);

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.placesVisited")}</div>
        <span
          className={`font-medium text-gray-900 dark:text-white ${showTooltip ? "cursor-help border-b border-dotted border-gray-400 dark:border-gray-500" : ""}`}
          title={tooltipText}
        >
          {t("footer.placesCount", { count: placesVisited?.count || 0 })}
        </span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.coordinates")}</div>
        <span className="font-medium text-gray-900 dark:text-white">
          <PointWithCopyBtn latitude={averageLatitude} longitude={averageLongitude} />
        </span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("tableHeaders.distance")}</div>
        <span className="font-medium text-gray-900 dark:text-white">{`${totalDistance.toFixed(0)} km`}</span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.time")}</div>
        <span className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</span>
      </div>
      {mostActiveDay && (
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.mostActiveDay")}</div>
          <span className="font-medium text-gray-900 dark:text-white">
            {mostActiveDay.label}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">({t("footer.placesCount", { count: mostActiveDay.count })})</span>
          </span>
        </div>
      )}
      {topRoute && topRoute.count > 1 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("summary.topRoute")}</div>
          <span className="font-medium text-gray-900 dark:text-white">
            {topRoute.label}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">({t("footer.travelsCount", { count: topRoute.count })})</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default TravelStatsSummary;
