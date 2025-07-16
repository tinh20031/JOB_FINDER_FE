import axios from "axios";
import API_CONFIG from "../config/api.config";

const videoService = {
  /**
   * Upload candidate profile video
   * @param {File} file - Video file
   * @param {number} candidateProfileId - Candidate profile ID
   * @returns {Promise<string>} - Returns uploaded video URL
   */
  async uploadProfileVideo(file, candidateProfileId) {
    if (!file || !candidateProfileId) throw new Error("Missing file or candidateProfileId");
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    // Sử dụng BASE_URL từ config
    const url = `${API_CONFIG.BASE_URL}/Video/upload-video?candidateProfileId=${candidateProfileId}`;
    const res = await axios.post(
      url,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }
    );
    return res.data.url;
  }
};

export default videoService; 