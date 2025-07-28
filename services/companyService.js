import axios from "axios";
import API_CONFIG from "../config/api.config";




const API_URL = API_CONFIG.BASE_URL;

// Hàm lấy token từ localStorage hoặc cookie
function getToken() {
  let token = localStorage.getItem("token");
  if (token) return token;
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  if (match) return match[2];
  return null;
}

export const companyService = {
  getFavoriteCompanies: async () => {
    try {
      const token = getToken();
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      // Log config để kiểm tra

      const response = await axios.get(
        `${API_URL}/Application/my-favorite-companies`,
        config
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching favorite companies:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      if (error.response?.status === 401) {
        throw new Error("Unauthorized");
      }
      throw error;
    }
  },

  unfavoriteCompany: async (companyId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      // Đúng endpoint backend của bạn
      const response = await axios.delete(
        `${API_URL}/Application/favorite-company/${companyId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error unfavoriting company:", error);
      throw error;
    }
  },

  favoriteCompany: async (companyProfileId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${API_URL}/Application/favorite-company/${companyProfileId}`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error favoriting company:", error);
      throw error;
    }
  },

  getCompanyProfile: async (userId) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.get(
        `${API_URL}/CompanyProfile/${userId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching company profile:", error);
      throw error;
    }
  },

  async filterCompanies(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Map parameters to match API expectations
      if (params.keyword) queryParams.append("CompanyName", params.keyword);
      if (params.location) queryParams.append("Location", params.location);
      if (params.industry && params.industry !== "")
        queryParams.append("IndustryId", params.industry);
      if (params.companySize && params.companySize !== "")
        queryParams.append("TeamSize", params.companySize);

      // Add pagination
      queryParams.append("page", params.page || 1);
      queryParams.append("limit", params.limit || 10);

      const response = await axios.get(
        `${API_URL}/CompanyProfile/filter?${queryParams.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Handle both array and object response formats
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          totalCount: response.data.length,
        };
      }

      return {
        data: response.data.data || [],
        totalCount: response.data.totalCount || 0,
      };
    } catch (error) {
      console.error("Error fetching filtered companies:", error);
      throw error;
    }
  },
};
