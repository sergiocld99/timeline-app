"use client";

import Header from "@/components/Header";
import TravelStats from "@/components/TravelStats";
import TravelTable from "@/components/TravelTable";
import useStats from "@/hooks/useStats";
import useTravels from "@/hooks/useTravels";

const TravelsPage = () => {
  const { travels, error, updateTravel, deleteTravel } = useTravels();
  const { loading: loadingStats, statsByMode } = useStats();

  if (error) {
    return (
      <>
        <Header />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600 dark:text-red-400">
            Error loading travels. Please try refreshing the page.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <TravelStats loading={loadingStats} stats={statsByMode} />
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
