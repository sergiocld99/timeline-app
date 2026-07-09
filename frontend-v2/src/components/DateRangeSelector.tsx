"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/routing";
import { useDateRange } from "@/contexts/DateRangeContext";
import { convertToFormDate } from "@/utils";
import { clearDateRangeFromUrl, isValidFormDateTime, replaceDateRangeInUrl } from "@/utils/dateRange";

import ApplyButton from "./buttons/ApplyButton";
import NextMonthBtn from "./buttons/NextMonthBtn";
import NextWeekBtn from "./buttons/NextWeekBtn";
import PreviousMonthBtn from "./buttons/PreviousMonthBtn";
import PreviousWeekBtn from "./buttons/PreviousWeekBtn";
import PurgeDateRangeBtn from "./buttons/PurgeDateRangeBtn";

const DATE_RANGE_PATHS = new Set(["/travels"]);

type Props = {
  isGold?: boolean;
}

const DateRangeSelector = ({ isGold = false }: Props) => {
  const t = useTranslations("DateRange");
  const pathname = usePathname();
  const { dateFrom: contextDateFrom, dateTo: contextDateTo, updateDateRange, resetDateRange } = useDateRange();
  const [dateFrom, setDateFrom] = useState(contextDateFrom);
  const [dateTo, setDateTo] = useState(contextDateTo);

  const isDateFromInvalid = !isValidFormDateTime(dateFrom);
  const isDateToInvalid = !isValidFormDateTime(dateTo);
  const isInvalidRange = !isDateFromInvalid && !isDateToInvalid && new Date(dateFrom) > new Date(dateTo);
  const isApplyDisabled = isDateFromInvalid || isDateToInvalid || isInvalidRange;

  const syncDateRangeToUrl = (from: string, to: string) => {
    if (!DATE_RANGE_PATHS.has(pathname)) return;
    replaceDateRangeInUrl(from, to);
  };

  // Sync local state with context when context changes
  useEffect(() => {
    setDateFrom(contextDateFrom);
    setDateTo(contextDateTo);
  }, [contextDateFrom, contextDateTo]);

  const handleChangeDateFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
  };

  const handleChangeDateTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
  };

  const handleDayMovement = (dayDiff = -7 | 7) => {
    const targetFrom = new Date(contextDateFrom)
    const targetTo = new Date(contextDateTo)

    targetFrom.setDate(targetFrom.getDate() + dayDiff)
    targetFrom.setHours(targetFrom.getHours() - 3)

    targetTo.setDate(targetTo.getDate() + dayDiff)
    targetTo.setHours(targetTo.getHours() - 3)

    const dateFromStr = convertToFormDate(targetFrom)
    const dateToStr = convertToFormDate(targetTo)

    setDateFrom(dateFromStr)
    setDateTo(dateToStr)
    updateDateRange(dateFromStr, dateToStr)
    syncDateRangeToUrl(dateFromStr, dateToStr)
  }

  const handleApply = () => {
    if (!isValidFormDateTime(dateFrom) || !isValidFormDateTime(dateTo)) {
      alert(t("invalidDate"));
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      alert(t("invalidRange"));
      return;
    }
    updateDateRange(dateFrom, dateTo);
    syncDateRangeToUrl(dateFrom, dateTo);
  };

  const handlePurge = () => {
    resetDateRange();
    if (DATE_RANGE_PATHS.has(pathname)) clearDateRangeFromUrl();
  };

  return (
    <Card className={cn(
      "w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300",
      isGold && "border-amber-300/40 dark:border-amber-300/40 bg-amber-100/10 dark:bg-black/30"
    )}>
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="hidden lg:block pt-6 flex-row space-x-2">
            <PreviousMonthBtn handleClick={() => handleDayMovement(-30)} />
            <PreviousWeekBtn handleClick={() => handleDayMovement(-7)} />
          </div>

          <div className="lg:hidden flex-row space-x-4">
            <PreviousMonthBtn handleClick={() => handleDayMovement(-30)} />
            <PreviousWeekBtn handleClick={() => handleDayMovement(-7)} />
            <NextWeekBtn handleClick={() => handleDayMovement(+7)} />
            <NextMonthBtn handleClick={() => handleDayMovement(+30)} />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="date_from" className={cn("text-gray-700 dark:text-gray-300", isGold && "text-amber-800 dark:text-amber-300")}>{t("from")}</Label>
            <Input
              type="datetime-local"
              name="date_from"
              id="date_from"
              onChange={handleChangeDateFrom}
              value={dateFrom}
              className={cn(
                "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
                isGold && "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/50 dark:border-amber-800/40 text-amber-900 dark:text-amber-100 focus-visible:ring-amber-500",
                (isDateFromInvalid || isInvalidRange) && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="date_to" className={cn("text-gray-700 dark:text-gray-300", isGold && "text-amber-800 dark:text-amber-300")}>{t("to")}</Label>
            <Input
              type="datetime-local"
              name="date_to"
              id="date_to"
              onChange={handleChangeDateTo}
              value={dateTo}
              className={cn(
                "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
                isGold && "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/50 dark:border-amber-800/40 text-amber-900 dark:text-amber-100 focus-visible:ring-amber-500",
                (isDateToInvalid || isInvalidRange) && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>

          <div className="hidden lg:block pt-6 flex-row space-x-2">
            <NextWeekBtn handleClick={() => handleDayMovement(+7)} />
            <NextMonthBtn handleClick={() => handleDayMovement(+30)} />
          </div>

          <div className="pt-6 flex flex-row gap-2">
            <ApplyButton handleClick={handleApply} disabled={isApplyDisabled} isGold={isGold} />
            <PurgeDateRangeBtn handleClick={handlePurge} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
