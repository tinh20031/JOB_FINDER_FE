import axios from "axios";
import API_CONFIG from "../config/api.config";

const API_URL = API_CONFIG.BASE_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
}

// Map tên phương thức thanh toán sang enum số của backend
const PAYMENT_METHOD = {
  CreditCard: 0,
  MoMo: 1,
  BankTransfer: 2,
  PayPal: 3,
  PayOS: 4,
  Other: 5,
};

export const subscriptionService = {
  // Lấy danh sách các gói subscription
  async getPlans() {
    const token = getToken();
    const res = await axios.get(`${API_URL}/Subscription/plans`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },

  // Lấy gói hiện tại của ứng viên
  async getMySubscription() {
    const token = getToken();
    const res = await axios.get(`${API_URL}/Subscription/my-subscription`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },

  // Mua gói subscription
  async purchasePlan({ planId, paymentMethod }) {
    const token = getToken();
    // Nếu truyền vào là chuỗi, tự map sang số enum
    let method = paymentMethod;
    if (typeof method === 'string') {
      method = PAYMENT_METHOD[method] ?? 4; // Mặc định PayOS = 4
    }
    // Nếu truyền vào là số nhưng không hợp lệ, fallback về PayOS
    if (typeof method !== 'number' || isNaN(method) || method < 0 || method > 5) {
      method = 4;
    }
    const body = { planId, paymentMethod: method };
    const res = await axios.post(
      `${API_URL}/Subscription/purchase`,
      body,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.data;
  },
}; 