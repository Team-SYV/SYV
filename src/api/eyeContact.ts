import axios from "axios";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  });

export const eyeContact = async (videoFile: File, token:string ) => {
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
  
      const response = await api.post("/api/eye_contact/get/", formData, {
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
  