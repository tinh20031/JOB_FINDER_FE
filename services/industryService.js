import axios from 'axios';

const API_URL = "/api";
// const API_URL = "http://localhost:5194/api/";
export const industryService = {
    // Get all industries
    getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/Industry`);
            return response.data;
        } catch (error) {
            console.error("Error fetching industries:", error);
            throw error;
        }
    },

    // Get industry by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/Industry/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching industry with ID ${id}:`, error);
            throw error;
        }
    },

    // Create new industry
    create: async (industry) => {
        try {
            const response = await axios.post(`${API_URL}/Industry`, industry);
            return response.data;
        } catch (error) {
            console.error("Error creating industry:", error);
            throw error;
        }
    },

    // Update industry
    update: async (id, industry) => {
        try {
            const response = await axios.put(`${API_URL}/Industry/${id}`, industry);
            return response.data;
        } catch (error) {
            console.error(`Error updating industry with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete industry
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/Industry/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting industry with ID ${id}:`, error);
            throw error;
        }
    }
}; 