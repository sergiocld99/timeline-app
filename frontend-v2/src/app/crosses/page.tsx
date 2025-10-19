"use client";

import Header from "@/components/Header";
import CrossForm from "@/components/CrossForm";
import useCrosses from "@/hooks/useCrosses";
import CrossTable from "@/components/CrossTable";

const CrossesPage = () => {
  const { crosses, refetch } = useCrosses();

  return (
    <>
      <Header />
      <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex gap-8 px-8 w-full mx-auto">
          <div className="w-1/2">
            <CrossForm onSave={refetch} />
          </div>
          <div className="w-1/2">
            <CrossTable data={crosses} />
          </div>
        </div>
      </main>
    </>
  );
};

export default CrossesPage;
