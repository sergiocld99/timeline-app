"use client";

import type { TopRoute } from "@/types/travel";

import { useMemo } from "react";

import { ACCENT4 } from "@/constants/colors";

type Props = {
  topRoutes: TopRoute[];
};

const routeColors = [ACCENT4, "#a347ff", "#8d47ff", "#7647ff", "#6047ff"];

const FrequentRoutes = ({ topRoutes }: Props) => {
  const maxRouteCount = useMemo(() => {
    return Math.max(...topRoutes.map(r => r.count), 1);
  }, [topRoutes]);

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-sm p-7 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-[#b847ff] animate-in duration-700 delay-600">
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
  );
};

export default FrequentRoutes;
