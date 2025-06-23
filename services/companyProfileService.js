import axios from "axios";
import Cookies from 'js-cookie';

const API_URL = "/api";
// const API_URL = "http://localhost:5194/api/";

function getToken() {
  let token = localStorage.getItem('token');
  if (!token) {
    token = Cookies.get('token');
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
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.put(`${API_URL}/CompanyProfile/${userId}`, payload, config);
      return response.data;
    } catch (error) {
      console.error("Error updating company profile:", error);
      throw error;
    }
  },
}; 