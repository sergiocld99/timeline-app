"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { Cross } from "@/types/cross";
import type { ReactNode } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import DeleteAction from "@/components/buttons/DeleteAction";
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
  onCheckOR: (checked: CheckedState, item: Cross) => void;
  onCheckEdit?: (checked: CheckedState, item: Cross) => void;
  deleteFn: (id: string) => Promise<void>;
  isMobile?: boolean;
};

const renderCell = (children: ReactNode) => (
  <TableCell className="text-gray-700 dark:text-gray-300">{children}</TableCell>
)

const renderCheckbox = (id: string, onCheckedChange: (checked: CheckedState) => void) => (
  <TableCell>
    <Checkbox id={id} onCheckedChange={onCheckedChange} />
  </TableCell>
)

const CrossTable = ({ data, onCheckOR, onCheckEdit, deleteFn, isMobile = false }: Props) => {
  const t = useTranslations("Crosses");
  const columnHeaders = !isMobile
    ? [t('name'), t('latitude'), t('longitude'), 'OR', 'EDIT', t('actions')]
    : [t('name'), 'OR', t('actions')];

  const handleDelete = (item: Cross) => {
    if (window.confirm(t("messages.deleteConfirm", { name: item.name }))) {
      deleteFn(item._id)
        .then(() => toast.success(t("messages.deleteSuccess")))
        .catch((err) => {
          const message = err.response?.data?.message || err.message || t("messages.deleteError");
          toast.error(message);
        });
    }
  };

  const renderColumnHeaders = () => (
    columnHeaders.map((header) => (
      <TableHead key={header} className="text-gray-700 dark:text-gray-300">{header}</TableHead>
    ))
  );

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t("crosses")}</CardTitle>
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
                {!isMobile && renderCell(item.latitude.toFixed(4))}
                {!isMobile && renderCell(item.longitude.toFixed(4))}
                {renderCheckbox(item._id, (checked) => onCheckOR(checked, item))}
                {onCheckEdit && renderCheckbox(item._id, (checked) => onCheckEdit(checked, item))}
                <TableCell>
                  <DeleteAction handleClick={() => handleDelete(item)} />
                </TableCell>
              </TableRow>)
            )}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("noCrosses")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrossTable;
