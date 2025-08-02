import axios from "axios";

const BASE_API_URL = "https://34tinhthanh.com/api";

const locationService = {
  // Lấy danh sách tỉnh/thành phố từ API
  getProvinces: async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/provinces`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },


  getDistricts: async (provinceCode) => {
    try {
     
      const response = await axios.get(`${BASE_API_URL}/districts?province_code=${provinceCode}`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã của một tỉnh/thành phố
  getWards: async (provinceCode) => {
    try {
      const response = await axios.get(`${BASE_API_URL}/wards?province_code=${provinceCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },
};

export default locationService;