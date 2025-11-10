"use client";

import Header from "@/components/Header";
import TravelPieStats from "@/components/TravelPieStats";
import TravelTable from "@/components/TravelTable";
import useStats from "@/hooks/useStats";
import useTravels from "@/hooks/useTravels";

const TravelsByDistancePage = () => {
  const { travels, updateTravel, deleteTravel } = useTravels('distance');
  const { statsByMode } = useStats();

  return (
    <>
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <TravelPieStats stats={statsByMode} />
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

export default TravelsByDistancePage;
