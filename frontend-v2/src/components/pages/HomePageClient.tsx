"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import TravelService from "@/services/TravelService";
import TravelDashboard from "@/components/TravelDashboard";
import Header from "@/components/Header";
import { useUser } from "@/contexts/UserContext";

const HomePageClient = () => {
  const [dateFrom, setDateFrom] = useState("");
  const { currentUser, loading: userLoading } = useUser();

  useEffect(() => {
    const now = new Date();
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(now.getMonth() - 10);
    tenMonthsAgo.setDate(1); // Start of month
    setDateFrom(tenMonthsAgo.toISOString());
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["home_stats", dateFrom, currentUser],
    queryFn: async () => {
      if (!dateFrom) return null;
      const res = await TravelService.getAll({ 
        dateFrom, 
        userId: currentUser?.userId,
        statsOnly: true
      });
      return res.stats;
    },
    enabled: !!dateFrom && !userLoading,
  });

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
          Error loading statistics.
        </div>
      )}
      {data && <TravelDashboard stats={data} />}
    </>
  );
};

export default HomePageClient;
