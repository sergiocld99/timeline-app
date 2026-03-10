"use client";

import type { TravelStats } from "@/types/travel";

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

import { renderNiceDate } from "@/utils";

type Props = {
  stats: TravelStats;
};

const ACCENT1 = "#e8ff47";
const ACCENT2 = "#47d4ff";
const ACCENT4 = "#b847ff";
const BORDER = "#2a2a3a";
const MUTED = "#6b6b80";

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const TravelDashboard = ({ stats }: Props) => {
  const { monthlyStats = {}, topRoutes = [], records, count: totalCount, totalDistance, totalHours, placesVisited } = stats;

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

  const maxRouteCount = useMemo(() => {
    return Math.max(...topRoutes.map(r => r.count), 1);
  }, [topRoutes]);

  const routeColors = [ACCENT4, "#a347ff", "#8d47ff", "#7647ff", "#6047ff"];

  return (
    <div className="bg-[#0a0a0f] text-[#f0f0f8] font-['Syne'] min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Grid background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{ backgroundImage: `linear-gradient(${ACCENT1} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT1} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <header className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between border-bottom border-[#2a2a3a] pb-6 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-[0.9] tracking-tighter text-[#e8ff47]">
            DASHBOARD
          </h1>
        </div>

        <div className="flex gap-8 mt-8 md:mt-0">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#e8ff47] leading-none">{totalCount || 0}</div>
            <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">Travels</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#47d4ff] leading-none">{Math.round(totalDistance || 0)}</div>
            <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">total km</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#ff6b47] leading-none">{Math.round(totalHours || 0)}</div>
            <div className="font-['Space_Mono'] text-[0.6rem] text-[#fff] uppercase tracking-[2px]">total hours</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Chart 1: Places per month */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#e8ff47] animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Places visited</span>
            <span className="text-2xl font-extrabold text-[#e8ff47]">{placesVisited.count || 0}</span>
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
                    <Cell key={`cell-${index}`} fill={ACCENT1} fillOpacity={0.3 + (entry.places / Math.max(...chartData.map(d => d.places), 1)) * 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Kilómetros por mes */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#47d4ff] animate-in fade-in slide-in-from-bottom-5 duration-700 delay-400">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Kilometers per month</span>
            <span className="text-2xl font-extrabold text-[#47d4ff]">{Math.round(totalDistance / chartData.length)}</span>
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

        {/* Chart 3: Records */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#ff6b47] animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Maximum values</span>
            <span className="text-2xl font-extrabold text-[#ff6b47]">Records</span>
          </div>
          <div className="space-y-6 font-['Space_Mono']">
            {records?.maxDistance && (
              <div>
                <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">Longest travel distance</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-lg font-bold text-[#f0f0f8]">{records.maxDistance.origin} → {records.maxDistance.destination}</div>
                  <div className="text-xl font-bold text-[#ff6b47]">{records.maxDistance.value} km</div>
                </div>
                <div className="text-[0.65rem] text-[#fff]">{renderNiceDate(records.maxDistance.date)}</div>
              </div>
            )}
            {records?.maxDuration && (
              <div>
                <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">Longest travel time</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-lg font-bold text-[#f0f0f8]">{records.maxDuration.origin} → {records.maxDuration.destination}</div>
                  <div className="text-xl font-bold text-[#ff6b47]">{records.maxDuration.value} min</div>
                </div>
                <div className="text-[0.65rem] text-[#fff]">{renderNiceDate(records.maxDuration.date)}</div>
              </div>
            )}
            {records?.maxSpeed && (
              <div>
                <div className="text-[0.6rem] text-[#6b6b80] uppercase tracking-wider mb-1">Fastest travel</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-lg font-bold text-[#f0f0f8]">{records.maxSpeed.origin} → {records.maxSpeed.destination}</div>
                  <div className="text-xl font-bold text-[#ff6b47]">{records.maxSpeed.value} km/h</div>
                </div>
                <div className="text-[0.65rem] text-[#fff]">{renderNiceDate(records.maxSpeed.date)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Most frequent routes */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#b847ff] animate-in fade-in slide-in-from-bottom-5 duration-700 delay-600">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[0.65rem] font-['Space_Mono'] uppercase tracking-[3px] text-[#fff]">Most frequent routes</span>
            <span className="text-2xl font-extrabold text-[#b847ff]">Top 5</span>
          </div>
          <div className="flex flex-col gap-6">
            {topRoutes.map((route, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-center font-['Space_Mono'] text-[0.65rem]">
                  <span className="text-[#f0f0f8]">{route.route}</span>
                  <span className="font-bold" style={{ color: routeColors[i] }}>{route.count}</span>
                </div>
                <div className="h-[6px] bg-[#2a2a3a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(route.count / maxRouteCount) * 100}%`,
                      backgroundColor: routeColors[i]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDashboard;
