"use client";

import type { AxiosErrorResponse } from '@/types/commons';
import type { Travel, TravelEditProps, TravelEditValues, TravelStats } from "@/types/travel";

import { Loader2, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useLocations from '@/hooks/useLocations';
import { extractTime } from '@/utils';
import { renderWeight } from '@/utils/weight';
import { cn } from '@/lib/utils';

import { TravelActionDropdown } from './TravelActionDropdown';
import TravelTableFooter from './TravelTableFooter';
import MilestoneIcons, { getMilestones } from './TravelMilestones';
import DateCell from './cell/DateCell';
import TransportModeCell from './cell/TransportModeCell';
import LocationCell from './cell/LocationCell';
import NoteModal from './modal/NoteModal';
import DetailsModal from './modal/DetailsModal';

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  onUpdate?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDelete?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
  isCollapsed?: boolean;
  isGold?: boolean;
};

const COLUMN_KEYS = ['date', 'mode', 'from', 'to', 'schedule', 'distance', 'duration', 'weight', 'actions'];

const TravelTableContent = ({ travels, stats, onUpdate, onDelete, onAddCrosses, onRemoveCrosses, isCollapsed, isGold = false }: Props) => {
  const t = useTranslations("Travels");
  const tMilestones = useTranslations("Milestones");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TravelEditValues>({ date: '', distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
  const [noteTravel, setNoteTravel] = useState<Travel | null>(null);
  const [detailsTravel, setDetailsTravel] = useState<Travel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { locations } = useLocations()

  const resetEdition = () => {
    setEditingId(null);
    setEditValues({ date: '', distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
  }

  const handleEdit = (travel: Travel) => {
    setEditingId(travel._id);
    const datePart = travel.startTime.split('T')[0];
    setEditValues({
      date: datePart,
      distance: travel.distance.toString(),
      duration: travel.duration.toString(),
      modeOfTransport: travel.modeOfTransport,
      origin: travel.origin.name,
      destination: travel.destination.name,
      line: travel.line || ''
    });
  };

  const handleSave = async (travel: Travel) => {
    if (!onUpdate) return;

    try {
      setIsSaving(true);
      const distance = parseFloat(editValues.distance);
      const duration = parseFloat(editValues.duration);

      if (isNaN(distance) || isNaN(duration) || distance <= 0 || duration <= 0) {
        toast.error(t("messages.invalidNumbers"));
        return;
      }

      // Validar que la duración no exceda 24 horas (1440 minutos)
      const maxDurationMinutes = 24 * 60; // 1440 minutos
      if (duration > maxDurationMinutes) {
        toast.error(t("messages.durationExceeded"));
        return;
      }

      let newStartTime = travel.startTime;
      if (travel.startTime.includes('T')) {
        const timePart = travel.startTime.split('T')[1];
        newStartTime = `${editValues.date}T${timePart}`;
      }

      const newEndTime = new Date(new Date(newStartTime).getTime() + duration * 60000).toISOString();

      await onUpdate(travel._id, {
        startTime: newStartTime,
        endTime: newEndTime,
        distance,
        modeOfTransport: editValues.modeOfTransport,
        origin: locations.find(l => l.name === editValues.origin),
        destination: locations.find(l => l.name === editValues.destination),
        line: editValues.line
      });

      toast.success(t("messages.updateSuccess"), { style: { background: 'green' } });

      resetEdition()
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;

      toast.error(axiosError.response?.data?.message, { style: { background: 'red' } })
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetEdition()
  };

  const handleInputChange = (field: keyof TravelEditValues, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (travel: Travel) => {
    if (!onDelete) return;

    try {
      setIsSaving(true);
      await onDelete(travel._id);
      toast.success(t("messages.deleteSuccess"));
    } catch (error) {
      console.error('Error deleting travel:', error);
      toast.error(t("messages.deleteError"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableCell = (travel: Travel, field: 'distance' | 'duration', step: number) => {
    if (editingId === travel._id) {
      return (
        <Input
          type="number"
          step={step}
          min="0"
          value={editValues[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-20 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
      );
    }

    return (
      <span
        onClick={() => { handleEdit(travel); }}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
        title={t("tooltips.clickToEdit")}
      >
        {field === 'distance' ? `${travel.distance} km` : `${travel.duration} min`}
      </span>
    );
  };

  const renderEditableLocation = (editProps: TravelEditProps, field: 'origin' | 'destination') => {
    return <LocationCell editProps={editProps} field={field} locations={locations} />
  }

  const renderActionButtons = (travel: Travel) => {
    if (editingId === travel._id) {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={() => { void handleSave(travel); }}
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
      <TravelActionDropdown
        onEdit={() => handleEdit(travel)}
        onDelete={onDelete ? () => { void handleDelete(travel); } : undefined}
        onAddCrosses={onAddCrosses ? () => { void onAddCrosses(travel._id); } : undefined}
        onRemoveCrosses={onRemoveCrosses ? () => { void onRemoveCrosses(travel._id); } : undefined}
        onAddNote={() => setNoteTravel(travel)}
        onViewDetails={() => setDetailsTravel(travel)}
      />
    );
  };

  const renderColumnHeaders = () => (
    COLUMN_KEYS.map((key) => (
      <TableHead key={key} className={cn("text-gray-700 dark:text-gray-300", isGold && "text-amber-900 dark:text-amber-200 font-semibold")}>{t(`tableHeaders.${key}`)}</TableHead>
    ))
  );

  const getEditProps = (travel: Travel): TravelEditProps => {
    return {
      travel,
      editingId,
      editValues,
      handleChange: handleInputChange
    }
  }

  return (
    <>
      <Table className={cn(isGold && "bg-amber-50/10 dark:bg-amber-950/5")}>
        {!isCollapsed && (
          <>
            <TableHeader className={cn(isGold && "bg-amber-100/40 dark:bg-amber-900/20")}>
              <TableRow className={cn("border-gray-200 dark:border-gray-700", isGold && "border-amber-200 dark:border-amber-800")}>
                {renderColumnHeaders()}
              </TableRow>
            </TableHeader>
            <TableBody>
              {travels.map((t) => {
                const milestones = getMilestones(t, tMilestones, stats);
                const editProps = getEditProps(t);

                return (
                  <TableRow
                    key={t._id}
                    className={cn(
                      "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      isGold && "border-amber-100/50 dark:border-amber-900/50 hover:bg-amber-100/30 dark:hover:bg-amber-100/10",
                      t.crosses?.length > 0 && "bg-purple-50/50 dark:bg-purple-900/20",
                      milestones.length > 0 && "bg-yellow-50/50 dark:bg-yellow-900/30"
                    )}
                  >
                    <TableCell className="text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <DateCell editProps={editProps} handleEdit={handleEdit} />
                        <MilestoneIcons milestones={milestones} />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white"><TransportModeCell editProps={editProps} /></TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{renderEditableLocation(editProps, 'origin')}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{renderEditableLocation(editProps, 'destination')}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-mono text-sm whitespace-nowrap">
                      <span>{extractTime(t.startTime)}</span>
                      <span className="text-gray-400 dark:text-gray-500 mx-1.5">→</span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{extractTime(t.endTime)}</span>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'distance', 0.1)}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'duration', 1)}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{renderWeight(t)}</TableCell>
                    <TableCell>{renderActionButtons(t)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </>
        )}
        <TravelTableFooter travels={travels} stats={stats} isGold={isGold} />
      </Table>

      <NoteModal travel={noteTravel} isSaving={isSaving} setTravel={setNoteTravel} setIsSaving={setIsSaving} onUpdate={onUpdate} />
      <DetailsModal travel={detailsTravel} setTravel={setDetailsTravel} />
    </>
  );
};

export default TravelTableContent;
