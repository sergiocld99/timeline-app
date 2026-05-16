"use client";

import type { TravelRecords } from "@/types/travel";

import { useTranslations, useFormatter } from "next-intl";

import { renderNiceDate } from "@/utils/date";

type Props = {
  records?: TravelRecords
};

const DashboardRecords = ({ records }: Props) => {
  const t = useTranslations("Dashboard");
  const format = useFormatter();

  const formatDate = (dateStr: string) => renderNiceDate(dateStr, format);

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#ff6b47] animate-in duration-700 delay-500">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">{t("maximumValues")}</span>
        <span className="text-2xl font-extrabold text-[#ff6b47]">{t("records")}</span>
      </div>
      <div className="space-y-6 font-['Space_Mono']">
        {records?.maxDistance && (
          <div>
            <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">{t("longestTravelDistance")}</div>
            <div className="flex justify-between items-baseline">
              <div className="text-lg font-bold text-[#f0f0f8]">{records.maxDistance.origin} → {records.maxDistance.destination}</div>
              <div className="text-xl font-bold text-[#ff6b47]">{records.maxDistance.value} km</div>
            </div>
            <div className="text-[0.65rem] text-[#fff]">{formatDate(records.maxDistance.date)}</div>
          </div>
        )}
        {records?.maxDuration && (
          <div>
            <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">{t("longestTravelTime")}</div>
            <div className="flex justify-between items-baseline">
              <div className="text-lg font-bold text-[#f0f0f8]">{records.maxDuration.origin} → {records.maxDuration.destination}</div>
              <div className="text-xl font-bold text-[#ff6b47]">{records.maxDuration.value} min</div>
            </div>
            <div className="text-[0.65rem] text-[#fff]">{formatDate(records.maxDuration.date)}</div>
          </div>
        )}
        {records?.maxSpeed && (
          <div>
            <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">{t("fastestTravel")}</div>
            <div className="flex justify-between items-baseline">
              <div className="text-lg font-bold text-[#f0f0f8]">{records.maxSpeed.origin} → {records.maxSpeed.destination}</div>
              <div className="text-xl font-bold text-[#ff6b47]">{records.maxSpeed.value} km/h</div>
            </div>
            <div className="text-[0.65rem] text-[#fff]">{formatDate(records.maxSpeed.date)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecords;
