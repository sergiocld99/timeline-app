"use client";

import type { Travel, TravelsData } from '@/types/travel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';
import TravelService from '@/services/TravelService';
import { useDateRange } from '@/contexts/DateRangeContext';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  travelsData: TravelsData;
  onUpdateTravel?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDeleteTravel?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
};

const TravelTable = ({ travelsData, onUpdateTravel, onDeleteTravel, onAddCrosses, onRemoveCrosses }: Props) => {
  const { travels } = travelsData;
  const { dateFrom, dateTo } = useDateRange();

  const handleExportCsv = async () => {
    try {
      await TravelService.exportCsv(dateFrom, dateTo);
    } catch (error) {
      toast.error('Error exporting CSV:')
      console.error(error)
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-gray-900 dark:text-white">Travels</CardTitle>
        <Button
          onClick={handleExportCsv}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {travels.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No travels found for the selected date range :/
          </div>
        )}
        <TravelTableContent 
          travelsData={travelsData} 
          onUpdate={onUpdateTravel} 
          onDelete={onDeleteTravel}
          onAddCrosses={onAddCrosses}
          onRemoveCrosses={onRemoveCrosses}
        />
      </CardContent>
    </Card>
  );
};

export default TravelTable;
