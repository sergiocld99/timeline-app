import axios from 'axios';

import type { FormData } from '@/types/commons';
import type { Travel } from '@/types/travel';
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

  static async getAll(dateFrom?: string, dateTo?: string, crossIds?: string[]) {
    const correctBaseUrl = crossIds ? `${baseUrl}/v2` : baseUrl
    const url = new URL(correctBaseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
    if (dateTo) url.searchParams.append("dateTo", dateTo)

    try {
      let response;

      if (crossIds) {
        response = await axios.post<Travel[]>(url.toString(), { crossIds });
      } else {
        response = await axios.get<Travel[]>(url.toString());
      }

      return response.data;
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