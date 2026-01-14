"use client";

import type { Travel } from "@/types/travel";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import PresentialWorkAlert from "@/components/PresentialWorkAlert";
import TravelBarStats from "@/components/TravelBarStats";
import TravelTable from "@/components/TravelTable";
import useTravels from "@/hooks/useTravels";

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
          <TravelBarStats travels={filteredTravels} onFilterLocation={onFilterLocation} />
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

