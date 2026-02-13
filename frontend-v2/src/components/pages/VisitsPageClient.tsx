"use client";

import GravityCenterScoreboard from "@/components/GravityCenterScoreboard";
import VisitStats from "@/components/VisitStats";
import VisitTable from "@/components/VisitTable";
import useVisits from "@/hooks/useVisits";

const VisitsPageClient = () => {
  const { visits, error, deleteVisit } = useVisits();

  if (error) {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading visits. Please try refreshing the page.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-8">
        <div className="hidden lg:flex gap-8">
          <GravityCenterScoreboard visitsData={visits} />
          <VisitStats visitsData={visits} />
        </div>
        <VisitTable
          visitsData={visits}
          onDelete={deleteVisit}
        />
      </div>
    </main>
  );
};

export default VisitsPageClient;

