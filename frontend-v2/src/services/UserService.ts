import axios from "axios";

import type { User } from "@/types/user";
import { backendBaseUrl } from "@/constants";

const baseUrl = `${backendBaseUrl}/users`;

class UserService {
  static async getAll(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(baseUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async getById(userId: number): Promise<User> {
    try {
      const response = await axios.get<User>(`${baseUrl}/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  static async create(userId: number, name: string): Promise<User> {
    try {
      const response = await axios.post<User>(baseUrl, { userId, name });
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async update(userId: number, name: string): Promise<User> {
    try {
      const response = await axios.put<User>(`${baseUrl}/${userId}`, { name });
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async delete(userId: number): Promise<User> {
    try {
      const response = await axios.delete<User>(`${baseUrl}/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async checkGuestData(): Promise<{ hasGuestData: boolean; travelCount: number; visitCount: number }> {
    try {
      const response = await axios.get<{ hasGuestData: boolean; travelCount: number; visitCount: number }>(`${baseUrl}/check-guest-data`);
      return response.data;
    } catch (error) {
      console.error("Error checking guest data:", error);
      throw error;
    }
  }

  static async migrateGuestData(userId: number): Promise<{ success: boolean; travelsMigrated: number; visitsMigrated: number }> {
    try {
      const response = await axios.post<{ success: boolean; travelsMigrated: number; visitsMigrated: number }>(`${baseUrl}/${userId}/migrate`);
      return response.data;
    } catch (error) {
      console.error("Error migrating guest data:", error);
      throw error;
    }
  }
}

export default UserService;

