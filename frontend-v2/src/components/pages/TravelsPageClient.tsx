"use client";

import type { Travel } from "@/types/travel";
import type { StatsView } from "@/types/stats";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import PresentialWorkAlert from "@/components/PresentialWorkAlert";
import TravelBarStats from "@/components/TravelBarStats";
import TravelPieStats from "@/components/TravelPieStats";
import TravelTable from "@/components/TravelTable";
import useTravels from "@/hooks/useTravels";

import BarViewBtn from "../buttons/BarViewBtn";
import CircularViewBtn from "../buttons/CircularViewBtn";
import LineViewBtn from "../buttons/LineViewBtn";
import TravelLineStats from "../TravelLineStats";

// Importar el mapa dinámicamente para evitar problemas de SSR con Leaflet
const TravelMap = dynamic(() => import("@/components/TravelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-2/10 h-87 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

const TravelsPageClient = () => {
  const { travels: travelsData, updateTravel, deleteTravel } = useTravels();
  const { travels, stats } = travelsData;

  const [statsView, setStatsView] = useState<StatsView>("bar");
  const [filteredTravels, setFilteredTravels] = useState<Travel[]>(travels);
  const [appliedFilter, setAppliedFilter] = useState<string | null>(null);

  const onFilterLocation = (loc?: string) => {
    if (loc) {
      const zipcodes = loc.split(", ")
      const displayName = zipcodes.length === 1 ? zipcodes[0] : zipcodes.length < 10 ? loc : "Others"

      setFilteredTravels(travels.filter(t => zipcodes.includes(t.origin.zipcode) || zipcodes.includes(t.destination.zipcode)));
      setAppliedFilter(displayName);
    } else {
      setFilteredTravels(travels);
      setAppliedFilter(null);
    }
  };

  useEffect(() => {
    setFilteredTravels(travels);
    setAppliedFilter(null);
  }, [travels]);

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-8">
        <PresentialWorkAlert />
        <div className="hidden lg:flex gap-8">
          <TravelMap travels={filteredTravels} stats={stats} />
          <div className="w-8/10 relative">
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
              <BarViewBtn handleClick={() => setStatsView("bar")} isActive={statsView === "bar"} />
              <CircularViewBtn handleClick={() => setStatsView("circular")} isActive={statsView === "circular"} />
              <LineViewBtn handleClick={() => setStatsView("line")} isActive={statsView === "line"} />
            </div>
            {statsView === "bar" && <TravelBarStats travels={filteredTravels} onFilterLocation={onFilterLocation} cardClassName="w-full" />}
            {statsView === "circular" && <TravelPieStats travels={filteredTravels} />}
            {statsView === "line" && <TravelLineStats travels={filteredTravels} />}
          </div>
        </div>
        <TravelTable
          travels={filteredTravels}
          stats={stats}
          onUpdateTravel={updateTravel}
          onDeleteTravel={deleteTravel}
          onRemoveFilter={() => onFilterLocation(undefined)}
          appliedFilter={appliedFilter}
        />
      </div>
    </main>
  );
};

export default TravelsPageClient;

