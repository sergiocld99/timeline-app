import type { StatByMode } from "@/types/stats";

import axios from 'axios';

import { backendBaseUrl } from "@/constants";

const baseUrl = `${backendBaseUrl}/stats`;

class StatsService {
  static async getTravelStatsByMode(dateFrom?: string, dateTo?: string, userId?: number) {
    const url = new URL(`${baseUrl}/travels/by-mode`);
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
    if (dateTo) url.searchParams.append("dateTo", dateTo)
    if (userId) url.searchParams.append("userId", userId.toString())

    try {
      const response = await axios.get<StatByMode[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}

export default StatsService