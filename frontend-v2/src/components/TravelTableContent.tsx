"use client";

import type { AxiosErrorResponse } from '@/types/commons';
import type { Travel, TravelEditValues, TravelStats } from '@/types/travel';

import { Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { successToast, errorToast } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useLocations from '@/hooks/useLocations';
import { extractTime, getEmojiForMode } from '@/utils';
import { renderWeight } from '@/utils/weight';
import { cn } from '@/lib/utils';

import TravelTableFooter from './TravelTableFooter';
import AddAction from './buttons/AddAction';
import DeleteAction from './buttons/DeleteAction';
import EditAction from './buttons/EditAction';
import MinusAction from './buttons/MinusAction';
import { Selector } from './common/Selector';

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
  const [editValues, setEditValues] = useState<TravelEditValues>({ distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { locations } = useLocations()

  const resetEdition = () => {
    setEditingId(null);
    setEditValues({ distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
  }

  const handleEdit = (travel: Travel) => {
    setEditingId(travel._id);
    setEditValues({
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
        errorToast('Please enter valid positive numbers for distance and duration');
        return;
      }

      // Validar que la duración no exceda 24 horas (1440 minutos)
      const maxDurationMinutes = 24 * 60; // 1440 minutos
      if (duration > maxDurationMinutes) {
        errorToast('Travel duration cannot exceed 24 hours (1440 minutes)');
        return;
      }

      await onUpdate(travel._id, {
        distance,
        endTime: new Date(new Date(travel.startTime).getTime() + duration * 60000).toISOString(),
        modeOfTransport: editValues.modeOfTransport,
        origin: locations.find(l => l.name === editValues.origin),
        destination: locations.find(l => l.name === editValues.destination),
        line: editValues.line
      });

      successToast('Travel updated successfully!');

      resetEdition()
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;

      errorToast(axiosError.response?.data?.message || 'Error updating travel');
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
      successToast('Travel deleted successfully!');
    } catch (error) {
      console.error('Error deleting travel:', error);
      errorToast('Failed to delete travel');
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

  const renderEditableLocation = (travel: Travel, field: 'origin' | 'destination') => {
    if (editingId === travel._id) {
      const eligibleLocations = locations.filter(l => l.zipcode === travel[field].zipcode)

      return (
        <Selector
          value={editValues[field]}
          onValueChange={(value) => handleInputChange(field, value)}
          eligibleValues={eligibleLocations.map(l => ({ value: l.name, label: l.name }))}
          minLength={2}
        />
      )
    }

    return (
      <span className="text-gray-900 dark:text-white">{travel[field].name}</span>
    )
  }

  const renderEditableModeOfTransport = (travel: Travel) => {
    if (editingId === travel._id) {
      const eligibleModes = ['car', 'taxi', 'bus', 'train', 'subway', 'ferry', 'walking']
      const eligibleValues = eligibleModes.map(mode => ({ value: mode, label: getEmojiForMode(mode) }))

      return (
        <div className="flex flex-col">
          <Selector
            value={editValues.modeOfTransport}
            onValueChange={(value) => handleInputChange('modeOfTransport', value)}
            eligibleValues={eligibleValues}
            minLength={1}
          />
          {editValues.modeOfTransport === 'bus' && (
            <Input
              type="text"
              placeholder="Line"
              value={editValues.line}
              onChange={(e) => handleInputChange('line', e.target.value)}
              className="mt-1 w-16 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          )}
        </div>
      );
    }

    const showLine = travel.modeOfTransport === 'bus' && travel.line;

    return (
      <div className="text-gray-900 dark:text-white">
        {showLine ? (
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {travel.line}
          </span>
        ) : (
          <span>{getEmojiForMode(travel.modeOfTransport)}</span>
        )}
      </div>
    );
  };

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
        <AddAction handleClick={() => { void onAddCrosses!(travel._id); }} />
        <MinusAction handleClick={() => { void onRemoveCrosses!(travel._id); }} />
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

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 dark:border-gray-700">
          {renderColumnHeaders()}
        </TableRow>
      </TableHeader>
      <TableBody>
        {travels.map((t) => (
          <TableRow
            key={t._id}
            className={cn(
              "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
              t.crosses?.length > 0 && "bg-yellow-50/50 dark:bg-yellow-900/20"
            )}
          >
            <TableCell className="text-gray-900 dark:text-white">{t.extractedDate}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableModeOfTransport(t)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableLocation(t, 'origin')}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableLocation(t, 'destination')}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{extractTime(t.startTime)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'distance', 0.1)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'duration', 1)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{t.speed.toFixed(1)} km/h</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderWeight(t)}</TableCell>
            <TableCell>{renderActionButtons(t)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TravelTableFooter travels={travels} stats={stats} />
    </Table>
  );
};

export default TravelTableContent;
