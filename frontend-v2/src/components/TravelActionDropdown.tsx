"use client";

import { MoreVertical, Edit, Trash2, Plus, Minus, Info, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TravelActionDropdownProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onAddCrosses?: () => void;
  onRemoveCrosses?: () => void;
  onAddNote?: () => void;
  onViewDetails?: () => void;
}

export function TravelActionDropdown({
  onEdit,
  onDelete,
  onAddCrosses,
  onRemoveCrosses,
  onAddNote,
  onViewDetails,
}: TravelActionDropdownProps) {
  const t = useTranslations("Actions");
  const hasCrossesActions = onAddCrosses && onRemoveCrosses;
  const hasTravelsActions = onEdit && onDelete;

  if (!hasCrossesActions && !hasTravelsActions) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {hasTravelsActions && (
          <>
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{t("edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
            <DropdownMenuItem onClick={onAddNote} className="cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{t("addNote")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
              <Info className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{t("viewDetails")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t("delete")}</span>
            </DropdownMenuItem>
          </>
        )}
        {hasCrossesActions && (
          <>
            <DropdownMenuItem onClick={onAddCrosses} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{t("addCross")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveCrosses} className="cursor-pointer">
              <Minus className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{t("removeCross")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
