import axios from "axios";

import type { Visit } from "@/types/travel";
import { backendBaseUrl } from "@/constants";

const baseUrl = `${backendBaseUrl}/visits`;

class VisitService {
  static getPersistentCalculatorUrl(date: string) {
    return `${baseUrl}/calculate/${date}?persist=true`;
  }

  static async getAll(dateFrom?: string, dateTo?: string) {
    const url = new URL(baseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
    if (dateTo) url.searchParams.append("dateTo", dateTo)

    try {
      const response = await axios.get<Visit[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching visits:", error);
      throw error;
    }
  }

  static async persistIfNeeded(date: string): Promise<boolean> {
    try {
      const response = await axios.get(this.getPersistentCalculatorUrl(date))
      return response.status === 201;
    } catch (error) {
      console.error("Error calculating and persisting visit:", error);
      return false;
    }
  }

  static async delete(id: string) {
    return axios.delete<Visit>(`${baseUrl}/${id}`)
      .then((response) => response.data)
      .catch((error) => { throw error });
  }
}

export default VisitService;