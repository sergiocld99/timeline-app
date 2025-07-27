import axios from "axios";
import { backendBaseUrl } from "../constants";

const baseUrl = `${backendBaseUrl}/visits`;

class VisitService {
  static getPersistentCalculatorUrl(date: string) {
    return `${baseUrl}/calculate/${date}?persist=true`;
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
}

export default VisitService;