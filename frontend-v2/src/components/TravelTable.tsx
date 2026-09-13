"use client";

import type { Travel, TravelStats } from "@/types/travel";
import type { FilteringByCross } from "@/types/stats";
import type { TravelTableSource } from "@/types/props";

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useUser } from '@/contexts/UserContext';
import { useTravelStats } from '@/hooks/useTravelStats';
import usePagination from '@/hooks/usePagination';
import TravelService from '@/services/TravelService';
import { translateDay } from '@/utils/date';
import { cn } from "@/lib/utils";

import ExportButton from './buttons/ExportButton';
import RemoveFilterBtn from './buttons/RemoveFilterBtn';
import DateRangeSelector from './DateRangeSelector';
import TravelTableContent from './TravelTableContent';
import TravelTablePagination from './TravelTablePagination';
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
  source?: TravelTableSource;
};

const TravelTable = ({ travels, stats: initialStats, onUpdateTravel, onDeleteTravel, onAddCrosses, onRemoveCrosses, onFilter, onRemoveFilter, appliedFilter, source }: Props) => {
  const t = useTranslations();
  const { dateFrom, dateTo, daysRange } = useDateRange();
  const { currentUser } = useUser();
  const { stats } = useTravelStats(travels, initialStats);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCrossSelectorDisabled, setIsCrossSelectorDisabled] = useState(false);
  const [selectedCrossId, setSelectedCrossId] = useState<string>(FILTER_ALL);
  const { page, totalPages, pageItems, goToPage, next, prev } = usePagination(travels);
  const tableRef = useRef<HTMLDivElement>(null);

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGoToPage = (target: number) => {
    goToPage(target);
    scrollToTable();
  };

  const handleNext = () => {
    next();
    scrollToTable();
  };

  const handlePrev = () => {
    prev();
    scrollToTable();
  };

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
    <Card ref={tableRef} className={cn(
      "w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300",
      isGold && "border-2 border-amber-400 dark:border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    )}>
      <CardHeader className="grid grid-cols-[1fr_auto_1fr] items-center space-y-0 pb-2 gap-2">
        <div className="col-start-1 flex items-center gap-2">
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
        <TravelTablePagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} onGoToPage={handleGoToPage} className="col-start-2 hidden lg:flex" />
        <div className="col-start-3 flex items-center justify-end gap-2">
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
            pageItems={pageItems}
            stats={stats}
            onUpdate={onUpdateTravel}
            onDelete={onDeleteTravel}
            onAddCrosses={onAddCrosses}
            onRemoveCrosses={onRemoveCrosses}
            isCollapsed={isCollapsed}
            isGold={isGold}
            source={source}
          />
        </div>
        <div className="lg:hidden">
          <TravelListContent travels={pageItems} stats={stats} isCollapsed={isCollapsed} />
        </div>
        <TravelTablePagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} onGoToPage={handleGoToPage} className="justify-center" />
      </CardContent>
    </Card>
  );
};

export default TravelTable;
