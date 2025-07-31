import API_CONFIG from '../config/api.config';
import { authService } from './authService';

class DraftService {
  static async saveDraft(jobData) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.JOB.SAVE_DRAFT);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData), // Gửi trực tiếp object jobData
    });
    return API_CONFIG.handleResponse(response);
  }

  static async getDrafts() {
    const token = authService.getToken();
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.JOB.GET_DRAFTS);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return API_CONFIG.handleResponse(response);
  }

  static async deleteDraft(id) {
    const token = authService.getToken();
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.JOB.DELETE_DRAFT(id));
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return API_CONFIG.handleResponse(response);
  }
}

export default DraftService; 