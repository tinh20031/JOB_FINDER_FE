// Use local JSON data as the source of truth
import locations from "../location.json";

const locationService = {
  // Lấy danh sách tỉnh/thành phố từ local JSON, giữ nguyên shape consumer đang dùng
  getProvinces: async () => {
    try {
      if (Array.isArray(locations)) {
        return locations.map((p) => ({
          province_code: p.province_code,
          name: p.name,
          short_name: p.short_name,
          code: p.code,
          place_type: p.place_type,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error reading local provinces:", error);
      return [];
    }
  },

  // Hiện không dùng trong codebase; trả về mảng rỗng để tương thích
  getDistricts: async (_provinceCode) => {
    try {
      return [];
    } catch (error) {
      console.error("Error reading local districts:", error);
      return [];
    }
  },

  // Lấy danh sách phường/xã theo province_code, chuẩn hoá field ward_name cho phù hợp consumer
  getWards: async (provinceCode) => {
    try {
      const province = Array.isArray(locations)
        ? locations.find((p) => String(p.province_code) === String(provinceCode))
        : null;
      const wards = province?.wards || [];
      return wards.map((w) => ({
        ward_code: w.ward_code,
        ward_name: w.name, // normalize to ward_name as used in UI
        province_code: w.province_code || provinceCode,
      }));
    } catch (error) {
      console.error("Error reading local wards:", error);
      return [];
    }
  },
};

export default locationService;