"use client"

import type { PlacesVisited } from "@/types/travel";
import type { PlaceGroup } from "@/utils/monthlyPlaces";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import Header from "@/components/layout/Header";
import { usePlacesVisited } from "@/hooks/usePlacesVisited";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CentroidSummary from "@/components/monthly-places/CentroidSummary";
import ZipcodeRow from "@/components/monthly-places/ZipcodeRow";
import { calculateCentroids, getPlaceGroupForZipcode } from "@/utils/monthlyPlaces";

const MonthlyPlacesPage = () => {
  const { data, prevData, isLoading, error, currentFrom, currentTo } = usePlacesVisited();
  const t = useTranslations("Dashboard");
  const [activeGroup, setActiveGroup] = useState<PlaceGroup | null>(null);

  const currentYear = useMemo(() => {
    const getLastYearFromData = (d?: PlacesVisited) => {
      if (!d?.data) return 0;
      let lastYear = 0;
      for (const v of Object.values(d.data)) {
        const months = v.months || [];
        if (months.length > 0) {
          const last = months[months.length - 1];
          const y = Number(String(last).slice(0, 4));
          if (!isNaN(y) && y > lastYear) lastYear = y;
        }
      }
      return lastYear;
    };
    const y = getLastYearFromData(data) || getLastYearFromData(prevData);
    if (y) return y;
    if (currentFrom) return new Date(currentFrom).getFullYear();
    return new Date().getFullYear();
  }, [data, prevData, currentFrom]);

  const prevYear = currentYear - 1;

  const zipcodes = useMemo(() => {
    const set = new Set<string>();
    if (data?.zipcodes) {
      data.zipcodes.forEach((z) => set.add(z));
    }
    if (prevData?.zipcodes) {
      prevData.zipcodes.forEach((z) => set.add(z));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, prevData]);

  const centroids = useMemo(
    () => calculateCentroids(zipcodes, data?.data, prevData?.data),
    [zipcodes, data, prevData]
  );

  const visibleZipcodes = useMemo(
    () =>
      activeGroup
        ? zipcodes.filter(
            (zipcode) => getPlaceGroupForZipcode(zipcode, data?.data, prevData?.data) === activeGroup
          )
        : zipcodes,
    [zipcodes, activeGroup, data, prevData]
  );

  if (isLoading) {
    return <Header />
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="px-4 py-6">
          <div className="text-[0.7rem] font-['Space_Mono'] text-[#ff4757]">
            {t("errorLoadingStats")}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <CentroidSummary
          centroids={centroids}
          activeGroup={activeGroup}
          onSelect={(group) => setActiveGroup((current) => (current === group ? null : group))}
        />
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#2a2a3a]">
              <TableHead className="text-[#fff] font-['Space_Mono'] text-[0.65rem] uppercase tracking-[2px]">
                Zipcode
              </TableHead>
              <TableHead className="text-[#fff] font-['Space_Mono'] text-[0.65rem] uppercase tracking-[2px]">
                Lugar
              </TableHead>
              <TableHead className="text-[#fff] font-['Space_Mono'] text-[0.65rem] uppercase tracking-[2px] text-center">
                {currentYear} ({t("currentYear")})
              </TableHead>
              <TableHead className="text-[#fff] font-['Space_Mono'] text-[0.65rem] uppercase tracking-[2px] text-center">
                {prevYear} ({t("previousYear")})
              </TableHead>
              <TableHead className="text-[#fff] font-['Space_Mono'] text-[0.65rem] uppercase tracking-[2px] text-center">
                Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleZipcodes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-[0.7rem] font-['Space_Mono'] text-[#6b6b80] py-6"
                >
                  {zipcodes.length === 0
                    ? t("noDataMessage", {
                        from: currentFrom ? new Date(currentFrom).toLocaleDateString() : "-",
                        to: currentTo ? new Date(currentTo).toLocaleDateString() : "-",
                      })
                    : t("noPlacesInGroup")}
                </TableCell>
              </TableRow>
            ) : (
              visibleZipcodes.map((zipcode) => (
                <ZipcodeRow
                  key={zipcode}
                  zipcode={zipcode}
                  data={data?.data}
                  prevData={prevData?.data}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default MonthlyPlacesPage