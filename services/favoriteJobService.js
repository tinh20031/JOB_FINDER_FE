import axios from "axios";
import { authService } from "./authService";



// const API_URL = "http://localhost:5194/api/UserFavoriteJob"; 
const API_URL = "https://job-finder-kjt2.onrender.com/api/UserFavoriteJob";
// Lấy config chứa token từ authService
const getAuthConfig = () => {
  const token = authService.getToken();
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const getUserFavorites = (userId) =>
  axios.get(`${API_URL}/user/${userId}`, getAuthConfig());

export const isJobFavorite = (userId, jobId) =>
  axios.get(`${API_URL}/${userId}/${jobId}`, getAuthConfig());

export const addFavoriteJob = (userId, jobId) =>
  axios.post(
    API_URL,
    { UserId: userId, JobId: jobId },
    getAuthConfig()
  );

export const removeFavoriteJob = (userId, jobId) =>
  axios.delete(`${API_URL}/${userId}/${jobId}`, getAuthConfig()); 