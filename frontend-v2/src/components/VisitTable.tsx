"use client";

import type { Visit, VisitsData } from '@/types/travel';
import { extractDate, extractTime, getHoursAndMinutes } from '@/utils';
import { renderTotalWeightsCell, renderWeight } from '@/utils/weight';
import DateRangeSelector from './DateRangeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { renderLocationWithZipcode } from './render/location';
import { renderPointWithCopyBtn } from './render/coordinates';

type Props = {
  visitsData: VisitsData;
  onDelete: (id: string) => Promise<void>;
};

const VisitTable = ({ visitsData, onDelete }: Props) => {
  const { visits } = visitsData;
  const [excludedVisits, setExcludedVisits] = useState<string[]>([]);
  const visibleVisits = visits.filter(visit => !excludedVisits.includes(visit._id));
  const totalMinutes = visibleVisits.reduce((sum, visit) => sum + visit.durationMinutes, 0);
  const totalPercentage = visibleVisits.reduce((sum, visit) => sum + visit.weight.percentage, 0);
  const totalLat = visibleVisits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / totalPercentage;
  const totalLong = visibleVisits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / totalPercentage;
  const columnHeaders = ['Date', 'Location', 'Arrival', 'Departure', 'Duration', 'Weight', 'Actions'];

  const handleDelete = (visit: Visit) => {
    onDelete(visit._id).then(() => {
      toast.success('Visit deleted');
    }).catch(() => {
      toast.error('Failed to delete visit');
    });
  }

  const handleToggleExclude = (visitId: string) => {
    setExcludedVisits((prev) =>
      prev.includes(visitId) ? prev.filter(id => id !== visitId) : [...prev, visitId]
    );
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
        <Button
          onClick={() => { handleToggleExclude(visit._id); }}
          size="sm"
          variant="outline"
          title="Exclude from weight calculation"
          className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
        >
          {
            excludedVisits.includes(visit._id) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />
          }
        </Button>
      </div>
    )
  }

  const getTableRowClassnames = (visit: Visit) => {
    let classNames = 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
    if (excludedVisits.includes(visit._id)) {
      classNames += ' opacity-50';
    }
    return classNames;
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
              <TableRow key={v._id} className={getTableRowClassnames(v)}>
                <TableCell className="text-gray-900 dark:text-white">{extractDate(v.date)}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{renderLocationWithZipcode(v.location)}</TableCell>
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
              <TableCell className="text-gray-900 dark:text-white" colSpan={3}>{renderPointWithCopyBtn(totalLat, totalLong)}</TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(visibleVisits)}</TableCell>
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
