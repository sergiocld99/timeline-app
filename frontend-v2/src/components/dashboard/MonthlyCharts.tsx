"use client";

import type { MonthlyStats, PlacesVisited, TravelStats } from "@/types/travel";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ACCENT1, ACCENT2, BORDER, MUTED } from "@/constants/colors";
import { getMonthlyBarStyling } from "@/utils/chart/monthly";
import { toShortMonthKey } from "@/utils/date";

import MonthTick from "./MonthTick";
import ZipcodeTicker from "./ZipcodeTicker";

type Props = {
  monthlyStats: MonthlyStats;
  prevStats?: TravelStats;
  totalDistance: number;
  placesVisited: PlacesVisited;
};

const MonthlyCharts = ({ monthlyStats, prevStats, totalDistance, placesVisited }: Props) => {
  const t = useTranslations("Dashboard");
  const tMonths = useTranslations("MonthsShort");

  const [activeZipcode, setActiveZipcode] = useState<string | null>(null);

  // The previous-year overlay only makes sense across a multi-bucket window;
  // a 1-month range would otherwise render a single degenerate comparison.
  const showYearOverYear = Object.keys(monthlyStats).length >= 2;

  const chartData = useMemo(() => {
    const mainData = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const month = key.split('-')[1];
        
        // Find corresponding data in prevMonthlyStats
        // Key format is YYYY-MM
        const currentYear = parseInt(key.split('-')[0]);
        const prevKey = `${currentYear - 1}-${month}`;
        const prevData = showYearOverYear ? prevStats?.monthlyStats?.[prevKey] : undefined;

        return {
          month: tMonths(toShortMonthKey(key)),
          monthKey: key,
          ...data,
          km: Math.round(data.km),
          prevKm: prevData ? Math.round(prevData.km) : undefined,
          places: data.zipcodes.length,
          prevZipcodes: prevData?.zipcodes || [],
        };
      });
    return mainData;
  }, [monthlyStats, prevStats, showYearOverYear, tMonths]);

  const maxPlaces = useMemo(() => 
    Math.max(...chartData.map(d => d.places), 1),
  [chartData]);

  const prevAverage = useMemo(() => {
    if (!showYearOverYear || !prevStats) return null;
    const prevMonthlyStats = prevStats.monthlyStats || {};
    const monthsCount = Object.keys(prevMonthlyStats).length;
    if (monthsCount === 0) return null;
    return Math.round(prevStats.totalDistance / monthsCount);
  }, [prevStats, showYearOverYear]);

  // Guard as a number, not a truthiness check: a 0 count would render a stray "0"
  // next to the current count (e.g. "27" + "0" reading as "270").
  const prevPlacesCount = showYearOverYear ? (prevStats?.placesVisited?.count ?? 0) : 0;

  return (
    <>
      {/* Chart 1: Places per month */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#e8ff47] animate-in duration-700 delay-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">{t("placesVisited")}</span>
            <ZipcodeTicker 
              monthlyStats={monthlyStats} 
              previousPlaces={showYearOverYear ? prevStats?.placesVisited : undefined} 
              currentPlaces={placesVisited} 
              onActiveZipcodeChange={setActiveZipcode}
            />
          </div>
          <span className="text-2xl font-extrabold text-[#e8ff47] flex items-baseline leading-none">
            {placesVisited.count}
            {prevPlacesCount > 0 && (
              <span className="text-[1rem] ml-2 font-['Space_Mono'] text-[#5a5a70] tracking-[1px]" style={{ color: MUTED }}>
                / {prevPlacesCount}
              </span>
            )}
          </span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={(props) => <MonthTick {...props} chartData={chartData} tickColor={ACCENT1} />}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} />
              <Tooltip
                cursor={{ fill: 'rgba(232, 255, 71, 0.05)' }}
                contentStyle={{ backgroundColor: '#18181f', border: `1px solid ${BORDER}`, borderRadius: 2 }}
                itemStyle={{ color: '#f0f0f8', fontSize: 10, fontFamily: 'Space Mono' }}
              />
              <Bar name={t("placesVisited")} dataKey="places" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => {
                  const { fill, opacity } = getMonthlyBarStyling(entry, activeZipcode, maxPlaces);

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fill}
                      fillOpacity={opacity}
                      className="transition-all duration-500 ease-in-out"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Kilómetros por mes */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#47d4ff] animate-in duration-700 delay-400">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">{t("kilometersPerMonth")}</span>
          <span className="text-2xl font-extrabold text-[#47d4ff] flex items-baseline">
            {chartData.length > 0 ? Math.round(totalDistance / chartData.length) : 0}
            {prevAverage !== null && (
              <span className="text-[1rem] ml-2 font-['Space_Mono'] text-[#5a5a70] tracking-[1px]" style={{ color: MUTED }}>
                / {prevAverage}
              </span>
            )}
          </span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT2} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ACCENT2} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={(props) => <MonthTick {...props} chartData={chartData} tickColor={ACCENT2} />}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} tickFormatter={(v) => v === 0 ? '' : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181f', border: `1px solid ${BORDER}`, borderRadius: 2 }}
                itemStyle={{ fontSize: 10, fontFamily: 'Space Mono' }}
              />
              <Line
                type="monotone"
                name={t("previousYear")}
                dataKey="prevKm"
                stroke={MUTED}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={{ fill: MUTED, r: 4 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                name={t("currentYear")}
                dataKey="km"
                stroke={ACCENT2}
                strokeWidth={2.5}
                dot={{ fill: ACCENT2, r: 4 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default MonthlyCharts;
