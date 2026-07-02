"use client";

import type { Travel, TravelStats } from "@/types/travel";
import type { FilteringByCross } from "@/types/stats";

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useUser } from '@/contexts/UserContext';
import { useTravelStats } from '@/hooks/useTravelStats';
import TravelService from '@/services/TravelService';
import { translateDay } from '@/utils/date';
import { cn } from "@/lib/utils";

import ExportButton from './buttons/ExportButton';
import RemoveFilterBtn from './buttons/RemoveFilterBtn';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';
import TravelListContent from './mobile/TravelListContent';
import CrossSelector, { FILTER_ALL } from "./CrossSelector";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  onUpdateTravel?: (id: string, updates: Partial<Travel>) => Promise<Travel>;
  onDeleteTravel?: (id: string) => Promise<void>;
  onAddCrosses?: (travelId: string) => Promise<void>;
  onRemoveCrosses?: (travelId: string) => Promise<void>;
  onFilter?: (data?: FilteringByCross) => void;
  onRemoveFilter?: () => void;
  appliedFilter?: string | null;
};

const TravelTable = ({ travels, stats: initialStats, onUpdateTravel, onDeleteTravel, onAddCrosses, onRemoveCrosses, onFilter, onRemoveFilter, appliedFilter }: Props) => {
  const t = useTranslations();
  const { dateFrom, dateTo } = useDateRange();
  const { currentUser } = useUser();
  const { stats } = useTravelStats(travels, initialStats);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCrossSelectorDisabled, setIsCrossSelectorDisabled] = useState(false);
  const [selectedCrossId, setSelectedCrossId] = useState<string>(FILTER_ALL);

  // Calcular el número de días del rango actual
  const daysRange = (() => {
    if (!dateFrom || !dateTo) return 0;
    const from = new Date(dateFrom.split('T')[0]);
    const to = new Date(dateTo.split('T')[0]);
    const diffTime = to.getTime() - from.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  })();

  const placesCount = stats?.placesVisited?.count || 0;
  const isGold = daysRange > 0 && daysRange < 35 && placesCount >= 12;

  const handleExportCsv = async () => {
    try {
      const userId = currentUser?.userId;
      await TravelService.exportCsv(dateFrom, dateTo, userId);
    } catch (error) {
      toast.error(t("Travels.messages.exportError"))
      console.error(error)
    }
  };

  useEffect(() => {
    setIsCrossSelectorDisabled(!!appliedFilter)
    setSelectedCrossId(FILTER_ALL)
  }, [appliedFilter, dateFrom, dateTo, currentUser])

  return (
    <Card className={cn(
      "w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300",
      isGold && "border-2 border-amber-400 dark:border-amber-400 bg-amber-50/20 dark:bg-amber-950/20"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0 h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </Button>
          <CardTitle className="text-gray-900 dark:text-white">{t("Travels.title")}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            {onFilter && <CrossSelector onFilter={onFilter} selectedCrossId={selectedCrossId} setSelectedCrossId={setSelectedCrossId} isDisabled={isCrossSelectorDisabled} />}
          </div>
          {appliedFilter && onRemoveFilter && (
            <RemoveFilterBtn
              handleClick={onRemoveFilter}
              filterName={translateDay(appliedFilter, t)}
            />
          )}
          <ExportButton handleClick={handleExportCsv} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <DateRangeSelector isGold={isGold} />
        {travels.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("Travels.noTravelsFound")}
          </div>
        )}
        <div className="hidden lg:block">
          <TravelTableContent
            travels={travels}
            stats={stats}
            onUpdate={onUpdateTravel}
            onDelete={onDeleteTravel}
            onAddCrosses={onAddCrosses}
            onRemoveCrosses={onRemoveCrosses}
            isCollapsed={isCollapsed}
            isGold={isGold}
          />
        </div>
        <div className="lg:hidden">
          <TravelListContent travels={travels} stats={stats} isCollapsed={isCollapsed} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelTable;
