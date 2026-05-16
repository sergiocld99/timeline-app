"use client";

import type { Visit } from "@/types/visit";;

import { useFormatter } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translateDay } from '@/utils/date';

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
  const format = useFormatter();
  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">Visits</CardTitle>
        {appliedFilter && onRemoveFilter && (
          <RemoveFilterBtn 
            handleClick={onRemoveFilter} 
            filterName={translateDay(appliedFilter, format)} 
          />
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {visits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No visits found for the selected date range.
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
