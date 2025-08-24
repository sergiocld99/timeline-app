import axios from 'axios';

import type { FormData } from '../../types/commons';
import type { Travel } from '../../types/travel';
import { backendBaseUrl } from '../constants';

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

  static async getAll(dateFrom?: string, dateTo?: string) {
    const url = new URL(baseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
    if (dateTo) url.searchParams.append("dateTo", dateTo)

    try {
      const response = await axios.get<Travel[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching travels:", error);
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
}

export default TravelService;