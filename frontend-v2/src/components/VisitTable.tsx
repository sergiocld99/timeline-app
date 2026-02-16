"use client";

import type { VisitsData } from '@/types/travel';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import DateRangeSelector from './DateRangeSelector';
import VisitTableContent from './VisitTableContent';
import VisitListContent from './mobile/VisitListContent';


type Props = {
  visitsData: VisitsData;
  onDelete: (id: string) => Promise<void>;
};

const VisitTable = ({ visitsData, onDelete }: Props) => {
  const { visits } = visitsData;

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Visits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {visits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No visits found for the selected date range.
          </div>
        )}
        <div className='hidden lg:block'>
          <VisitTableContent visits={visits} onDelete={onDelete} />
        </div>
        <div className='lg:hidden'>
          <VisitListContent visits={visits} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitTable;
