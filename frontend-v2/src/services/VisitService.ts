import axios from "axios";

import { backendBaseUrl } from "@/constants";
import type { Visit } from "@/types/travel";

const baseUrl = `${backendBaseUrl}/visits`;

class VisitService {
  static getPersistentCalculatorUrl(date: string, userId?: number) {
    const url = new URL(`${baseUrl}/calculate/${date}`);
    url.searchParams.append("persist", "true");
    if (userId) url.searchParams.append("userId", userId.toString());
    return url.toString();
  }

  static async getAll(dateFrom?: string, dateTo?: string, userId?: number) {
    const url = new URL(baseUrl)
    if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
    if (dateTo) url.searchParams.append("dateTo", dateTo)
    if (userId) url.searchParams.append("userId", userId.toString())

    try {
      const response = await axios.get<Visit[]>(url.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching visits:", error);
      throw error;
    }
  }

  static async persistIfNeeded(date: string, userId?: number): Promise<boolean> {
    try {
      const response = await axios.get(this.getPersistentCalculatorUrl(date, userId))
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