"use client";

import Header from "@/components/Header";
import LocationForm from "@/components/LocationForm";
import TravelForm from "@/components/TravelForm";
import useLocations from "@/hooks/useLocations";

const CreatorPage = () => {
  const { locations, refetch } = useLocations();

  return (
    <>
      <Header />
      <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen gap-8 px-8">
        <div className="flex gap-8 mx-auto">
          <div className="w-1/3">
            <LocationForm onLocationAdded={refetch} />
          </div>
          <div className="w-2/3">
            <TravelForm locations={locations} />
          </div>
        </div>
      </main>
    </>
  );
};

export default CreatorPage;
