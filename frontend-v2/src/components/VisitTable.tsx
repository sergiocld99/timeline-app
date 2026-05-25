"use client";

import type { Visit } from "@/types/visit";

import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translateDay } from "@/utils/date";

import DateRangeSelector from './DateRangeSelector';
import RemoveFilterBtn from './buttons/RemoveFilterBtn';
import VisitTableContent from './VisitTableContent';
import VisitListContent from './mobile/VisitListContent';

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

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">{t("title")}</CardTitle>
        {appliedFilter && onRemoveFilter && <RemoveFilterBtn handleClick={onRemoveFilter} filterName={translateDay(appliedFilter, tRoot)} />}
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {visits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("noVisitsFound")}
          </div>
        )}
        <div className='hidden lg:block'>
          <VisitTableContent visits={visits} onDelete={onDelete} onUpdate={onUpdate} />
        </div>
        <div className='lg:hidden'>
          <VisitListContent visits={visits} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitTable;
