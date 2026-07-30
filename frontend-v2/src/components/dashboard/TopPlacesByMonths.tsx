"use client";

import type { MonthlyStats, PlacesVisited } from "@/types/travel";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { ACCENT3 } from "@/constants/colors";
import { Link } from "@/i18n/routing";
import { calculateKmOpacityCeiling, calculateTopPlacesByMonths } from "@/utils/chart/monthly";
import { toShortMonthKey } from "@/utils/date";
import { getMonthDateRangeSearch } from "@/utils/dateRange";

import PlaceRow from "./PlaceRow";

type Props = {
  monthlyStats: MonthlyStats;
  placesVisited: PlacesVisited;
  home?: string;
};

const TOP_PLACES_LIMIT = 7;

const TopPlacesByMonths = ({ monthlyStats, placesVisited, home }: Props) => {
  const t = useTranslations("Dashboard");
  const tMonths = useTranslations("MonthsShort");

  const ranking = useMemo(
    () => calculateTopPlacesByMonths(monthlyStats, placesVisited.data, home, TOP_PLACES_LIMIT),
    [monthlyStats, placesVisited, home]
  );

  const sortedMonthKeys = useMemo(
    () => Object.keys(monthlyStats).sort((a, b) => a.localeCompare(b)),
    [monthlyStats]
  );

  const fullOpacityKm = useMemo(() => calculateKmOpacityCeiling(ranking), [ranking]);

  if (ranking.length === 0) return null;

  const renderMonthHeader = (monthKey: string) => (
    <Link
      key={monthKey}
      href={`/travels?${getMonthDateRangeSearch(monthKey)}`}
      className="text-[0.6rem] text-center font-['Space_Mono'] cursor-pointer"
      style={{ color: ACCENT3 }}
    >
      {tMonths(toShortMonthKey(monthKey))}
    </Link>
  );

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#47ff88] animate-in duration-700 delay-800 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">{t("topPlacesByMonths")}</span>
        <span className="text-2xl font-extrabold text-[#47ff88]">{t("top7")}</span>
      </div>
      <div className="overflow-x-auto flex-1 min-h-0">
        <div
          className="grid gap-1 h-full"
          style={{
            gridTemplateColumns: `3.5rem repeat(${sortedMonthKeys.length}, minmax(1.25rem, 1fr))`,
            gridTemplateRows: `auto repeat(${ranking.length}, 1fr)`
          }}
        >
          <div />
          {sortedMonthKeys.map(renderMonthHeader)}
          {ranking.map((place, rank) => (
            <PlaceRow
              key={place.zipcode}
              place={place}
              rank={rank}
              monthKeys={sortedMonthKeys}
              fullOpacityKm={fullOpacityKm}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPlacesByMonths;
