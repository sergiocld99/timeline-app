"use client";

import type { Centroid } from "@/utils/monthlyPlaces";

import { useTranslations } from "next-intl";

import { PLACE_GROUP_COLORS } from "@/utils/monthlyPlaces";

type Props = {
  centroids: Centroid[];
};

const formatCoordinate = (value: number) => value.toFixed(5);

const CentroidSummary = ({ centroids }: Props) => {
  const t = useTranslations("MonthlyPlaces");

  return (
    <section className="mb-6">
      <h2 className="font-['Space_Mono'] text-[0.7rem] uppercase tracking-[2px] text-[#fff] mb-3">
        {t("summaryTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {centroids.map(({ group, count, latitude, longitude }) => {
          const color = PLACE_GROUP_COLORS[group];
          return (
            <div
              key={group}
              className="rounded-[3px] border border-[#2a2a3a] bg-[#1a1a24] px-3 py-2"
            >
              <div
                className="font-['Space_Mono'] text-[0.6rem] uppercase tracking-[1px]"
                style={{ color }}
              >
                {t(group)}
              </div>
              <div
                className="font-['Space_Mono'] text-[0.75rem] mt-2"
                style={{ color: latitude === null ? "#6b6b80" : color }}
              >
                {latitude === null || longitude === null
                  ? t("noData")
                  : `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`}
              </div>
              <div className="font-['Space_Mono'] text-[0.6rem] text-[#6b6b80] mt-1">
                {t("placesCount", { count })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CentroidSummary;
