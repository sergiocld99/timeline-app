"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { Cross } from "@/types/cross";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  data: Cross[];
  onCheckAnd: (checked: CheckedState, item: Cross) => void;
  onCheckEdit: (checked: CheckedState, item: Cross) => void;
};

const CrossTable = ({ data, onCheckAnd, onCheckEdit }: Props) => {
  const columnHeaders = ['Name', 'Latitude', 'Longitude', 'OR', 'EDIT'];

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Crosses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              {renderColumnHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">{item.name}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{item.latitude.toFixed(4)}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{item.longitude.toFixed(4)}</TableCell>
                <TableCell>
                  <Checkbox id={item._id} onCheckedChange={(checked) => onCheckAnd(checked, item)}/>
                </TableCell>
                <TableCell>
                  <Checkbox id={item._id} onCheckedChange={(checked) => onCheckEdit(checked, item)}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No crosses to show
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrossTable;
