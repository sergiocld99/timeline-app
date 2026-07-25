"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import QuickFilters from "@/components/QuickFilters";
import LocationCategoryCards from "@/components/LocationCategoryCards";
import LocationTable from "@/components/LocationTable";
import useLocations from "@/hooks/useLocations";
import { Input } from "@/components/ui/input";
import { getSortedSubdivisions } from "@/utils/subdivisions";
import { SUBDIVISIONS, SUBDIVISION_FILTER_PREFIX, getPrefixForSubdivisionName } from "@/constants/subdivisions";

const LocationsPageClient = () => {
  const t = useTranslations("Locations");
  const { locations, error, update, remove, loading } = useLocations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState<string | null>(null);

  // The category currently in focus, from either a selected card (zipcode
  // prefix) or an active subdivision filter. Null when nothing is selected.
  const activePrefix = useMemo(() => {
    if (!filterValue) return null;
    if (filterValue.startsWith(SUBDIVISION_FILTER_PREFIX)) {
      return getPrefixForSubdivisionName(filterValue.slice(SUBDIVISION_FILTER_PREFIX.length)) ?? null;
    }
    return filterValue;
  }, [filterValue]);

  // Top drill-down filters per jurisdiction (partidos for B, barrios for C, …),
  // scoped to the active category so you never see another card's filters.
  const filterOptions = useMemo(() =>
    SUBDIVISIONS
      .filter((s) => !activePrefix || s.prefix === activePrefix)
      .flatMap((s) =>
        getSortedSubdivisions(locations, s.prefix).top.map((name) => ({
          label: name,
          value: `${SUBDIVISION_FILTER_PREFIX}${name}`,
        }))
      )
  , [locations, activePrefix]);

  const filteredLocations = useMemo(() => {
    let result = locations;

    // Filter by subdivision name or by zipcode prefix (category card)
    if (filterValue) {
      if (filterValue.startsWith(SUBDIVISION_FILTER_PREFIX)) {
        const subdivisionName = filterValue.replace(SUBDIVISION_FILTER_PREFIX, '');
        result = result.filter((loc) => loc.partido === subdivisionName);
      } else {
        result = result.filter((loc) =>
          loc.zipcode && loc.zipcode.toUpperCase().startsWith(filterValue)
        );
      }
    }

    // Filter by search term
    if (!searchTerm.trim()) return result;

    const term = searchTerm.toLowerCase();
    return result.filter((loc) =>
      loc.name.toLowerCase().includes(term) ||
      (loc.zipcode && loc.zipcode.toLowerCase().includes(term)) ||
      (loc.notes && loc.notes.toLowerCase().includes(term)) ||
      (loc.partido && loc.partido.toLowerCase().includes(term))
    );
  }, [locations, searchTerm, filterValue]);

  if (error) {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 dark:text-red-400">
          {t("errorLoading")}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <LocationCategoryCards
          locations={locations}
          selectedValue={filterValue}
          onSelect={setFilterValue}
        />

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          <QuickFilters
            options={filterOptions}
            selectedValue={filterValue}
            onSelect={setFilterValue}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <p>{t("loading")}</p>
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

