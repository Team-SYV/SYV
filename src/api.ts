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
  jobInformationData: JobInformationData
) => {
  try {
    const response = await api.post(
      "/api/job_information/create",
      jobInformationData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create job information"
    );
  }
};

export const getJobInformation = async (jobId: string | string[]) => {
  try {
    const response = await api.get(`/api/job_information/get/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve job information"
    );
  }
};

export const createInterview = async (interviewData: InterviewData) => {
  try {
    const response = await api.post("/api/interview/create", interviewData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create interview"
    );
  }
};

export const getInterview = async (interviewId: string | string[]) => {
  try {
    const response = await api.get(`/api/interview/get/${interviewId}`);
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

export const createQuestions = async (questionData: QuestionData) => {
  try {
    const response = await api.post(`/api/question/create`, questionData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create questions"
    );
  }
};

export const getQuestions = async (interview_id: string | string[]) => {
  try {
    const response = await api.get(`/api/question/get/${interview_id}`);
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

export const createAnswer = async (answerData: AnswerData) => {
  try {
    const response = await api.post(`/api/answer/create`, answerData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to create questions"
    );
  }
};

export const getFeedback = async (interview_id: string | string[]) => {
  try {
    const response = await api.get(`/api/feedback/get/${interview_id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve feedback"
    );
  }
};

export const generateFeedback = async (feedbackData: FeedbackData) => {
  try {
    const response = await api.post("/api/generate-feedback/", feedbackData, {
      headers: {
        "Content-Type": "application/json",
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
  VirtualFeedbackData: VirtualFeedbackData
) => {
  try {
    const response = await api.post(
      "/api/generate-virtual-feedback/",
      VirtualFeedbackData,
      {
        headers: {
          "Content-Type": "application/json",
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

export const createRatings = async (ratingsData: RatingsData) => {
  try {
    const response = await api.post("/api/ratings/create", ratingsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create ratings");
  }
};

export const getRatings = async (interview_id: string | string[]) => {
  try {
    const response = await api.get(`/api/ratings/get/${interview_id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve ratings"
    );
  }
};

export const getInterviewHistory = async (userId: string) => {
  try {
    const response = await api.get(`/api/interview/history/${userId}`);
    return response.data;
  } catch (error) { 
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve interview count"
    );
  }
};

export const getRatingsByUserId = async (userId: string, week_start: string) => {
  try {
    // Include the week_start parameter in the URL
    const response = await api.get(`/api/ratings/progress/${userId}?week_start=${week_start}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve ratings by user ID"
    );
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

export const getFeedbackWithQuestions = async (interviewId: string | string[]) => {
  try {
    const response = await api.get(`/api/feedback/get/record/${interviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to retrieve feedback with questions"
    );
  }
};


export const testeyecontact = async (videoFile: File) => {
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