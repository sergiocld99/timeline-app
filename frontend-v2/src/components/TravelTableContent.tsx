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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { TravelActionDropdown } from './TravelActionDropdown';
import TravelTableFooter from './TravelTableFooter';
import MilestoneIcons, { getMilestones } from './TravelMilestones';
import DateCell from './cell/DateCell';
import TransportModeCell from './cell/TransportModeCell';
import LocationCell from './cell/LocationCell';
import NoteModal from './modal/NoteModal';

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  onUpdate?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDelete?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
  isCollapsed?: boolean;
};

const COLUMN_KEYS = ['date', 'mode', 'from', 'to', 'schedule', 'distance', 'duration', 'weight', 'actions'];

const TravelTableContent = ({ travels, stats, onUpdate, onDelete, onAddCrosses, onRemoveCrosses, isCollapsed }: Props) => {
  const t = useTranslations("Travels");
  const tMilestones = useTranslations("Milestones");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TravelEditValues>({ date: '', distance: '', duration: '', modeOfTransport: '', origin: '', destination: '', line: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { locations } = useLocations()

  const [noteTravel, setNoteTravel] = useState<Travel | null>(null);
  const [detailsTravel, setDetailsTravel] = useState<Travel | null>(null);

  const handleOpenNote = (travel: Travel) => {
    setNoteTravel(travel);
  };

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
        onAddNote={() => handleOpenNote(travel)}
        onViewDetails={() => setDetailsTravel(travel)}
      />
    );
  };


  const renderColumnHeaders = () => (
    COLUMN_KEYS.map((key) => (
      <TableHead key={key} className="text-gray-700 dark:text-gray-300">{t(`tableHeaders.${key}`)}</TableHead>
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
      <Table>
        {!isCollapsed && (
          <>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-gray-700">
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
        <TravelTableFooter travels={travels} stats={stats} />
      </Table>

      {/* Modal para agregar/editar nota */}
      <NoteModal travel={noteTravel} isSaving={isSaving} setTravel={setNoteTravel} setIsSaving={setIsSaving} onUpdate={onUpdate} />

      {/* Modal para ver detalles */}
      <Dialog open={!!detailsTravel} onOpenChange={(open) => !open && setDetailsTravel(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Travel Details</DialogTitle>
          </DialogHeader>
          {detailsTravel && (
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.from") || "Origin"}</h4>
                  <p>{detailsTravel.origin.name}</p>
                  {detailsTravel.origin.zipcode && (
                    <p className="text-xs text-gray-400">Zip: {detailsTravel.origin.zipcode}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.to") || "Destination"}</h4>
                  <p>{detailsTravel.destination.name}</p>
                  {detailsTravel.destination.zipcode && (
                    <p className="text-xs text-gray-400">Zip: {detailsTravel.destination.zipcode}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.schedule") || "Schedule"}</h4>
                  <p>
                    {new Date(detailsTravel.startTime).toLocaleString()} 
                    <br />
                    <span className="text-gray-400 font-medium">to</span> 
                    <br />
                    {new Date(detailsTravel.endTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.mode") || "Transport Mode"}</h4>
                  <p className="capitalize">{detailsTravel.modeOfTransport}</p>
                  {detailsTravel.line && (
                    <p className="text-xs text-gray-400">Line: {detailsTravel.line}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-3 gap-2">
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.distance") || "Distance"}</h4>
                  <p>{detailsTravel.distance} km</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.duration") || "Duration"}</h4>
                  <p>{detailsTravel.duration} min</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("tableHeaders.speed") || "Speed"}</h4>
                  <p>{detailsTravel.speed?.toFixed(1) || 0} km/h</p>
                </div>
              </div>

              {detailsTravel.crosses && detailsTravel.crosses.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                  <h4 className="font-semibold text-gray-500 dark:text-gray-400">Crosses</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detailsTravel.crosses.map((c) => (
                      <span key={c._id} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-0.5 rounded">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <h4 className="font-semibold text-gray-500 dark:text-gray-400">{t("notes") || "Notes"}</h4>
                {detailsTravel.notes ? (
                  <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-gray-700 dark:text-gray-300 italic mt-1 border border-gray-100 dark:border-gray-800">
                    {detailsTravel.notes}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic mt-1">No notes added yet.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsTravel(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TravelTableContent;
