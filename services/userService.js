import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../config/api.config";



const API_URL = API_CONFIG.BASE_URL;
// Helper function to get token
const getToken = () => {
  let token = Cookies.get("token");
  if (!token) {
    token = localStorage.getItem("token");
  }
  return token;
};

export const userService = {
  // Request to become recruiter
  requestBecomeRecruiter: async (payload) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/CandidateToCompany/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error requesting to become recruiter:", error);
      throw error;
    }
  },

  // Process candidate->company upgrade
  processUpgrade: async (userId, decision) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const endpoint = API_CONFIG.ENDPOINTS.CANDIDATE_TO_COMPANY.PROCESS_UPGRADE(userId);
      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        { decision },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error processing upgrade:", error);
      throw error;
    }
  },
  
  // List pending upgrade requests for admin
  getUpgradeRequests: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found");
      const url = `${API_URL}/${API_CONFIG.ENDPOINTS.CANDIDATE_TO_COMPANY.REQUESTS}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      // Handle 404 as no requests available (not an error)
      if (error.response && error.response.status === 404) {
        return [];
      }
      console.error("Error fetching upgrade requests:", error);
      throw error;
    }
  },
};
