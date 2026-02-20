"use client";

import LocationForm from "@/components/LocationForm";
import TravelForm from "@/components/TravelForm";
import useLocations from "@/hooks/useLocations";

const CreatorPageClient = () => {
  const { locations } = useLocations();

  return (
    <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen gap-8 px-8">
      <div className="flex flex-col lg:flex-row gap-8 mx-auto">
        <div className="w-full lg:w-1/3">
          <LocationForm />
        </div>
        <div className="w-full lg:w-2/3">
          <TravelForm locations={locations} />
        </div>
      </div>
    </main>
  );
};

export default CreatorPageClient;

