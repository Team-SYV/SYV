import { RatingsData } from "@/types/ratingsData";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  });

  export const createRatings = async (
    ratingsData: RatingsData,
    token: string
  ) => {
    try {
      const response = await api.post("/api/ratings/create/", ratingsData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to create ratings");
    }
  };

  export const getRatings = async (
    interview_id: string | string[],
    token: string
  ) => {
    try {
      const response = await api.get(`/api/ratings/get/${interview_id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to retrieve ratings"
      );
    }
  };
  
  export const getProgress = async (weekStart: string, token: string) => {
    try {
      const response = await api.get(`/api/ratings/progress/`, {
        params: {
          week_start: weekStart,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      throw new Error(
        error?.response?.data?.detail || "Failed to retrieve ratings by user ID"
      );
    }
  };
  
  
  