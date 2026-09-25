"use client";

import LocationForm from "@/components/forms/LocationForm";
import TravelForm from "@/components/forms/TravelForm";
import useLocations from "@/hooks/useLocations";
import useCrosses from "@/hooks/useCrosses";

const CreatorPageClient = () => {
  const { locations } = useLocations();
  const { crosses } = useCrosses();

  return (
    <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen gap-8 px-8">
      <div className="flex flex-col lg:flex-row gap-8 mx-auto">
        <div className="w-full lg:w-1/3">
          <LocationForm />
        </div>
        <div className="w-full lg:w-2/3">
          <TravelForm locations={locations} crosses={crosses} />
        </div>
      </div>
    </main>
  );
};

export default CreatorPageClient;

