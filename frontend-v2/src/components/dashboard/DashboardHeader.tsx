"use client";

import { useTranslations } from "next-intl";

import { formatDayMonthYear } from "@/utils/date";

type Props = {
  count: number;
  totalDistance: number;
  totalHours: number;
  currentFrom?: string;
  currentTo?: string;
};

const DashboardHeader = ({ count, totalDistance, totalHours, currentFrom, currentTo }: Props) => {
  const t = useTranslations("Dashboard");

  return (
    <header className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between border-bottom border-[#2a2a3a] pb-6 mb-12 animate-in duration-700">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold leading-[0.9] tracking-tighter text-[#e8ff47]">
          {t("title")}
        </h1>
        {currentFrom && currentTo && (
          <span className="text-[0.7rem] md:text-[0.8rem] font-['Space_Mono'] text-[#8a8a9e] mt-3.5 block tracking-[2px] uppercase">
            {formatDayMonthYear(currentFrom)} — {formatDayMonthYear(currentTo)}
          </span>
        )}
      </div>

      <div className="flex gap-8 mt-8 md:mt-0">
        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#e8ff47] leading-none">{count || 0}</div>
          <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">{t("travels")}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#47d4ff] leading-none">{Math.round(totalDistance || 0)}</div>
          <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">{t("totalKm")}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#ff6b47] leading-none">{Math.round(totalHours || 0)}</div>
          <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">{t("totalHours")}</div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
