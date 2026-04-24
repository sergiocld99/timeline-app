import type { TravelDTO, TravelFindResult, TravelFormData } from "@/types/travel";

import axios from 'axios';

import { type Travel, type TravelsData, type TravelStats } from "@/types/travel";;
import { backendBaseUrl, v2BaseUrl } from '@/constants';

const baseUrl = `${backendBaseUrl}/travels`;

type FetchCustomParams = {
  dateFrom?: string,
  dateTo?: string,
  crossIds?: string[],
  sortingField?: string,
  locFrom?: string,
  locTo?: string,
  userId?: number
}

class TravelService {
  static async create(formData: TravelFormData, userId?: number) {
    const travelData = {
      ...formData,
      userId
    }

    try {
      const response = await axios.post<Travel>(baseUrl, travelData);
      return response.data;
    } catch (error) {
      console.error("Error creating travel:", error);
      throw error;
    }
  }

  static async getAll({ dateFrom, dateTo, crossIds, sortingField, userId, locFrom, locTo }: FetchCustomParams): Promise<TravelsData> {
    const correctBaseUrl = crossIds ? `${baseUrl}/v2` : baseUrl
    const url = new URL(correctBaseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom);
    if (dateTo) url.searchParams.append("dateTo", dateTo);
    if (sortingField) url.searchParams.append("sortingField", sortingField);
    if (userId) url.searchParams.append("userId", userId.toString());
    if (locFrom) url.searchParams.append("locFrom", locFrom);
    if (locTo) url.searchParams.append("locTo", locTo);

    try {
      let response;

      if (crossIds) {
        response = await axios.post<{ travels: Travel[], stats?: TravelsData['stats'] }>(url.toString(), { crossIds });
      } else {
        response = await axios.get<{ travels: Travel[], stats?: TravelsData['stats'] }>(url.toString());
      }

      // Handle both old format (array) and new format (object with travels and stats)
      if (Array.isArray(response.data)) {
        return { travels: response.data };
      }

      return {
        travels: response.data.travels,
        stats: response.data.stats
      };
    } catch (error) {
      throw error;
    }
  }

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

  static async update(id: string, travelData: Partial<Travel>) {
    try {
      const response = await axios.put<Travel>(`${baseUrl}/${id}`, travelData);
      return response.data;
    } catch (error) {
      console.error("Error updating travel:", error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await axios.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error("Error deleting travel:", error);
      throw error;
    }
  }

  static async exportCsv(dateFrom?: string, dateTo?: string, userId?: number) {
    try {
      const url = new URL(`${baseUrl}/export/csv`);
      if (dateFrom) url.searchParams.append("dateFrom", dateFrom);
      if (dateTo) url.searchParams.append("dateTo", dateTo);
      if (userId) url.searchParams.append("userId", userId.toString());

      const response = await axios.get(url.toString(), {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Generate filename from date range
      const fromLabel = dateFrom ? dateFrom.split('T')[0] : 'all';
      const toLabel = dateTo ? dateTo.split('T')[0] : 'all';
      link.download = `travels_${fromLabel}_${toLabel}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  }

  static async findAnyTravelsToCPs(zipcodes: string[], dateFrom?: string, dateTo?: string, userId?: number) {
    const url = new URL(`${baseUrl}/find-any`);
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom);
    if (dateTo) url.searchParams.append("dateTo", dateTo);
    if (userId) url.searchParams.append("userId", userId.toString());

    const result = await axios.post<TravelFindResult>(url.toString(), { zipcodes })

    return result.data
  }

  static async findLastTravel(origin: string, destination: string, userId?: number): Promise<Travel | null> {
    try {
      const url = new URL(`${baseUrl}/find-last`);
      url.searchParams.append("origin", origin);
      url.searchParams.append("destination", destination);
      if (userId) url.searchParams.append("userId", userId.toString());

      const response = await axios.get<Travel>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error finding last travel:", error);
      throw error;
    }
  }
}

export default TravelService;