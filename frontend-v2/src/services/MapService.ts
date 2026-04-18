import type { MapConfig } from "@/types/map";
import type { TravelDTO } from "@/types/travel";

import axios from "axios";

const v2BaseUrl = "http://localhost:8081/api/v2";

class MapService {
  static async getMapConfig(travels: TravelDTO[]): Promise<MapConfig | null> {
    const endpointV2 = `${v2BaseUrl}/stats/travels/map-config`

    try {
      const response = await axios.post<MapConfig>(endpointV2, { travels });
      return response.data;
    } catch (error) {
      console.error("Error fetching map config:", error);
      throw error;
    }
  }
}

export default MapService;
