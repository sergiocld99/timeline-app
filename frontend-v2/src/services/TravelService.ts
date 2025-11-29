import axios from 'axios';

import type { FormData } from '@/types/commons';
import type { Travel, TravelsData } from '@/types/travel';
import { backendBaseUrl } from '@/constants';

const baseUrl = `${backendBaseUrl}/travels`;

class TravelService {
  static async create(travelData: FormData) {
    try {
      const response = await axios.post<Travel>(baseUrl, travelData);
      return response.data;
    } catch (error) {
      console.error("Error creating travel:", error);
      throw error;
    }
  }

  static async getAll(dateFrom?: string, dateTo?: string, crossIds?: string[], sortingField?: string): Promise<TravelsData> {
    const correctBaseUrl = crossIds ? `${baseUrl}/v2` : baseUrl
    const url = new URL(correctBaseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom);
    if (dateTo) url.searchParams.append("dateTo", dateTo);
    if (sortingField) url.searchParams.append("sortingField", sortingField)

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
      const response = await axios.delete<Travel>(`${baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting travel:", error);
      throw error;
    }
  }
}

export default TravelService;