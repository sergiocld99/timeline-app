"use client";

import type { StatsView } from "@/types/stats";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import PresentialWorkAlert from "@/components/PresentialWorkAlert";
import TravelBarStats from "@/components/TravelBarStats";
import TravelCalendarStats from "@/components/TravelCalendarStats";
import TravelPieStats from "@/components/TravelPieStats";
import TravelStatsSummary from "@/components/TravelStatsSummary";
import TravelTable from "@/components/TravelTable";
import useTravelFilter from "@/hooks/useTravelFilter";
import useTravels from "@/hooks/useTravels";

import BarViewBtn from "../buttons/BarViewBtn";
import CalendarViewBtn from "../buttons/CalendarViewBtn";
import CircularViewBtn from "../buttons/CircularViewBtn";
import LineViewBtn from "../buttons/LineViewBtn";
import TravelLineStats from "../TravelLineStats";

const MapLoading = () => {
  const t = useTranslations("Dashboard");
  return (
    <div className="w-2/10 h-87 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">{t("loadingMap")}</p>
    </div>
  );
};

// Importar el mapa dinámicamente para evitar problemas de SSR con Leaflet
const TravelMap = dynamic(() => import("@/components/TravelMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const TravelsPageClient = () => {
  const { travels: travelsData, updateTravel, deleteTravel } = useTravels();
  const { travels, stats } = travelsData;

  const [statsView, setStatsView] = useState<StatsView>("bar");
  const { filteredTravels, appliedFilter, onFilter } = useTravelFilter(travels);

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <PresentialWorkAlert />
        <div className="hidden lg:block">
          <TravelStatsSummary travels={filteredTravels} initialStats={stats} />
        </div>
        <div className="hidden lg:flex gap-8">
          <TravelMap travels={filteredTravels} isFiltered={!!appliedFilter} stats={stats} />
          <div className="w-8/10 relative">
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
              <BarViewBtn handleClick={() => setStatsView("bar")} isActive={statsView === "bar"} />
              <CircularViewBtn handleClick={() => setStatsView("circular")} isActive={statsView === "circular"} />
              <LineViewBtn handleClick={() => setStatsView("line")} isActive={statsView === "line"} />
              <CalendarViewBtn handleClick={() => setStatsView("calendar")} isActive={statsView === "calendar"} />
            </div>
            {statsView === "bar" && <TravelBarStats travels={filteredTravels} onFilter={onFilter} cardClassName="w-full" options={{
              backendHome: stats?.home,
              appliedFilter: appliedFilter
            }} />}
            {statsView === "line" && <TravelLineStats travels={filteredTravels} onFilter={onFilter} />}
            {statsView === "circular" && <TravelPieStats travels={filteredTravels} onFilter={onFilter} />}
            {statsView === "calendar" && <TravelCalendarStats travels={filteredTravels} onFilter={onFilter} options={{
              backendHome: stats?.home,
              appliedFilter: appliedFilter
            }} />}
          </div>
        </div>
        <TravelTable
          travels={filteredTravels}
          stats={stats}
          source="travels"
          onUpdateTravel={updateTravel}
          onDeleteTravel={deleteTravel}
          onFilter={onFilter}
          onRemoveFilter={() => onFilter()}
          appliedFilter={appliedFilter}
        />
      </div>
    </main>
  );
};

export default TravelsPageClient;

