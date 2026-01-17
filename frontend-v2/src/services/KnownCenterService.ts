import type { KnownCenter } from '@/types/center';

import axios from 'axios';

import { backendBaseUrl } from '@/constants';

const baseUrl = `${backendBaseUrl}/known-centers`;

class KnownCenterService {
  static async getTopNKnownCenters(latitude: number, longitude: number, limit = 3, radiusKm = 10) {
    const response = await axios.get<KnownCenter[]>(`${baseUrl}`, { params: { latitude, longitude, limit, radiusKm } });
    return response.data;
  }
}

export default KnownCenterService;
