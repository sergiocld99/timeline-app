"use client";

import { useState } from 'react';
import type { Travel, TravelEditValues } from '@/types/travel';
import { getEmojiForMode, getHoursAndMinutes } from '@/utils';
import { renderTotalWeightsCell, renderWeight } from '@/utils/weight';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit3, Trash2, Save, X, Loader2, CircleMinus, CirclePlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  travels: Travel[];
  onUpdate?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDelete?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
};

const TravelTableContent = ({ travels, onUpdate, onDelete, onAddCrosses, onRemoveCrosses }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TravelEditValues>({ distance: '', duration: '', modeOfTransport: '' });
  const [isSaving, setIsSaving] = useState(false);

  const totalMinutes = travels.reduce((total, travel) => total + travel.duration, 0);
  const totalDistance = travels.reduce((total, travel) => total + travel.distance, 0);

  const totalLat = travels.reduce((total, travel) => {
    const currentLat = (travel.origin.latitude + travel.destination.latitude) / 200;
    return total + currentLat * travel.weight.percentage;
  }, 0);

  const totalLong = travels.reduce((total, travel) => {
    const currentLong = (travel.origin.longitude + travel.destination.longitude) / 200;
    return total + currentLong * travel.weight.percentage;
  }, 0);

  const placesVisited = travels.reduce((total, travel) => {
    total.add(travel.origin._id);
    total.add(travel.destination._id);
    return total;
  }, new Set<string>());

  const handleEdit = (travel: Travel) => {
    setEditingId(travel._id);
    setEditValues({
      distance: travel.distance.toString(),
      duration: travel.duration.toString(),
      modeOfTransport: travel.modeOfTransport
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

      await onUpdate(travel._id, {
        distance,
        endTime: new Date(new Date(travel.startTime).getTime() + duration * 60000).toISOString(),
        modeOfTransport: editValues.modeOfTransport
      });

      setEditingId(null);
      setEditValues({ distance: '', duration: '', modeOfTransport: '' });
    } catch (error) {
      console.error('Error updating travel:', error);
      toast.error('Failed to update travel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ distance: '', duration: '', modeOfTransport: '' });
  };

  const handleInputChange = (field: 'distance' | 'duration', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleModeOfTransportChange = (value: string) => {
    setEditValues(prev => ({ ...prev, modeOfTransport: value }));
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

  const renderEditableModeOfTransport = (travel: Travel) => {
    if (editingId === travel._id) {
      return (
        <Select value={editValues.modeOfTransport} onValueChange={(value) => handleModeOfTransportChange(value)}>
          <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="car">🚘</SelectItem>
            <SelectItem value="taxi">🚖</SelectItem>
            <SelectItem value="bus">🚍</SelectItem>
            <SelectItem value="train">🚉</SelectItem>
            <SelectItem value="subway">🚇</SelectItem>
            <SelectItem value="ferry">⛴️</SelectItem>
            <SelectItem value="walking">🚶🏽</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <span className="text-gray-900 dark:text-white">{getEmojiForMode(travel.modeOfTransport)}</span>
    );
  };

  const renderTravelsTabActionButtons = (travel: Travel) => {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => { void handleEdit(travel); }}
          size="sm"
          variant="outline"
          title="Edit travel"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => { void handleDelete(travel); }}
          size="sm"
          variant="outline"
          title="Delete travel"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const renderCrossesTabActionButtons = (travel: Travel) => {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => { void onAddCrosses!(travel._id); }}
          size="sm"
          variant="outline"
          title="Add crosses"
        >
          <CirclePlus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => { void onRemoveCrosses!(travel._id); }}
          size="sm"
          variant="outline"
          title="Remove crosses"
        >
          <CircleMinus className="h-4 w-4" />
        </Button>
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

    return renderTravelsTabActionButtons(travel)
  };

  const columnHeaders = ['Date', 'Mode', 'From', 'To', 'Distance', 'Duration', 'Speed', 'Weight', 'Actions'];

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
          <TableRow key={t._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <TableCell className="text-gray-900 dark:text-white">{t.shortDate}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableModeOfTransport(t)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{t.origin.name}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{t.destination.name}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'distance', 0.1)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderEditableCell(t, 'duration', 1)}</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{t.speed.toFixed(1)} km/h</TableCell>
            <TableCell className="text-gray-900 dark:text-white">{renderWeight(t)}</TableCell>
            <TableCell>{renderActionButtons(t)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <TableCell className="font-medium text-gray-900 dark:text-white">Total</TableCell>
          <TableCell className="text-gray-900 dark:text-white" colSpan={2}>
            {totalLat.toFixed(4)}, {totalLong.toFixed(4)}
          </TableCell>
          <TableCell className="font-medium text-gray-900 dark:text-white">{placesVisited.size} places</TableCell>
          <TableCell className="font-medium text-gray-900 dark:text-white">{totalDistance.toFixed(0)} km</TableCell>
          <TableCell className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</TableCell>
          <TableCell className="font-medium text-gray-900 dark:text-white">
            {totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h
          </TableCell>
          <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(travels)}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default TravelTableContent;
