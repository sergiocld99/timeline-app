"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDashQuery } from "@/hooks/useDashQuery";
import TravelDashboard from "@/components/TravelDashboard";
import Header from "@/components/Header";

const HomePageClient = () => {
  const { data, prevData, isLoading, error, currentFrom, currentTo } = useDashQuery();
  const t = useTranslations("Dashboard");

  return (
    <>
      <Header />
      {isLoading && (
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e8ff47]" />
        </div>
      )}
      {error && (
        <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center text-red-500">
          {t("errorLoadingStats")}
        </div>
      )}
      {data && (
        <TravelDashboard 
          stats={data} 
          prevStats={prevData || undefined} 
          currentFrom={currentFrom}
          currentTo={currentTo}
        />
      )}
    </>
  );
};

export default HomePageClient;
