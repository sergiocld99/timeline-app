"use client";

import type { Travel, TravelsData } from '@/types/travel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';

type Props = {
  travelsData: TravelsData;
  onUpdateTravel: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDeleteTravel: (id: string) => Promise<void>;
};

const TravelTable = ({ travelsData, onUpdateTravel, onDeleteTravel }: Props) => {
  const { travels } = travelsData;

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Travels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        {travels.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No travels found for the selected date range. Add your first travel above!
          </div>
        )}
        <TravelTableContent 
          travels={travels} 
          onUpdate={onUpdateTravel} 
          onDelete={onDeleteTravel}
        />
      </CardContent>
    </Card>
  );
};

export default TravelTable;
