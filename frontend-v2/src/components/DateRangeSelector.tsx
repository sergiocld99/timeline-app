"use client";

import { useEffect,useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDateRange } from "@/contexts/DateRangeContext";
import { convertToFormDate } from "@/utils";

import ApplyButton from "./buttons/ApplyButton";
import NextMonthBtn from "./buttons/NextMonthBtn";
import NextWeekBtn from "./buttons/NextWeekBtn";
import PreviousMonthBtn from "./buttons/PreviousMonthBtn";
import PreviousWeekBtn from "./buttons/PreviousWeekBtn";

const DateRangeSelector = () => {
  const { dateFrom: contextDateFrom, dateTo: contextDateTo, updateDateRange } = useDateRange();
  const [dateFrom, setDateFrom] = useState(contextDateFrom);
  const [dateTo, setDateTo] = useState(contextDateTo);

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
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="pt-6 flex-row space-x-2">
            <PreviousMonthBtn handleClick={() => handleDayMovement(-30)} />
            <PreviousWeekBtn handleClick={() => handleDayMovement(-7)} />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="date_from" className="text-gray-700 dark:text-gray-300">From</Label>
            <Input
              type="datetime-local"
              name="date_from"
              id="date_from"
              onChange={handleChangeDateFrom}
              value={dateFrom}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="date_to" className="text-gray-700 dark:text-gray-300">To</Label>
            <Input
              type="datetime-local"
              name="date_to"
              id="date_to"
              onChange={handleChangeDateTo}
              value={dateTo}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="pt-6 flex-row space-x-2">
            <NextWeekBtn handleClick={() => handleDayMovement(+7)} />
            <NextMonthBtn handleClick={() => handleDayMovement(+30)} />
          </div>

          <div className="pt-6">
            <ApplyButton handleClick={() => updateDateRange(dateFrom, dateTo)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
