"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { ACCENT2, ACCENT3, ACCENT4 } from "@/constants/colors";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import useTravelFilter from "@/hooks/useTravelFilter";
import useTravels from "@/hooks/useTravels";

import LineRanking from "../lines/LineRanking";
import TravelTable from "../tables/TravelTable";

const PAGE_CLASS_NAME = "mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen";

const LinesExplorer = () => {
  const t = useTranslations("Lines");
  const tableRef = useRef<HTMLDivElement>(null);
  const { travels: travelsData, error, loading, updateTravel, deleteTravel } = useTravels('duration', '', '', 'bus', true);
  const { filteredTravels, appliedFilter, onFilter } = useTravelFilter(travelsData.travels);
  const byLine = travelsData.stats?.byLine ?? [];
  const totalRides = byLine.reduce((sum, stat) => sum + stat.count, 0);
  const totalKm = Math.round(byLine.reduce((sum, stat) => sum + stat.totalKm, 0));

  const handleRemoveFilter = () => {
    onFilter();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectLine = (line: string) => {
    if (appliedFilter === line) {
      handleRemoveFilter();
      return;
    }

    onFilter({ type: "line", value: line });
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderMessage = (message: string) => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="py-10 text-center text-gray-500 dark:text-gray-400">{message}</CardContent>
    </Card>
  );

  if (loading) return <main className={PAGE_CLASS_NAME}>{renderMessage(t("loading"))}</main>;
  if (error) return <main className={PAGE_CLASS_NAME}>{renderMessage(t("error"))}</main>;

  return (
    <main className={PAGE_CLASS_NAME}>
      <div className="space-y-6">
        {byLine.length === 0 ? (
          renderMessage(t("empty"))
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: t("summary.lines"), value: byLine.length, accent: ACCENT2 },
                { label: t("summary.rides"), value: totalRides, accent: ACCENT4 },
                { label: t("summary.km"), value: totalKm, accent: ACCENT3 },
              ].map(({ label, value, accent }) => (
                <Card
                  key={label}
                  className="bg-[#111118] border-[#2a2a3a] gap-0"
                  style={{ borderTop: `2px solid ${accent}` }}
                >
                  <CardContent className="py-4">
                    <div className="text-xs font-['Space_Mono'] uppercase tracking-[2px] text-gray-400">{label}</div>
                    <div className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <LineRanking stats={byLine} selectedLine={appliedFilter} onSelect={handleSelectLine} />

            <div ref={tableRef} className="scroll-mt-6">
              <TravelTable
                travels={filteredTravels}
                stats={travelsData.stats}
                onUpdateTravel={updateTravel}
                onDeleteTravel={deleteTravel}
                onRemoveFilter={handleRemoveFilter}
                appliedFilter={appliedFilter}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

const LinesPageClient = () => (
  <DateRangeProvider initialDays={365}>
    <LinesExplorer />
  </DateRangeProvider>
);

export default LinesPageClient;
