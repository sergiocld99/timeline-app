import axios from 'axios';

import type { FormData } from '@/types/commons';
import type { Location } from '@/types/travel';
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
}

export default LocationService;