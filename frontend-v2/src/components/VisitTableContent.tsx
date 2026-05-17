import type { AxiosErrorResponse } from '@/types/commons';
import type { Location } from "@/types/location";
import type { Visit } from "@/types/visit";;

import { Loader2, Save, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from "next-intl";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableFooter, TableHeader, TableRow } from '@/components/ui/table';
import { extractTime, getHoursAndMinutes } from '@/utils';
import { extractDate } from "@/utils/date";
import { renderTotalWeightsCell, renderWeight } from '@/utils/weight';

import { PointWithCopyBtn } from './render/coordinates';
import { renderLocationWithZipcode } from './render/location';

type Props = {
  visits: Visit[];
  onDelete: (id: string) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Visit>) => Promise<Visit>;
}

const VisitTableContent = ({ visits, onDelete, onUpdate }: Props) => {
  const t = useTranslations("Visits");
  const tRoot = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ date: string }>({ date: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [excludedVisits, setExcludedVisits] = useState<string[]>([]);
  const visibleVisits = visits.filter(visit => !excludedVisits.includes(visit._id));

  const totalMinutes = visibleVisits.reduce((sum, visit) => sum + visit.durationMinutes, 0);
  const totalPercentage = visibleVisits.reduce((sum, visit) => sum + visit.weight.percentage, 0);
  const totalLat = visibleVisits.reduce((sum, visit) => sum + visit.location.latitude * visit.weight.percentage, 0) / totalPercentage;
  const totalLong = visibleVisits.reduce((sum, visit) => sum + visit.location.longitude * visit.weight.percentage, 0) / totalPercentage;

  const columnHeaders = [
    t('tableHeaders.date'),
    t('tableHeaders.location'),
    t('tableHeaders.arrival'),
    t('tableHeaders.departure'),
    t('tableHeaders.duration'),
    t('tableHeaders.weight'),
    t('tableHeaders.actions')
  ];

  const handleDelete = (visit: Visit) => {
    onDelete(visit._id).then(() => {
      toast.success(t("messages.deleteSuccess"));
    }).catch(() => {
      toast.error(t("messages.deleteError"));
    });
  }

  const handleToggleExclude = (visitId: string) => {
    setExcludedVisits((prev) =>
      prev.includes(visitId) ? prev.filter(id => id !== visitId) : [...prev, visitId]
    );
  }

  const handleEdit = (visit: Visit) => {
    setEditingId(visit._id);
    setEditValues({
      date: visit.date
    });
  };

  const handleSave = async (visit: Visit) => {
    if (!onUpdate) return;

    try {
      setIsSaving(true);

      let newArrivalTime = visit.arrivalTime;
      if (visit.arrivalTime.includes('T')) {
        const timePart = visit.arrivalTime.split('T')[1];
        newArrivalTime = `${editValues.date}T${timePart}`;
      }

      const newDepartureTime = new Date(new Date(newArrivalTime).getTime() + visit.durationMinutes * 60000).toISOString();

      await onUpdate(visit._id, {
        date: editValues.date,
        arrivalTime: newArrivalTime,
        departureTime: newDepartureTime,
        location: visit.location._id as unknown as Location
      });
      toast.success(t("messages.updateSuccess"), { style: { background: 'green' } });
      setEditingId(null);
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;
      toast.error(axiosError.response?.data?.message || t("messages.updateError"), { style: { background: 'red' } });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const renderEditableDate = (visit: Visit) => {
    if (editingId === visit._id) {
      return (
        <Input
          type="date"
          value={editValues.date}
          required={true}
          onChange={(e) => setEditValues({ date: e.target.value })}
          className="w-36 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
      );
    }

    return (
      <span
        onClick={() => { handleEdit(visit); }}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
        title={t("tableHeaders.clickToEdit")}
      >
        {extractDate(visit.date, tRoot)}
      </span>
    );
  };

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  const renderActionButtons = (visit: Visit) => {
    if (editingId === visit._id) {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={() => { void handleSave(visit); }}
            size="sm"
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline" disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => { void handleDelete(visit); }}
          size="sm"
          variant="outline"
          title={t("tableHeaders.deleteVisit")}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => { handleToggleExclude(visit._id); }}
          size="sm"
          variant="outline"
          title={excludedVisits.includes(visit._id) ? t("tableHeaders.includeWeight") : t("tableHeaders.excludeWeight")}
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
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 dark:border-gray-700">
          {renderColumnHeaders()}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((v) => (
          <TableRow key={v._id} className={getTableRowClassnames(v)}>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableDate(v)}</TableCell>
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
          <TableCell className="text-gray-900 dark:text-white" colSpan={3}><PointWithCopyBtn latitude={totalLat} longitude={totalLong} /></TableCell>
          <TableCell className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</TableCell>
          <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(visibleVisits)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default VisitTableContent;