"use client";

import Header from "@/components/Header";
import TravelBarStats from "@/components/TravelBarStats";
import TravelTable from "@/components/TravelTable";
import useTravels from "@/hooks/useTravels";

const TravelsPage = () => {
  const { travels, updateTravel, deleteTravel } = useTravels();

  return (
    <>
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <TravelBarStats travelsData={travels} />
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
