import { AnswerData } from "@/types/answerData";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  });

  
  export const createAnswer = async (answerData: AnswerData, token: string) => {
    try {
      const response = await api.post(`/api/answer/create/`, answerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to create questions"
      );
    }
  };
  
  