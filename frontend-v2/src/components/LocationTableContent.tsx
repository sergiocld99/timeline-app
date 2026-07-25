"use client";

import type { Location, LocationEditValues } from "@/types/location";

import { Save, X } from 'lucide-react';
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSortedSubdivisions } from "@/utils/subdivisions";
import { SUBDIVISIONS, getSubdivisionConfig } from "@/constants/subdivisions";
import { cn } from "@/lib/utils";
import { roundDecimals } from "@/utils/numbers";

import ArrivalsAction from "./buttons/ArrivalsAction";
import DeleteAction from "./buttons/DeleteAction";
import DeparturesAction from "./buttons/DeparturesAction";
import { SubdivisionCell } from "./cell/SubdivisionCell";
import EditAction from "./buttons/EditAction";

type Props = {
  locations: Location[];
  updateFn: (id: string, updates: Partial<Location>) => Promise<Location>;
  deleteFn: (id: string) => Promise<void>;
}

const LocationTableContent = ({ locations, updateFn, deleteFn }: Props) => {
  const t = useTranslations("Locations");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<LocationEditValues>({ name: '', zipcode: '', latitude: 0, longitude: 0, notes: '', partido: '' });

  // Sorted subdivision options per jurisdiction prefix, computed once for all rows.
  const sortedByPrefix = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const s of SUBDIVISIONS) map[s.prefix] = getSortedSubdivisions(locations, s.prefix).all;
    return map;
  }, [locations]);

  const columnHeaders = [
    t('tableHeaders.name'),
    t('tableHeaders.latitude'),
    t('tableHeaders.longitude'),
    t('tableHeaders.zipcode'),
    t('tableHeaders.zone'),
    t('tableHeaders.notes'),
    t('tableHeaders.actions')
  ];

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  const resetEditValues = () => {
    setEditingId(null);
    setEditValues({ name: '', zipcode: '', latitude: 0, longitude: 0, notes: '', partido: '' })
  }

  const renderActionButtons = (location: Location) => {
    if (editingId === location._id) {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              updateFn(location._id, editValues)
                .then(() => {
                  toast.success(t("messages.updateSuccess"))
                  resetEditValues()
                }).catch(() => toast.error(t("messages.updateError")))
            }}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button onClick={resetEditValues} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <EditAction handleClick={() => {
          setEditingId(location._id)
          setEditValues({
            name: location.name,
            zipcode: location.zipcode,
            latitude: roundDecimals(location.latitude, 4),
            longitude: roundDecimals(location.longitude, 4),
            notes: location.notes,
            partido: location.partido || ''
          })
        }} />
        <Link href={`/travels/to/${location._id}`} >
          <ArrivalsAction size="sm" />
        </Link>
        <Link href={`/travels/from/${location._id}`} >
          <DeparturesAction size="sm" />
        </Link>
        <DeleteAction handleClick={() => {
          if (window.confirm(t("messages.deleteConfirm", { name: location.name }))) {
            deleteFn(location._id)
              .then(() => toast.success(t("messages.deleteSuccess")))
              .catch((err) => {
                const message = err.response?.data?.message || err.message || t("messages.deleteError");
                toast.error(message);
              });
          }
        }} />
      </div>
    );
  }

  const renderEditableCell = (location: Location, field: 'name' | 'notes' | 'zipcode', customClassName = 'w-48') => {
    if (editingId === location._id) {
      return (
        <Input
          type="text"
          value={editValues[field]}
          onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
          className={cn("bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white", customClassName)}
        />
      );
    }

    return location[field]
  }

  const renderEditableCoordinate = (location: Location, field: 'latitude' | 'longitude') => {
    if (editingId === location._id) {
      return (
        <Input
          type="number"
          value={editValues[field]}
          onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
          className="w-28 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
      );
    }

    return location[field]?.toFixed(4)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 dark:border-gray-700">
          {renderColumnHeaders()}
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((l) => (
          <TableRow key={l._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <TableCell className="font-medium text-gray-900 dark:text-white">{renderEditableCell(l, 'name', 'w-44')}</TableCell>
            <TableCell className="text-gray-700 dark:text-gray-300">{renderEditableCoordinate(l, 'latitude')}</TableCell>
            <TableCell className="text-gray-700 dark:text-gray-300">{renderEditableCoordinate(l, 'longitude')}</TableCell>
            <TableCell className="text-gray-700 dark:text-gray-300">{renderEditableCell(l, 'zipcode', 'w-24')}</TableCell>
            <TableCell>
              <SubdivisionCell
                location={l}
                isEditing={editingId === l._id}
                value={editValues.partido}
                onChange={(value) => setEditValues(prev => ({ ...prev, partido: value }))}
                options={sortedByPrefix[getSubdivisionConfig(l.zipcode)?.prefix ?? ''] ?? []}
              />
            </TableCell>
            <TableCell className="text-gray-700 dark:text-gray-300">{renderEditableCell(l, 'notes', 'w-64')}</TableCell>
            <TableCell>{renderActionButtons(l)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default LocationTableContent;