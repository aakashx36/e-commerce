import api from "./axiosInstance";
import toast from "react-hot-toast";

export const uploadToBackend = async (files, endpoint) => {
  if (!files || (files instanceof FileList && files.length === 0)) return [];

  const formData = new FormData();

  // Logic: "images" key handles single or multiple files
  if (files instanceof File) {
    formData.append("images", files);
  } else {
    Array.from(files).forEach((file) => formData.append("images", file));
  }

  try {
    const { data } = await api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.images; // Array of Cloudinary URLs from backend
  } catch (error) {
    toast.error("Upload failed. Check server connection.");
    throw error;
  }
};
