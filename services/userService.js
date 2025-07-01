import axios from "axios";
import Cookies from "js-cookie";


const API_URL = "http://localhost:5194/api";
// const API_URL = "https://job-finder-kjt2.onrender.com/api";
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

  // Verify candidate to company
  verifyCandidate: async (userId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/CandidateToCompany/verify/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying candidate:", error);
      throw error;
    }
  },
};
