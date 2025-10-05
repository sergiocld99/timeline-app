"use client";

import type { Location } from "@/types/travel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  locations: Location[];
};

const LocationTable = ({ locations }: Props) => {
  const columnHeaders = ['Name', 'Latitude', 'Longitude', 'Zipcode', 'Notes'];

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              {renderColumnHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">{location.name}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{location.latitude.toFixed(4)}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{location.longitude.toFixed(4)}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{location.zipcode}</TableCell>
                <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">{location.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {locations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No locations found. Add your first location above!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTable;
