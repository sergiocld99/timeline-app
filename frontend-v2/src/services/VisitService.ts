import type { Visit } from "@/types/visit";;

import axios from "axios";

import { backendBaseUrl } from "@/constants";

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

  static async update(id: string, visitData: Partial<Visit>) {
    try {
      const response = await axios.put<Visit>(`${baseUrl}/${id}`, visitData);
      return response.data;
    } catch (error) {
      console.error("Error updating visit:", error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await axios.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error("Error deleting visit:", error);
      throw error;
    }
  }
}

export default VisitService;