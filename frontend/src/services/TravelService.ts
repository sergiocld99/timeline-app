import axios from 'axios';

import type { FormData } from '../../types/commons';
import type { Travel } from '../../types/travel';
import { backendBaseUrl } from '../constants';

const baseUrl = `${backendBaseUrl}/travels`;

class TravelService {
  static async createTravel(travelData: FormData) {
    try {
      const response = await axios.post<Travel>(baseUrl, travelData);
      return response.data;
    } catch (error) {
      console.error("Error creating travel:", error);
      throw error;
    }
  }

  static async getTravels() {
    try {
      const response = await axios.get<Travel[]>(baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching travels:", error);
      throw error;
    }
  }
}

export default TravelService;