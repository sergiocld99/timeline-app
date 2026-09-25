"use client";

import type { Visit } from "@/types/visit";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translateDay } from "@/utils/date";

import VisitSortSelector, { sortVisits, type SortOption } from '../selectors/VisitSortSelector';
import DateRangeSelector from '../selectors/DateRangeSelector';
import RemoveFilterBtn from '../buttons/RemoveFilterBtn';
import VisitListContent from '../mobile/VisitListContent';

import VisitTableContent from './VisitTableContent';

type Props = {
  visits: Visit[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Visit>) => Promise<Visit>;
  onRemoveFilter: () => void;
  appliedFilter: string | null;
};

const VisitTable = ({ visits, onDelete, onUpdate, appliedFilter, onRemoveFilter }: Props) => {
  const t = useTranslations("Visits");
  const tRoot = useTranslations();
  const [sortOption, setSortOption] = useState<SortOption>("date");

  const sortedVisits = useMemo(() => sortVisits(visits, sortOption), [visits, sortOption]);

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">{t("title")}</CardTitle>
        <div className="flex items-center gap-2">
          {appliedFilter && onRemoveFilter && <RemoveFilterBtn handleClick={onRemoveFilter} filterName={translateDay(appliedFilter, tRoot)} />}
          <VisitSortSelector value={sortOption} onValueChange={setSortOption} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {sortedVisits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("noVisitsFound")}
          </div>
        )}
        <div className='hidden lg:block'>
          <VisitTableContent visits={sortedVisits} onDelete={onDelete} onUpdate={onUpdate} />
        </div>
        <div className='lg:hidden'>
          <VisitListContent visits={sortedVisits} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitTable;
