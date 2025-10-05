"use client";

import Header from "@/components/Header";
import LocationForm from "@/components/LocationForm";
import LocationTable from "@/components/LocationTable";
import useLocations from "@/hooks/useLocations";

const LocationsPage = () => {
  const { locations, error, refetch } = useLocations();

  if (error) {
    return (
      <>
        <Header />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600 dark:text-red-400">
            Error loading locations. Please try refreshing the page.
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
          <LocationForm onLocationAdded={refetch} />
          <LocationTable locations={locations} />
        </div>
      </main>
    </>
  );
};

export default LocationsPage;
