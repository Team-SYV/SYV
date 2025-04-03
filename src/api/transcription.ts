import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const transcribeAudio = async (audioFile: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await api.post("/api/transcribe/audio/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
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

export const transcribeVideo = async (videoFile: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", videoFile);

    const response = await api.post("/api/transcribe/video/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const transcribeImage = async (formData: FormData, token: string) => {
  try {
    const response = await api.post("/api/transcribe/image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const transcribePDF = async (formData: FormData, token: string) => {
  try {
    const response = await api.post("/api/transcribe/pdf/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error || error.message || error.response);
  }
};

export const transcribeResume = async (formData: FormData, token: string) => {
  try {
    const response = await api.post("/api/transcribe//", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error || error.message || error.response);
  }
};
export const validate = async (
  jobDescription: string,
  resume: string,
  token
) => {
  const formData = new FormData();
  formData.append("job_description", jobDescription);
  formData.append("resume", resume);
  try {
    const response = await api.post(
      "/api/transcribe/validate/",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.result;
  } catch (error) {
    throw new Error(error || error.message || error.response);
  }
};

