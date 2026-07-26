"use client";

import type { PlaceMonthRanking } from "@/types/travel";

import { ACCENT1, ACCENT3 } from "@/constants/colors";
import { Link } from "@/i18n/routing";
import { getCellOpacity } from "@/utils/chart";

type Props = {
  place: PlaceMonthRanking;
  rank: number;
  monthKeys: string[];
  fullOpacityKm: number;
};

// Two ramps darkening by rank, so a cell reads both its position and its
// jurisdiction: CABA zipcodes (prefix "C") in yellow, everything else in green.
const CABA_PREFIX = "C";
const placeColors = [ACCENT3, "#3fe07a", "#38c66c", "#31ac5e", "#2a9250", "#237d43", "#1c6737"];
const cabaPlaceColors = [ACCENT1, "#cce03e", "#b4c637", "#9dac30", "#859229", "#727d23", "#5e671d"];

const getPlaceColor = (zipcode: string, rank: number) =>
  (zipcode.toUpperCase().startsWith(CABA_PREFIX) ? cabaPlaceColors : placeColors)[rank];

const PlaceRow = ({ place, rank, monthKeys, fullOpacityKm }: Props) => {
  const label = `${place.zipcode} - ${place.name}`;

  const renderCell = (monthKey: string) => {
    const visited = place.monthKeys.includes(monthKey);
    // Km only count arrivals, so a month visited purely as an origin stays
    // coloured but at the floor opacity.
    const km = place.kmByMonth[monthKey] ?? 0;
    const cellLabel = `${label} — ${monthKey}`;

    return (
      <div
        key={`${place.zipcode}-${monthKey}`}
        title={visited ? `${cellLabel} · ${Math.round(km)} km` : cellLabel}
        className="h-full w-full rounded-[3px] bg-gray-700"
        style={visited ? {
          backgroundColor: getPlaceColor(place.zipcode, rank),
          opacity: getCellOpacity(km, fullOpacityKm)
        } : undefined}
      />
    );
  };

  return (
    <>
      <div
        className="text-[0.65rem] font-['Space_Mono'] text-[#f0f0f8] pr-2 truncate flex items-center"
        title={label}
      >
        {place.id ? (
          <Link href={`/travels/to/${place.id}`} className="hover:underline">
            {place.zipcode}
          </Link>
        ) : (
          <span>{place.zipcode}</span>
        )}
      </div>
      {monthKeys.map(renderCell)}
    </>
  );
};

export default PlaceRow;
