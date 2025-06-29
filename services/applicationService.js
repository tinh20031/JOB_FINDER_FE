import axios from "axios";
import Cookies from "js-cookie";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://job-finder-kjt2.onrender.com/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5194/api";
// Helper function to get token
const getToken = () => {
  let token = Cookies.get("token");
  if (!token) {
    token = localStorage.getItem("token");
  }
  return token;
};

export const applicationService = {
  // Apply for a job
  apply: async (jobId, formData) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/Application/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error applying for job:", error);
      throw error;
    }
  },

  // Get applied jobs for current user
  getAppliedJobs: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/Application/my-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      throw error;
    }
  },

  // Get job applicants for a specific job
  getJobApplicants: async (jobId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/Application/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching job applicants:", error);
      throw error;
    }
  },

  // Update application status
  updateStatus: async (applicationId, status) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/Application/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  },

  // Withdraw application
  withdraw: async (applicationId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/Application/${applicationId}/withdraw`,
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
      console.error("Error withdrawing application:", error);
      throw error;
    }
  },

  // Get distinct job count by user in company
  getDistinctJobCountByUserInCompany: async (userId, companyId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(
        `${API_URL}/Application/distinct-job-count-by-user-in-company`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { userId, companyId },
        }
      );
      return response.data.distinctJobCount;
    } catch (error) {
      console.error("Error fetching distinct job count:", error);
      throw error;
    }
  },

  // Get jobs applied by user in company
  getJobsAppliedByUserInCompany: async (userId, companyId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(
        `${API_URL}/Application/jobs-applied-by-user-in-company`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { userId, companyId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs applied by user in company:", error);
      throw error;
    }
  },

  // Get all applications for a specific job (for employer)
  getApplicationsByJob: async (jobId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${API_URL}/Application/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching applications by job:", error);
      throw error;
    }
  },

  // Lấy tất cả application (tất cả applicant trong hệ thống)
  getAllApplications: async () => {
    const response = await axios.get(`${API_URL}/Application`);
    return response.data;
  },

  // Lấy số lượng candidate đã apply vào company (không trùng lặp)
  getUniqueCandidatesByCompany: async (companyId) => {
    const response = await axios.get(
      `${API_URL}/Application/company/${companyId}/unique-candidates`
    );
    return response.data.count;
  },

  // Lấy danh sách recent applicants của công ty
  getRecentApplicantsByCompany: async (companyId, take = 10) => {
    const response = await axios.get(
      `${API_URL}/Application/company/${companyId}/recent-applicants`,
      { params: { take } }
    );
    return response.data;
  },
};
