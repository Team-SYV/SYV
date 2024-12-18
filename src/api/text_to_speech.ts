import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createSpeech = async (input: string, token: string) => {
  try {
    const response = await api.post(`/api/tts/synthesize/`, { text: input }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create speech");
  }
};
