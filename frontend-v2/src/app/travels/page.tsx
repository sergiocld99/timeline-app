"use client";

import dynamic from "next/dynamic";
import GravityCenterScoreboard from "@/components/GravityCenterScoreboard";
import Header from "@/components/Header";
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

const TravelsPage = () => {
  const { travels, updateTravel, deleteTravel } = useTravels();

  return (
    <>
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <div className="flex gap-8">
            <TravelMap travelsData={travels} />
            <TravelBarStats travelsData={travels} />
            {/* <GravityCenterScoreboard travelsData={travels} /> */}
          </div>
          <TravelTable
            travelsData={travels}
            onUpdateTravel={updateTravel}
            onDeleteTravel={deleteTravel}
          />
        </div>
      </main>
    </>
  );
};

export default TravelsPage;
