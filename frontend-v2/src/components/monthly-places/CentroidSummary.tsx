"use client";

import type { Centroid, PlaceGroup } from "@/utils/monthlyPlaces";

import { useTranslations } from "next-intl";

import { PLACE_GROUP_COLORS } from "@/utils/monthlyPlaces";

type Props = {
  centroids: Centroid[];
  activeGroup: PlaceGroup | null;
  onSelect: (group: PlaceGroup) => void;
};

const formatCoordinate = (value: number) => value.toFixed(4);

const CentroidSummary = ({ centroids, activeGroup, onSelect }: Props) => {
  const t = useTranslations("MonthlyPlaces");

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-['Space_Mono'] text-[0.7rem] uppercase tracking-[2px] text-[#fff] select-text">
          {t("summaryTitle")}
        </h2>
        {activeGroup && (
          <button
            type="button"
            onClick={() => onSelect(activeGroup)}
            className="cursor-pointer font-['Space_Mono'] text-[0.6rem] uppercase tracking-[1px] text-[#6b6b80] hover:text-[#fff] transition-colors select-text"
          >
            {t("clearFilter")}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {centroids.map(({ group, count, latitude, longitude }) => {
          const color = PLACE_GROUP_COLORS[group];
          const isActive = activeGroup === group;
          return (
            <div key={group} className="relative">
              <button
                type="button"
                disabled={count === 0}
                aria-pressed={isActive}
                title={t("filterHint")}
                onClick={() => onSelect(group)}
                className="w-full cursor-pointer rounded-[3px] border border-[#2a2a3a] bg-[#1a1a24] px-3 py-2 text-left transition-colors hover:border-[#3b3b4d] disabled:cursor-not-allowed disabled:opacity-50"
                style={isActive ? { borderColor: color } : undefined}
              >
                <div
                  className="font-['Space_Mono'] text-[0.6rem] uppercase tracking-[1px] select-text"
                  style={{ color }}
                >
                  {t(group)}
                </div>
                <div
                  className="font-['Space_Mono'] text-[0.75rem] mt-2 select-text"
                  style={{ color: latitude === null ? "#6b6b80" : color }}
                >
                  {latitude === null || longitude === null
                    ? t("noData")
                    : `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`}
                </div>
                <div className="font-['Space_Mono'] text-[0.6rem] text-[#6b6b80] mt-1 select-text">
                  {t("placesCount", { count })}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CentroidSummary;
