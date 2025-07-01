import axios from "axios";
import { authService } from "./authService";
const API_URL = "http://localhost:5194/api/Message";
// const API_URL = "https://job-finder-kjt2.onrender.com/api/Message";

<<<<<<< HEAD
=======
// const API_URL = "https://job-finder-kjt2.onrender.com/api/Message";
const API_URL = "http://localhost:5194/api/Message";
>>>>>>> origin/thanhtung
const getToken = () => authService.getToken();

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const messageService = {
  // Get list of candidates that a company has messaged
  getMessagedCandidates: (companyId) => {
    return axios.get(`${API_URL}/candidates-messaged/${companyId}`, {
      headers: getHeaders(),
    });
  },

  // Get list of companies that a candidate has messaged
  getMessagedCompanies: (candidateId) => {
    return axios.get(`${API_URL}/companies-messaged/${candidateId}`, {
      headers: getHeaders(),
    });
  },

  // Get message history between two users
  getMessageHistory: (userId, partnerId) => {
    return axios.get(`${API_URL}/history/${userId}/${partnerId}`, {
      headers: getHeaders(),
    });
  },

  // Send a message
  sendMessage: (payload) => {
    return axios.post(`${API_URL}/send`, payload, { headers: getHeaders() });
  },

  // Join SignalR group
  joinGroup: () => {
    return axios.post(`${API_URL}/join-group`, {}, { headers: getHeaders() });
  },

  getUniqueMessageUsersByCompany: async (companyId) => {
    const response = await axios.get(`${API_URL}/candidates-messaged/${companyId}`);
    // API trả về mảng các candidate đã nhắn tin, chỉ cần lấy length
    return Array.isArray(response.data) ? response.data.length : 0;
  }
};

export default messageService;
