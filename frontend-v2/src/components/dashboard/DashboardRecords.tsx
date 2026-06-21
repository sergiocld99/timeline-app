"use client";

import type { TravelRecordItem, TravelRecords } from "@/types/travel";

import { useTranslations } from "next-intl";

import { renderNiceDate } from "@/utils/date";

type Props = {
  records?: TravelRecords
};

const DashboardRecords = ({ records }: Props) => {
  const t = useTranslations();

  const formatDate = (dateStr: string) => renderNiceDate(dateStr, t);

  const renderRecordItem = ({ origin, destination, value, date }: TravelRecordItem, unit: string) => (
    <div>
      <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">{t("Dashboard.longestTravelDistance")}</div>
      <div className="flex justify-between items-baseline">
        <div className="text-lg font-bold text-[#f0f0f8]">{origin.name} → {destination.name}</div>
        <div className="text-xl font-bold text-[#ff6b47]">{value} {unit}</div>
      </div>
      <div className="text-[0.65rem] text-[#fff]">{formatDate(date)}</div>
    </div>
  )

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#ff6b47] animate-in duration-700 delay-500">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">{t("Dashboard.maximumValues")}</span>
        <span className="text-2xl font-extrabold text-[#ff6b47]">{t("Dashboard.records")}</span>
      </div>
      <div className="space-y-6 font-['Space_Mono']">
        {records?.maxDistance && renderRecordItem(records.maxDistance, 'km')}
        {records?.maxDuration && renderRecordItem(records.maxDuration, 'min')}
        {records?.maxSpeed && renderRecordItem(records.maxSpeed, 'km/h')}
      </div>
    </div>
  );
};

export default DashboardRecords;
