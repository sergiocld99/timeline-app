"use client";

import Header from "@/components/Header";
import VisitTable from "@/components/VisitTable";
import useVisits from "@/hooks/useVisits";

const VisitsPage = () => {
  const { visits, error, refetch } = useVisits();

  const handleUpdateDateRange = (dateFrom: string, dateTo: string) => {
    refetch(dateFrom, dateTo);
  };

  if (error) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600 dark:text-red-400">
            Error loading visits. Please try refreshing the page.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <VisitTable
            visitsData={visits}
            onUpdateDateRange={handleUpdateDateRange}
          />
        </div>
      </main>
    </>
  );
};

export default VisitsPage;
