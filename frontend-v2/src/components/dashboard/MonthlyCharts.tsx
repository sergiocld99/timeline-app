"use client";

import type { MonthlyStats } from "@/types/travel";

import { useMemo } from "react";
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

type Props = {
  monthlyStats: MonthlyStats;
  totalDistance: number;
  placesVisitedCount: number;
};

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MonthlyCharts = ({ monthlyStats, totalDistance, placesVisitedCount }: Props) => {
  const chartData = useMemo(() => {
    return Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const month = key.split('-')[1];
        const monthIndex = parseInt(month) - 1;
        return {
          month: `${MONTH_NAMES[monthIndex]}`,
          ...data,
          km: Math.round(data.km),
          places: data.zipcodes.length,
        };
      });
  }, [monthlyStats]);
  return (
    <>
      {/* Chart 1: Places per month */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#e8ff47] animate-in duration-700 delay-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Places visited</span>
          <span className="text-2xl font-extrabold text-[#e8ff47]">
            {placesVisitedCount}
          </span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} />
              <Tooltip
                cursor={{ fill: 'rgba(232, 255, 71, 0.05)' }}
                contentStyle={{ backgroundColor: '#18181f', border: `1px solid ${BORDER}`, borderRadius: 2 }}
                itemStyle={{ color: '#f0f0f8', fontSize: 10, fontFamily: 'Space Mono' }}
              />
              <Bar dataKey="places" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={ACCENT1} 
                    fillOpacity={0.3 + (entry.places / Math.max(...chartData.map(d => d.places), 1)) * 0.7} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Kilómetros por mes */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#47d4ff] animate-in duration-700 delay-400">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Kilometers per month</span>
          <span className="text-2xl font-extrabold text-[#47d4ff]">
            {chartData.length > 0 ? Math.round(totalDistance / chartData.length) : 0}
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
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: MUTED, fontFamily: 'Space Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181f', border: `1px solid ${BORDER}`, borderRadius: 2 }}
                itemStyle={{ color: '#f0f0f8', fontSize: 10, fontFamily: 'Space Mono' }}
              />
              <Line type="monotone" dataKey="km" stroke={ACCENT2} strokeWidth={2.5} dot={{ fill: ACCENT2, r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default MonthlyCharts;
