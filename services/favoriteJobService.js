import axios from "axios";
import { authService } from "./authService";
import API_CONFIG from "../config/api.config";


const API_URL = `${API_CONFIG.BASE_URL}/UserFavoriteJob`; 

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