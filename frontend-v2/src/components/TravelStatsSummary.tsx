"use client";

import type { Travel, TravelStats } from "@/types/travel";

import { useTranslations } from "next-intl";

import { useTravelStats } from "@/hooks/useTravelStats";
import { getHoursAndMinutes } from "@/utils";

import { PointWithCopyBtn } from "./render/coordinates";

type Props = {
  travels: Travel[];
  initialStats?: TravelStats;
};

const TravelStatsSummary = ({ travels, initialStats }: Props) => {
  const t = useTranslations("Travels");
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
    </div>
  );
};

export default TravelStatsSummary;
