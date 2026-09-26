"use client";

import type { Location } from "@/types/location";;

import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LocationListContent from "../mobile/LocationListContent";

import LocationTableContent from "./LocationTableContent";

type Props = {
  locations: Location[];
  updateFn: (id: string, updates: Partial<Location>) => Promise<Location>;
  deleteFn: (id: string) => Promise<void>;
  searchTerm?: string;
};

const LocationTable = ({ locations, updateFn, deleteFn, searchTerm }: Props) => {
  const t = useTranslations("Locations");

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {locations.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <p>{t.rich("noLocationsFoundMatching", { searchTerm, span: (chunks) => <span className="font-semibold text-gray-900 dark:text-white">{chunks}</span> })}</p>
            ) : (
              <p>{t("noLocationsCreated")}</p>
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
