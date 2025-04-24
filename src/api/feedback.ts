import { FeedbackData } from "@/types/feedbackData";
import { VirtualFeedbackData } from "@/types/virtualFeedbackData";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createFeedback = async (
  feedbackData: FeedbackData,
  token: string
) => {
  try {
    const response = await api.post("/api/feedback/create/", feedbackData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to generate feedback"
    );
  }
};

export const createVirtualFeedback = async (
  feedbackData: VirtualFeedbackData,
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
    console.error("Error response from server:", error.response);
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

    return response.data.follow_up_question;
  } catch (error) {
    console.error("Error response from server:", error.response);

    throw new Error(
      error.response?.data?.detail || "Failed to generate answer feedback"
    );
  }
};

export const getFeedback = async (
  interviewId: string | string[],
  token: string
) => {
  try {
    const response = await api.get(`/api/feedback/get/${interviewId}/`, {
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
