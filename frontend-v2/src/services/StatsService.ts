import type { PlacesVisited, TravelDTO, TravelStats } from "@/types/travel";

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
    const url = this.getUrlWithParams('dashboard', dateFrom, dateTo, userId);

    try {
      const response = await axios.get<TravelStats>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  static async getMonthlyPlaces(dateFrom: string, dateTo: string, userId?: number): Promise<PlacesVisited> {
    const url = this.getUrlWithParams('monthly-places', dateFrom, dateTo, userId);

    try {
      const response = await axios.get<PlacesVisited>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly places:", error);
      throw error;
    }
  }

  static getUrlWithParams(endpoint: string, dateFrom: string, dateTo: string, userId?: number) {
    const url = new URL(`${v2BaseUrl}/stats/${endpoint}`);

    url.searchParams.append("dateFrom", dateFrom);
    url.searchParams.append("dateTo", dateTo);
    if (userId) url.searchParams.append("userId", userId.toString());

    return url
  }
}

export default StatsService;
