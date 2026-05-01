"use client";

import type { TravelStats } from "@/types/travel";

import { ACCENT1 } from "@/constants/colors";

import DashboardHeader from "./dashboard/DashboardHeader";
import MonthlyCharts from "./dashboard/MonthlyCharts";
import DashboardRecords from "./dashboard/DashboardRecords";
import FrequentRoutes from "./dashboard/FrequentRoutes";

type Props = {
  stats: TravelStats;
  prevStats?: TravelStats;
};

const TravelDashboard = ({ stats, prevStats }: Props) => {
  const {
    monthlyStats = {},
    topRoutes = [],
    records,
    count: totalCount,
    totalDistance,
    totalHours,
    placesVisited
  } = stats;

  return (
    <div className="bg-[#0a0a0f] text-[#f0f0f8] font-['Syne'] min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Grid background effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `linear-gradient(${ACCENT1} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT1} 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <DashboardHeader
        count={totalCount}
        totalDistance={totalDistance}
        totalHours={totalHours}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <MonthlyCharts 
          key={`charts-${Object.keys(monthlyStats).length}-${!!prevStats}`}
          monthlyStats={monthlyStats} 
          prevMonthlyStats={prevStats?.monthlyStats}
          totalDistance={totalDistance} 
          placesVisitedCount={placesVisited.count || 0}
        />
        <DashboardRecords records={records} />
        <FrequentRoutes topRoutes={topRoutes} />
      </div>
    </div>
  );
};

export default TravelDashboard;
