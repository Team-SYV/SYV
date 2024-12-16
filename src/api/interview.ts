import { InterviewData } from "@/types/interviewData";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createInterview = async (
  interviewData: InterviewData,
  token: string
) => {
  try {
    const response = await api.post("/api/interview/create/", interviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create interview"
    );
  }
};

export const getInterview = async (
  interviewId: string | string[],
  token: string
) => {
  try {
    const response = await api.get(`/api/interview/get/${interviewId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve interview"
    );
  }
};

export const getInterviewHistory = async (token: string) => {
  try {
    const response = await api.get(`/api/interview/history/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve history"
    );
  }
};

