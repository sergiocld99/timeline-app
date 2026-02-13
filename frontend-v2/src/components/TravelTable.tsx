"use client";

import type { Travel, TravelStats } from '@/types/travel';

import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useUser } from '@/contexts/UserContext';
import { useTravelStats } from '@/hooks/useTravelStats';
import TravelService from '@/services/TravelService';

import ExportButton from './buttons/ExportButton';
import RemoveFilterBtn from './buttons/RemoveFilterBtn';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';
import TravelListContent from './mobile/TravelListContent';

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  onUpdateTravel?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDeleteTravel?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
  onRemoveFilter?: () => void;
  appliedFilter?: string | null;
};

const TravelTable = ({ travels, stats: initialStats, onUpdateTravel, onDeleteTravel, onAddCrosses, onRemoveCrosses, onRemoveFilter, appliedFilter }: Props) => {
  const { dateFrom, dateTo } = useDateRange();
  const { currentUser } = useUser();
  const { stats } = useTravelStats(travels, initialStats);

  const handleExportCsv = async () => {
    try {
      const userId = currentUser?.userId;
      await TravelService.exportCsv(dateFrom, dateTo, userId);
    } catch (error) {
      toast.error('Error exporting CSV:')
      console.error(error)
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">Travels</CardTitle>
        {appliedFilter && onRemoveFilter && <RemoveFilterBtn handleClick={onRemoveFilter} filterName={appliedFilter} />}
        <ExportButton handleClick={handleExportCsv} />
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {travels.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No travels found for the selected date range :/
          </div>
        )}
        <div className="hidden lg:block">
          <TravelTableContent
            travels={travels}
            stats={stats}
            onUpdate={onUpdateTravel}
            onDelete={onDeleteTravel}
            onAddCrosses={onAddCrosses}
            onRemoveCrosses={onRemoveCrosses}
          />
        </div>
        <div className="lg:hidden">
          <TravelListContent travels={travels} stats={stats} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelTable;
