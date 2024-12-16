import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const generateSpeech = async (text: string) => {
    try {
      const response = await api.get(`/api/visemes/get/`,{
        params: {
          text: text,
        },
      });
  
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to generate speech"
      );
    }
  };
  