"use client";

import type { AxiosErrorResponse } from '@/types/commons';
import type { Travel, TravelEditProps, TravelEditValues, TravelStats } from "@/types/travel";

import { Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useLocations from '@/hooks/useLocations';
import { extractTime } from '@/utils';
import { renderWeight } from '@/utils/weight';
import { cn } from '@/lib/utils';

import TravelTableFooter from './TravelTableFooter';
import MilestoneIcons, { getMilestones } from './TravelMilestones';
import AddAction from './buttons/AddAction';
import DeleteAction from './buttons/DeleteAction';
import EditAction from './buttons/EditAction';
import MinusAction from './buttons/MinusAction';
import DateCell from './cell/DateCell';
import TransportModeCell from './cell/TransportModeCell';
import LocationCell from './cell/LocationCell';

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  onUpdate?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDelete?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
};

const columnHeaders = ['Date', 'Mode', 'From', 'To', 'Start', 'Distance', 'Duration', 'Speed', 'Weight', 'Actions'];

const TravelTableContent = ({ travels, stats, onUpdate, onDelete, onAddCrosses, onRemoveCrosses }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TravelEditValues>({ date: '', distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
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
        toast.error('Please enter valid positive numbers for distance and duration');
        return;
      }

      // Validar que la duración no exceda 24 horas (1440 minutos)
      const maxDurationMinutes = 24 * 60; // 1440 minutos
      if (duration > maxDurationMinutes) {
        toast.error('Travel duration cannot exceed 24 hours (1440 minutes)');
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

      toast.success('Travel updated successfully!', { style: { background: 'green' } });

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
      toast.success('Travel deleted successfully!');
    } catch (error) {
      console.error('Error deleting travel:', error);
      toast.error('Failed to delete travel');
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
        title="Click to edit"
      >
        {field === 'distance' ? `${travel.distance} km` : `${travel.duration} min`}
      </span>
    );
  };

  const renderEditableLocation = (editProps: TravelEditProps, field: 'origin' | 'destination') => {
    return <LocationCell editProps={editProps} field={field} locations={locations} />
  }

  const renderTravelsTabActionButtons = (travel: Travel) => {
    return (
      <div className="flex space-x-2">
        <EditAction handleClick={() => { void handleEdit(travel); }} />
        <DeleteAction handleClick={() => { void handleDelete(travel); }} />
      </div>
    );
  }

  const renderCrossesTabActionButtons = (travel: Travel) => {
    return (
      <div className="flex space-x-2">
        <AddAction handleClick={() => { void onAddCrosses?.(travel._id); }} />
        <MinusAction handleClick={() => { void onRemoveCrosses?.(travel._id); }} />
      </div>
    )
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

    if (onAddCrosses && onRemoveCrosses) {
      return renderCrossesTabActionButtons(travel)
    }

    if (onUpdate && onDelete) {
      return renderTravelsTabActionButtons(travel)
    }

    return <></>
  };


  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
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
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 dark:border-gray-700">
          {renderColumnHeaders()}
        </TableRow>
      </TableHeader>
      <TableBody>
        {travels.map((t) => {
          const milestones = getMilestones(t, stats);
          const editProps = getEditProps(t);

          return (
            <TableRow
              key={t._id}
              className={cn(
                "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
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
              <TableCell className="text-gray-900 dark:text-white">{extractTime(t.startTime)}</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'distance', 0.1)}</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'duration', 1)}</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{t.speed.toFixed(1)} km/h</TableCell>
              <TableCell className="text-gray-900 dark:text-white">{renderWeight(t)}</TableCell>
              <TableCell>{renderActionButtons(t)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TravelTableFooter travels={travels} stats={stats} />
    </Table>
  );
};

export default TravelTableContent;
