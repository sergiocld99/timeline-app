"use client";

import type { MonthlyStats, PlacesVisited } from "@/types/travel";

import { useTranslations } from "next-intl";
import { Fragment, useMemo } from "react";

import { ACCENT1, ACCENT3 } from "@/constants/colors";
import { Link } from "@/i18n/routing";
import { calculateTopPlacesByMonths } from "@/utils/chart/monthly";
import { getMonthDateRangeSearch } from "@/utils/dateRange";

type Props = {
  monthlyStats: MonthlyStats;
  placesVisited: PlacesVisited;
  home?: string;
};

const TOP_PLACES_LIMIT = 7;

// Two ramps darkening by rank, so a cell reads both its position and its
// jurisdiction: CABA zipcodes (prefix "C") in yellow, everything else in green.
const CABA_PREFIX = "C";
const placeColors = [ACCENT3, "#3fe07a", "#38c66c", "#31ac5e", "#2a9250", "#237d43", "#1c6737"];
const cabaPlaceColors = [ACCENT1, "#cce03e", "#b4c637", "#9dac30", "#859229", "#727d23", "#5e671d"];

const getPlaceColor = (zipcode: string, rank: number) =>
  (zipcode.toUpperCase().startsWith(CABA_PREFIX) ? cabaPlaceColors : placeColors)[rank];

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

  if (ranking.length === 0) return null;

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
          {sortedMonthKeys.map(monthKey => (
            <Link
              key={monthKey}
              href={`/travels?${getMonthDateRangeSearch(monthKey)}`}
              className="text-[0.6rem] text-center font-['Space_Mono'] cursor-pointer"
              style={{ color: ACCENT3 }}
            >
              {tMonths(parseInt(monthKey.split('-')[1], 10).toString())}
            </Link>
          ))}
          {ranking.map((place, rowIndex) => (
            <Fragment key={place.zipcode}>
              <div
                className="text-[0.65rem] font-['Space_Mono'] text-[#f0f0f8] pr-2 truncate flex items-center"
                title={`${place.zipcode} - ${place.name}`}
              >
                {place.id ? (
                  <Link href={`/travels/to/${place.id}`} className="hover:underline">
                    {place.zipcode}
                  </Link>
                ) : (
                  <span>{place.zipcode}</span>
                )}
              </div>
              {sortedMonthKeys.map(monthKey => {
                const visited = place.monthKeys.includes(monthKey);

                return (
                  <div
                    key={`${place.zipcode}-${monthKey}`}
                    title={`${place.zipcode} - ${place.name} — ${monthKey}`}
                    className="h-full w-full rounded-[3px] bg-gray-700"
                    style={visited ? { backgroundColor: getPlaceColor(place.zipcode, rowIndex) } : undefined}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPlacesByMonths;
