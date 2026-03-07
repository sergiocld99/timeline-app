"use client";

import type { Location } from "@/types/travel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LocationTableContent from "./LocationTableContent";
import LocationListContent from "./mobile/LocationListContent";

type Props = {
  locations: Location[];
  updateFn: (id: string, updates: Partial<Location>) => Promise<Location>;
  deleteFn: (id: string) => Promise<void>;
  searchTerm?: string;
};

const LocationTable = ({ locations, updateFn, deleteFn, searchTerm }: Props) => {
  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Locations</CardTitle>
      </CardHeader>
      <CardContent>
        {locations.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <p>No locations found matching &quot;<span className="font-semibold text-gray-900 dark:text-white">{searchTerm}</span>&quot;</p>
            ) : (
              <p>No locations created yet. Add your first location in the Creator page!</p>
            )}
          </div>
        )}
        {locations.length > 0 && (
          <>
            <div className='hidden lg:block'>
              <LocationTableContent locations={locations} updateFn={updateFn} deleteFn={deleteFn} />
            </div>
            <div className='lg:hidden'>
              <LocationListContent locations={locations} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTable;
