"use client";

import type { FilteringData } from "@/types/stats";
import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getDayOfMonth, getDayRangeDays, getDayRangeLabel, translateDay } from "@/utils/date";

const useTravelFilter = (travels: Travel[]) => {
  const t = useTranslations();
  const tDashboard = useTranslations("Dashboard");
  const tCharts = useTranslations("Charts");
  const [filteredTravels, setFilteredTravels] = useState<Travel[]>(travels);
  const [appliedFilter, setAppliedFilter] = useState<string | null>(null);

  const onFilter = (data?: FilteringData) => {
    const { type, value } = data || {}

    if (type === 'zipcode' && value) {
      const displayName = value.length === 1 ? value[0] : value.length < 10 ? value.join(", ") : tDashboard("others")

      setFilteredTravels(travels.filter(t => value.includes(t.origin.zipcode) || value.includes(t.destination.zipcode)));
      setAppliedFilter(displayName);
      return;
    }

    if (type === 'day' && value) {
      setFilteredTravels(travels.filter(t => t.extractedDate.slice(0, 3) === value))
      setAppliedFilter(value);
      return;
    }

    if (type === 'hour' && value) {
      setFilteredTravels(travels.filter(t => t.hourParts.completeParts.some(p => p.hour === value)))
      setAppliedFilter(value);
      return;
    }

    if (type === 'cross' && value) {
      setFilteredTravels(travels.filter(t => t.crosses?.some(c => c._id === value)))
      setAppliedFilter(null);
      return;
    }

    if (type === 'mode' && value) {
      setFilteredTravels(travels.filter(t => t.modeOfTransport === value));
      setAppliedFilter(tCharts(`modes.${value}`));
      return;
    }

    if (type === 'dayHour' && value) {
      setFilteredTravels(travels.filter(tr =>
        tr.extractedDate.slice(0, 3) === value.day && tr.hourParts.completeParts.some(p => p.hour === value.hour)
      ));
      setAppliedFilter(`${translateDay(value.day, t)} ${value.hour}hs`);
      return;
    }

    if (type === 'dayRange' && value) {
      const days = getDayRangeDays(value);

      setFilteredTravels(travels.filter(tr => days.includes(getDayOfMonth(tr.extractedDate))));
      setAppliedFilter(tCharts("calendar.days", { range: getDayRangeLabel(value) }));
      return;
    }

    if (type === 'dayRangeHour' && value) {
      const days = getDayRangeDays(value.dayRange);

      setFilteredTravels(travels.filter(tr =>
        days.includes(getDayOfMonth(tr.extractedDate)) && tr.hourParts.completeParts.some(p => p.hour === value.hour)
      ));
      setAppliedFilter(`${tCharts("calendar.days", { range: getDayRangeLabel(value.dayRange) })} ${value.hour}hs`);
      return;
    }

    setFilteredTravels(travels);
    setAppliedFilter(null);
  };

  useEffect(() => {
    setFilteredTravels(travels);
    setAppliedFilter(null);
  }, [travels]);

  return { filteredTravels, appliedFilter, onFilter };
};

export default useTravelFilter;
