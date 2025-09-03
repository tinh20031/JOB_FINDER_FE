import ApiService from './api.service';
import { authService } from './authService';
import API_CONFIG from "../config/api.config";

export const cvMatchingService = {
  /**
   * Try matching CV with job
   * @param {Object} request - Request data
   * @param {number} request.jobId - Job ID
   * @param {File} [request.cvFile] - CV file (if uploading new CV)
   * @param {number} [request.cvId] - CV ID (if using saved CV)
   * @returns {Promise<Object>} Matching result
   */
  async tryMatch(formData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Please login to use this feature');
      }
      let response;
      if (formData instanceof FormData) {
        const url = API_CONFIG.getUrl("application/try-match");
        response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
            // KHÔNG set Content-Type
          },
          body: formData
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      } else {
        // fallback nếu không phải FormData
        return await ApiService.post('/application/try-match', formData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy lịch sử thử khớp CV
   * @param {number} userId - ID người dùng
   * @returns {Promise<Array>} Danh sách lịch sử
   */
  async getTryMatchHistory(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const response = await ApiService.get(`/application/my-try-match-history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching try match history:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết kết quả thử khớp
   * @param {number} tryMatchId - ID kết quả thử khớp
   * @returns {Promise<Object>} Chi tiết kết quả
   */
  async getTryMatchDetail(tryMatchId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const response = await ApiService.get(`/application/try-match/${tryMatchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching try match detail:', error);
      throw error;
    }
  },

  async getMyTryMatchHistory() {
    const token = authService.getToken();
    if (!token) throw new Error('Please login');
    const url = API_CONFIG.getUrl("application/my-try-match-history");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch try match history');
    return response.json();
  }
};

export default cvMatchingService; 