import type { FormData } from '@/types/commons';
import type { Cross } from '@/types/cross';

import axios from 'axios';

import { backendBaseUrl } from '@/constants';

const baseUrl = `${backendBaseUrl}/crosses`;

class CrossService {
  static async create(data: FormData) {
    try {
      const response = await axios.post<Cross>(baseUrl, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const response = await axios.get<Cross[]>(baseUrl);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const response = await axios.delete(`${baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default CrossService;