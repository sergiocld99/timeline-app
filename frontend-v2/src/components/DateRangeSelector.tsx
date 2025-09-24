"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStartDateFromCurrent, getTodayEndTime } from "@/utils";
import { Check } from "lucide-react";

type Props = {
  onUpdate: (dateFrom: string, dateTo: string) => void;
  currentDateFrom?: string;
  currentDateTo?: string;
};

const DateRangeSelector = ({ onUpdate, currentDateFrom, currentDateTo }: Props) => {
  const [dateFrom, setDateFrom] = useState(currentDateFrom ?? getStartDateFromCurrent(30));
  const [dateTo, setDateTo] = useState(currentDateTo ?? getTodayEndTime());

  const handleChangeDateFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
  };

  const handleChangeDateTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
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
          
          <div className="pt-6">
            <Button 
              type="button" 
              onClick={() => onUpdate(dateFrom, dateTo)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector;
