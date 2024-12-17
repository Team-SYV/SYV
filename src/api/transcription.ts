import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

export const transcribeAudio = async ( audioFile: File, token: string) => {
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

export const transcribeVideo = async ( videoFile: File, token: string) => {
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
    throw new Error(error, error.response);
  }
};
