import axios from "axios";

// const API_URL = "https://job-finder-kjt2.onrender.com/api/UserFavoriteJob"; // Đổi port nếu BE khác
const API_URL = "http://localhost:5194/api/UserFavoriteJob"; 
export const getUserFavorites = (userId) =>
  axios.get(`${API_URL}/user/${userId}`);

export const isJobFavorite = (userId, jobId) =>
  axios.get(`${API_URL}/${userId}/${jobId}`);

export const addFavoriteJob = (userId, jobId) =>
  axios.post(API_URL, { UserId: userId, JobId: jobId });

export const removeFavoriteJob = (userId, jobId) =>
  axios.delete(`${API_URL}/${userId}/${jobId}`); 