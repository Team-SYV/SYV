import { FeedbackDataRecord, FeedbackDataVirtual } from "@/types/feedbackData";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createFeedbackRecord = async (
  feedbackData: FeedbackDataRecord,
  token: string
) => {
  try {
    const response = await api.post(
      "/api/feedback/create/record/",
      feedbackData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to generate feedback"
    );
  }
};

export const createFeedbackVirtual = async (
  feedbackData: FeedbackDataVirtual,
  token: string
) => {
  try {
    const response = await api.post(
      "/api/feedback/create/virtual/",
      feedbackData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to generate feedback"
    );
  }
};

export const generateResponse = async (formData: FormData, token: string) => {
  try {
    const response = await api.post(
      "/api/feedback/create/virtual/response/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.feedback;
  } catch (error) {
    console.error("Error response from server:", error.response);
    
    throw new Error(
      error.response?.data?.detail || "Failed to generate answer feedback"
    );
  }
};

export const getFeedbackRecord = async (
  interviewId: string | string[],
  token: string
) => {
  try {
    const response = await api.get(`/api/feedback/get/record/${interviewId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve feedback"
    );
  }
};

export const getFeedbackVirtual = async (
  interviewId: string | string[],
  token: string
) => {
  try {
    const response = await api.get(`/api/feedback/get/virtual/${interviewId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve feedback"
    );
  }
};


