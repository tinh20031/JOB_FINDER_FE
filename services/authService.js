import Cookies from "js-cookie";
import ApiService from "./api.service";
import { jwtDecode } from "jwt-decode";
import API_CONFIG from "../config/api.config";

export const authService = {
  async login(email, password) {
    try {
      const data = await ApiService.login(email, password);
      console.log("authService.login: Raw data from ApiService.login:", data);

      const cookieOptions = {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      };

      let decodedToken = null;
      if (data.token) {
        decodedToken = jwtDecode(data.token);
        console.log("authService.login: decodedToken", decodedToken);
      }

      // Lưu token và role (và tên nếu có) vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.name) {
        localStorage.setItem("name", data.name);
      }
      if (decodedToken && decodedToken.fullName) {
        localStorage.setItem("fullName", decodedToken.fullName);
      }
      if (decodedToken && decodedToken.profileImage) {
        localStorage.setItem("profileImage", decodedToken.profileImage);
      }
      if (decodedToken && decodedToken.sub) {
        localStorage.setItem("UserId", decodedToken.sub);
      }
      if (data.companyId) {
        localStorage.setItem("CompanyProfileId", data.companyId);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.user && data.user.companyName) {
        localStorage.setItem("fullNameCompany", data.user.companyName);
        Cookies.set("fullNameCompany", data.user.companyName, cookieOptions);
      }
      if (data.user && data.user.urlCompanyLogo) {
        localStorage.setItem("profileImageCompany", data.user.urlCompanyLogo);
        Cookies.set(
          "profileImageCompany",
          data.user.urlCompanyLogo,
          cookieOptions
        );
      }

      // Lưu token và role (và tên nếu có) vào cookies
      Cookies.set("token", data.token, cookieOptions);
      Cookies.set("role", data.role, cookieOptions);
      if (data.name) {
        Cookies.set("name", data.name, cookieOptions);
      }
      if (decodedToken && decodedToken.fullName) {
        Cookies.set("fullName", decodedToken.fullName, cookieOptions);
      }
      if (decodedToken && decodedToken.profileImage) {
        Cookies.set("profileImage", decodedToken.profileImage, cookieOptions);
      }
      if (decodedToken && decodedToken.sub) {
        Cookies.set("UserId", decodedToken.sub, cookieOptions);
      }
      if (data.companyId) {
        Cookies.set("CompanyProfileId", data.companyId, cookieOptions);
      }

      // Lưu userId chuẩn cho candidate
      let userId = null;
      if (data.user && (data.user.id || data.user.userId)) {
        userId = data.user.id || data.user.userId;
      } else if (decodedToken && (decodedToken.sub || decodedToken.userId || decodedToken.id)) {
        userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      }
      if (userId) {
        localStorage.setItem("userId", userId);
        Cookies.set("userId", userId, cookieOptions);
      }

      return data;
    } catch (error) {
      // Check if this is an unverified email error
      const isUnverifiedEmail =
        error.response?.data?.requiresVerification ||
        error.data?.requiresVerification ||
        (error.message &&
          (error.message.includes("requiresVerification") ||
            error.message.toLowerCase().includes("not verified") ||
            error.message.toLowerCase().includes("unverified") ||
            error.message.toLowerCase().includes("email chưa được xác thực") ||
            error.message.includes("Email has not been verified") ||
            error.message.includes("check your inbox to verify") ||
            error.message.includes("verify your account before logging in") ||
            error.message.toLowerCase().includes("verify") ||
            error.message.toLowerCase().includes("inbox")));

      if (isUnverifiedEmail) {
        // Create a custom error with unverified email flag
        const customError = new Error(error.message);
        customError.isUnverifiedEmail = true;
        customError.email =
          error.response?.data?.email || error.data?.email || email;
        customError.originalError = error;
        throw customError;
      }

      throw error;
    }
  },

  async register(fullName, email, phone, password, firebaseUid) {
    try {
      const userData = {
        fullName,
        email,
        phone,
        password,
        role: "1", // Set default role as user
        firebaseUid // Thêm trường này vào payload
      };
      const data = await ApiService.register(userData);
      console.log("Registration successful:", data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    // Xóa token và các thông tin khác từ localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("CompanyProfileId");
    localStorage.removeItem("fullName"); // Remove fullName
    localStorage.removeItem("profileImage"); // Remove profileImage
    localStorage.removeItem("UserId");

    // Xóa token và các thông tin khác từ Cookies
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    Cookies.remove("name", { path: "/" });
    Cookies.remove("CompanyProfileId", { path: "/" });
    Cookies.remove("fullName", { path: "/" }); // Remove fullName
    Cookies.remove("profileImage", { path: "/" }); // Remove profileImage
    Cookies.remove("UserId", { path: "/" });
    // Nếu bạn có các domain cụ thể, cũng cần xóa
    Cookies.remove("token", { path: "/", domain: "localhost" });
    Cookies.remove("role", { path: "/", domain: "localhost" });
    Cookies.remove("name", { path: "/", domain: "localhost" });
    Cookies.remove("CompanyProfileId", { path: "/", domain: "localhost" });
    Cookies.remove("fullName", { path: "/", domain: "localhost" }); // Remove fullName
    Cookies.remove("profileImage", { path: "/", domain: "localhost" }); // Remove profileImage
    Cookies.remove("UserId", { path: "/", domain: "localhost" });
  },

  getToken() {
    // Ưu tiên lấy từ Cookies (nếu là HttpOnly thì an toàn hơn), sau đó là localStorage
    const cookieToken = Cookies.get("token");
    if (cookieToken) {
      return cookieToken;
    }
    return localStorage.getItem("token");
  },

  getRole() {
    const cookieRole = Cookies.get("role");
    if (cookieRole) {
      return cookieRole;
    }
    return localStorage.getItem("role");
  },

  getName() {
    const cookieName = Cookies.get("name");
    if (cookieName) {
      return cookieName;
    }
    return localStorage.getItem("name");
  },

  getFullName() {
    const cookieFullName = Cookies.get("fullName");
    if (cookieFullName) {
      return cookieFullName;
    }
    const storedUser = this._getStoredUser();
    if (storedUser && storedUser.fullName) {
      return storedUser.fullName;
    }
    return localStorage.getItem("fullName");
  },

  getProfileImage() {
    const cookieProfileImage = Cookies.get("profileImage");
    if (cookieProfileImage) {
      return cookieProfileImage;
    }
    const storedUser = this._getStoredUser();
    if (storedUser && (storedUser.avatar || storedUser.image)) {
      return storedUser.avatar || storedUser.image;
    }
    return localStorage.getItem("profileImage");
  },

  getCompanyId() {
    const cookieCompanyId = Cookies.get("CompanyProfileId");
    if (cookieCompanyId) {
      return cookieCompanyId;
    }
    const localCompanyId = localStorage.getItem("CompanyProfileId");
    if (localCompanyId) {
      return localCompanyId;
    }
    // Fallback: lấy UserId nếu không có CompanyProfileId
    const cookieUserId = Cookies.get("UserId");
    if (cookieUserId) {
      return cookieUserId;
    }
    const localUserId = localStorage.getItem("UserId");
    if (localUserId) {
      return localUserId;
    }
    return null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // New helper to get parsed user info from localStorage
  _getStoredUser() {
    if (typeof window === "undefined") return null; // Only run on client side
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return null;
      }
    }
    return null;
  },

  getStoredUser() {
    return this._getStoredUser();
  },

  getFullNameCompany() {
    const cookieFullName = Cookies.get("fullName");
    if (cookieFullName) return cookieFullName;
    return localStorage.getItem("fullNameCompany");
  },

  getProfileImageCompany() {
    const cookieProfileImage = Cookies.get("profileImage");
    if (cookieProfileImage) return cookieProfileImage;
    return localStorage.getItem("profileImageCompany");
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const payload = { currentPassword, newPassword };
      const data = await ApiService.changePassword(payload);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async verifyEmail(email, verificationCode) {
    return await ApiService.verifyEmail(email, verificationCode);
  },

  async resendVerification(email) {
    return await ApiService.resendVerification(email);
  },

  // Update the Google login URL function in authService.js
  getGoogleLoginUrl() {
    return API_CONFIG.getGoogleLoginUrl();
  },

  // Forgot Password APIs
  async forgotPasswordRequest(email) {
    return ApiService.post('/auth/forgot-password/request', { email });
  },
  async forgotPasswordVerify(email, code) {
    return ApiService.post('/auth/forgot-password/verify', { email, code });
  },
  async forgotPasswordReset(email, code, newPassword) {
    return ApiService.post('/auth/forgot-password/reset', { email, code, newPassword });
  },
  async forgotPasswordResendVerification(email) {
    return ApiService.post('/auth/forgot-password/resend-verification', { email });
  },
};
