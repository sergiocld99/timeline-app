"use client";

import Header from "@/components/Header";
import TravelForm from "@/components/TravelForm";

const CreatorPage = () => {
  return (
    <>
      <Header />
      <main className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-8">
          <TravelForm onTravelAdded={() => {}} />
        </div>
      </main>
    </>
  );
};

export default CreatorPage;
