"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import LocationTable from "@/components/LocationTable";
import useLocations from "@/hooks/useLocations";
import { Input } from "@/components/ui/input";

const LocationsPageClient = () => {
  const { locations, error, update, remove, loading } = useLocations();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) return locations;

    const term = searchTerm.toLowerCase();
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(term) ||
      (loc.zipcode && loc.zipcode.toLowerCase().includes(term)) ||
      (loc.notes && loc.notes.toLowerCase().includes(term))
    );
  }, [locations, searchTerm]);

  if (error) {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading locations. Please try refreshing the page.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <p>Loading locations...</p>
            </div>
          </div>
        ) : (
          <LocationTable
            locations={filteredLocations}
            updateFn={update}
            deleteFn={remove}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </main>
  );
};

export default LocationsPageClient;

