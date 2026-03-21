import type { FormData } from '@/types/commons';
import type { Location } from "@/types/location";;

import axios from 'axios';

import { backendBaseUrl } from '@/constants';

const baseUrl = `${backendBaseUrl}/locations`;

class LocationService {
  static async create(locationData: FormData) {
    try {
      const response = await axios.post<Location>(baseUrl, locationData);
      return response.data;
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const response = await axios.get<Location[]>(baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<Location>) {
    try {
      const response = await axios.put<Location>(`${baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error on update:", error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const response = await axios.delete(`${baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }
}

export default LocationService;