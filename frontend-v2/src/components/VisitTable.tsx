"use client";

import type { Visit, VisitsData } from '@/types/travel';
import { extractDate, extractTime, getHoursAndMinutes } from '@/utils';
import { renderTotalWeightsCell, renderWeight } from '@/utils/weight';
import DateRangeSelector from './DateRangeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

type Props = {
  visitsData: VisitsData;
  onDelete: (id: string) => Promise<void>;
};

const VisitTable = ({ visitsData, onDelete }: Props) => {
  const { visits } = visitsData;
  const totalMinutes = visits.reduce((sum, visit) => sum + visit.durationMinutes, 0);
  const totalLat = visits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / 100;
  const totalLong = visits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / 100;
  const columnHeaders = ['Date', 'Location', 'Arrival', 'Departure', 'Duration', 'Weight', 'Actions'];

  const handleDelete = (visit: Visit) => {
    onDelete(visit._id).then(() => {
      toast.success('Visit deleted');
    }).catch(() => {
      toast.error('Failed to delete visit');
    });
  }

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  const renderActionButtons = (visit: Visit) => {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => { void handleDelete(visit); }}
          size="sm"
          variant="outline"
          title="Delete travel"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Visits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangeSelector />
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              {renderColumnHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="text-gray-900 dark:text-white">{extractDate(v.date)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{v.location.name}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{extractTime(v.arrivalTime)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{extractTime(v.departureTime)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{getHoursAndMinutes(v.durationMinutes)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{renderWeight(v)}</TableCell>
                <TableCell>{renderActionButtons(v)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <TableCell className="font-medium text-gray-900 dark:text-white">Total</TableCell>
              <TableCell className="text-gray-900 dark:text-white" colSpan={3}>
                {totalLat.toFixed(4)}, {totalLong.toFixed(4)}
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(visits)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {visits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No visits found for the selected date range.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitTable;
