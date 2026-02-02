"use client";

import type { Travel } from "@/types/travel";
import type { StatsView } from "@/types/stats";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import PresentialWorkAlert from "@/components/PresentialWorkAlert";
import TravelBarStats from "@/components/TravelBarStats";
import TravelPieStats from "@/components/TravelPieStats";
import TravelTable from "@/components/TravelTable";
import useStats from "@/hooks/useStats";
import useTravels from "@/hooks/useTravels";

import BarViewBtn from "../buttons/BarViewBtn";
import CircularViewBtn from "../buttons/CircularViewBtn";

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
  const { statsByMode } = useStats();
  const { travels, stats } = travelsData;

  const [statsView, setStatsView] = useState<StatsView>("bar");
  const [filteredTravels, setFilteredTravels] = useState<Travel[]>(travels);
  const [isFiltered, setIsFiltered] = useState(false);

  const onFilterLocation = (loc?: string) => {
    if (loc) {
      setFilteredTravels(travels.filter(t => t.origin.zipcode === loc || t.destination.zipcode === loc));
      setIsFiltered(true);
    } else {
      setFilteredTravels(travels);
      setIsFiltered(false);
    }
  };

  useEffect(() => {
    setFilteredTravels(travels);
    setIsFiltered(false);
  }, [travels]);

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-8">
        <PresentialWorkAlert />
        <div className="flex gap-8">
          <TravelMap travels={filteredTravels} stats={stats} />
          <div className="w-8/10 relative">
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <BarViewBtn handleClick={() => setStatsView("bar")} isActive={statsView === "bar"} />
              <CircularViewBtn handleClick={() => setStatsView("circular")} isActive={statsView === "circular"} />
            </div>
            {statsView === "bar" ? (
              <TravelBarStats travels={filteredTravels} onFilterLocation={onFilterLocation} cardClassName="w-full" />
            ) : (
              <TravelPieStats stats={statsByMode} />
            )}
          </div>
        </div>
        <TravelTable
          travels={filteredTravels}
          stats={stats}
          onUpdateTravel={updateTravel}
          onDeleteTravel={deleteTravel}
          onRemoveFilter={() => onFilterLocation(undefined)}
          isFiltered={isFiltered}
        />
      </div>
    </main>
  );
};

export default TravelsPageClient;

