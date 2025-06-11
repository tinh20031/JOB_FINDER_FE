import axios from 'axios';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5194/api';
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api';

const locationService = {
    // Lấy danh sách tỉnh/thành phố từ API Việt Nam
    getProvinces: async () => {
        try {
            const response = await axios.get(PROVINCE_API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching provinces:', error);
            throw error;
        }
    },

    // Lấy danh sách quận/huyện của một tỉnh/thành phố
    getDistricts: async (provinceCode) => {
        try {
            const response = await axios.get(`${PROVINCE_API_URL}/p/${provinceCode}?depth=2`);
            return response.data.districts;
        } catch (error) {
            console.error('Error fetching districts:', error);
            throw error;
        }
    },

    // Lấy danh sách phường/xã của một quận/huyện
    getWards: async (districtCode) => {
        try {
            const response = await axios.get(`${PROVINCE_API_URL}/d/${districtCode}?depth=2`);
            return response.data.wards;
        } catch (error) {
            console.error('Error fetching wards:', error);
            throw error;
        }
    }
};

export default locationService; 