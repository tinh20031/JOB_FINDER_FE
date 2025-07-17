import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../config/api.config";


const API_URL = API_CONFIG.BASE_URL;
function getToken() {
  let token = localStorage.getItem("token");
  if (!token) {
    token = Cookies.get("token");
  }
  return token;
}

export const companyProfileService = {
  async getCompanyProfile(userId) {
    try {
      const response = await axios.get(`${API_URL}/CompanyProfile/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching company profile:", error);
      throw error;
    }
  },

  async updateCompanyProfile(userId, payload) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // or application/json depending on your API
        },
      };

      const response = await axios.put(
        `${API_URL}/CompanyProfile/${userId}`,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error updating company profile:", error);
      throw error;
    }
  },
};
