import axios from "axios";
import { AnswerData } from "./types/answerData";
import { InterviewData } from "./types/interviewData";
import { JobInformationData } from "./types/jobInformationData";
import { QuestionData } from "./types/questionData";
import { RatingsData } from "./types/ratingsData";
import { FeedbackData } from "./types/feedbackData";
import { VirtualFeedbackData } from "./types/virtualFeedbackData";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const createJobInformation = async (
  jobInformationData: JobInformationData,
  token: string
) => {
  try {
    const response = await api.post(
      "/api/job_information/create",
      jobInformationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create job information"
    );
  }
};

export const getJobInformation = async (jobId: string | string[], token: string) => {
  try {
    const response = await api.get(`/api/job_information/get/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve job information"
    );
  }
};

export const createInterview = async (
  interviewData: InterviewData,
  token: string
) => {
  try {
    const response = await api.post("/api/interview/create", interviewData, {
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
    const response = await api.get(`/api/interview/get/${interviewId}`, {
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

export const generateQuestions = async (formData: FormData) => {
  try {
    const response = await api.post("/api/generate-questions/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.questions;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to generate interview questions"
    );
  }
};

export const createQuestions = async (questionData: QuestionData, token: string) => {
  try {
    const response = await api.post(`/api/question/create`, questionData,{
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

export const getQuestions = async (interview_id: string | string[], token: string) => {
  try {
    const response = await api.get(`/api/question/get/${interview_id}`,{
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

export const transcribeVideo = async (videoFile: File) => {
  try {
    const formData = new FormData();
    formData.append("file", videoFile);

    const response = await api.post("/api/transcribe-video/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error, error.response);
  }
};

export const transcribeAudio = async (audioFile: File) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await api.post("/api/transcribe-audio/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.transcription;
  } catch (error) {
    console.error("Error response from server:", error.response);
    throw new Error(
      error.response?.data?.detail || "Failed to transcribe audio"
    );
  }
};

export const eyeContact = async (videoFile: File) => {
  try {
    const formData = new FormData();
    formData.append("file", videoFile);

    const response = await api.post("/api/eye-contact/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error, error.response);
  }
};

export const createAnswer = async (answerData: AnswerData, token: string) => {
  try {
    const response = await api.post(`/api/answer/create`, answerData, {
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

export const getFeedback = async (interview_id: string | string[], token: string) => {
  try {
    const response = await api.get(`/api/feedback/get/${interview_id}`,{
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

export const generateFeedback = async (feedbackData: FeedbackData, token: string) => {
  try {
    const response = await api.post("/api/generate-feedback/", feedbackData, {
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

export const generateVirtualFeedback = async (
  VirtualFeedbackData: VirtualFeedbackData,
  token: string
) => {
  try {
    const response = await api.post(
      "/api/generate-virtual-feedback/",
      VirtualFeedbackData,
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
      error.response?.data?.detail || "Failed to generate virtual feedback"
    );
  }
};

export const createRatings = async (ratingsData: RatingsData, token: string) => {
  try {
    const response = await api.post("/api/ratings/create", ratingsData,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create ratings");
  }
};

export const getRatings = async (interview_id: string | string[], token: string) => {
  try {
    const response = await api.get(`/api/ratings/get/${interview_id}`,{
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

export const getRatingsByUserId = async (weekStart: string, token: string) => {
  try {
    const response = await api.get(`/api/ratings/progress/`, {
      params: {
        week_start: weekStart,
      },
      headers: {
        'Authorization': `Bearer ${token}`, 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw new Error(error?.response?.data?.detail || 'Failed to retrieve ratings by user ID');
  }
};

export const generateAnswerFeedback = async (formData) => {
  try {
    const response = await api.post(
      "/api/generate-answer-feedback/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.feedback; // Assuming feedback is structured correctly
  } catch (error) {
    console.error("Error response from server:", error.response);

    // Log the entire error object for better debugging
    console.error("Full error object:", JSON.stringify(error, null, 2));

    throw new Error(
      error.response?.data?.detail || "Failed to generate answer feedback"
    );
  }
};

export const getFeedbackWithQuestions = async (
  interviewId: string | string[], token: string
) => {
  try {
    const response = await api.get(`/api/feedback/get/record/${interviewId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
        "Failed to retrieve feedback with questions"
    );
  }
};