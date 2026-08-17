"use client";

import type { FilteringData } from "@/types/stats";
import type { Visit } from "@/types/visit";;

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import GravityCenterScoreboard from "@/components/GravityCenterScoreboard";
import VisitStats from "@/components/VisitStats";
import VisitTable from "@/components/VisitTable";
import useVisits from "@/hooks/useVisits";
import { extractDate } from "@/utils/date";

const VisitsPageClient = () => {
  const t = useTranslations("Visits");
  const tDashboard = useTranslations("Dashboard");
  const { visits: visitsData, error, deleteVisit, updateVisit } = useVisits();
  const { visits } = visitsData;

  const [filteredVisits, setFilteredVisits] = useState<Visit[]>(visits);
  const [appliedFilter, setAppliedFilter] = useState<string | null>(null);
  const [locationFilterValue, setLocationFilterValue] = useState<string[] | null>(null);

  const onFilter = (data?: FilteringData) => {
    const { type, value } = data || {}

    if (type === 'location' && value) {
      const displayName = value.length === 1 ? value[0] : value.length < 10 ? value.join(", ") : tDashboard("others")

      setFilteredVisits(visits.filter(v => value.includes(v.location.name)))
      setAppliedFilter(displayName)
      setLocationFilterValue(value)
      return
    }

    if (type === 'day' && value) {
      setFilteredVisits(visits.filter(v => extractDate(v.date).slice(0, 3) === value))
      setAppliedFilter(value)
      setLocationFilterValue(null)
      return
    }

    if (type === 'hour' && value) {
      setFilteredVisits(visits.filter(v => v.hourParts.some(hp => hp.hour === value)))
      setAppliedFilter(value)
      setLocationFilterValue(null)
      return
    }

    setFilteredVisits(visits)
    setAppliedFilter(null)
    setLocationFilterValue(null)
  }

  useEffect(() => {
    setFilteredVisits(visits);
    setAppliedFilter(null);
    setLocationFilterValue(null);
  }, [visits]);

  const groupHourlyByWeekday = locationFilterValue?.length === 1;

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
      <div className="space-y-8">
        <div className="hidden lg:flex gap-8">
          <GravityCenterScoreboard visitsData={visitsData} isFiltered={!!appliedFilter} />
          <VisitStats visits={filteredVisits} onFilter={onFilter} groupHourlyByWeekday={groupHourlyByWeekday} />
        </div>
        <VisitTable
          visits={filteredVisits}
          onDelete={deleteVisit}
          onUpdate={updateVisit}
          onRemoveFilter={() => onFilter()}
          appliedFilter={appliedFilter}
        />
      </div>
    </main>
  );
};

export default VisitsPageClient;

