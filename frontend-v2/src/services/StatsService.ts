import type { TravelDTO, TravelStats } from "@/types/travel";

import axios from 'axios';

import { v2BaseUrl } from '@/constants';

class StatsService {
  static async getStats(travels: TravelDTO[]): Promise<TravelStats> {
    const endpointV2 = `${v2BaseUrl}/stats/travels/from-ids`

    try {
      const response = await axios.post<TravelStats>(endpointV2, { travels });
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }

  static async getDashboardStats(dateFrom: string, dateTo: string, userId?: number): Promise<TravelStats> {
    const url = new URL(`${v2BaseUrl}/stats/dashboard`);
    url.searchParams.append("dateFrom", dateFrom);
    url.searchParams.append("dateTo", dateTo);
    if (userId) url.searchParams.append("userId", userId.toString());

    try {
      const response = await axios.get<TravelStats>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
}

export default StatsService;
