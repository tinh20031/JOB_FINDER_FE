import axios from "axios";
import { authService } from "./authService";
import API_CONFIG from "../config/api.config";

const API_URL = `${API_CONFIG.BASE_URL}/Message`;

const getToken = () => authService.getToken();

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const messageService = {
  // Lấy lịch sử chat giữa 2 user (toàn bộ - giữ lại để tương thích)
  getMessageHistory: (userId1, userId2) => {
    return axios.get(`${API_URL}/history/${userId1}/${userId2}`, {
      headers: getHeaders(),
    });
  },

  // Lấy lịch sử chat với pagination
  getMessageHistoryWithPagination: (userId1, userId2, page = 1, pageSize = 20) => {
    return axios.get(`${API_URL}/history/${userId1}/${userId2}`, {
      headers: getHeaders(),
      params: {
        page,
        pageSize
      }
    });
  },

  // Lấy danh sách candidate mà company đã nhắn
  getMessagedCandidates: (companyId) => {
    return axios.get(`${API_URL}/candidates-messaged/${companyId}`, {
      headers: getHeaders(),
    });
  },

  // Lấy danh sách company mà candidate đã nhắn
  getMessagedCompanies: (candidateId) => {
    return axios.get(`${API_URL}/companies-messaged/${candidateId}`, {
      headers: getHeaders(),
    });
  },

  // Gửi tin nhắn (text/file)
  sendMessage: ({ senderId, receiverId, messageText, file, relatedJobId, isSticker }) => {
    const formData = new FormData();
    formData.append("SenderId", senderId);
    formData.append("ReceiverId", receiverId);
    if (messageText) formData.append("MessageText", messageText);
    if (file) formData.append("File", file);
    if (relatedJobId) formData.append("RelatedJobId", relatedJobId);
    if (isSticker) formData.append("IsSticker", isSticker);

    return axios.post(`${API_URL}/send`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
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
