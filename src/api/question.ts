import { QuestionData } from "@/types/questionData";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createQuestions = async (
  formData: FormData,
  token: string
) => {
  try {
    const response = await api.post(`/api/question/create/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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

export const getQuestions = async (
  interview_id: string | string[],
  token: string
) => {
  try {
    const response = await api.get(`/api/question/get/${interview_id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve questions"
    );
  }
};
