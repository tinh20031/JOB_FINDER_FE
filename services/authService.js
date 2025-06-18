import Cookies from 'js-cookie';
import ApiService from './api.service';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  async login(email, password) {
    try {
      const data = await ApiService.login(email, password);
      console.log('authService.login: Raw data from ApiService.login:', data);
      
      // Đặt cookieOptions ở đầu hàm login
      const cookieOptions = {
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Sử dụng secure chỉ trong môi trường production (HTTPS)
        sameSite: 'Lax' // Bảo vệ CSRF ở mức độ cơ bản
      };

      let decodedToken = null;
      if (data.token) {
        decodedToken = jwtDecode(data.token);
        console.log("authService.login: decodedToken", decodedToken);
      }

      // Lưu token và role (và tên nếu có) vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (data.name) {
        localStorage.setItem('name', data.name);
      }
      if (decodedToken && decodedToken.fullName) {
        localStorage.setItem('fullName', decodedToken.fullName);
      }
      if (decodedToken && decodedToken.profileImage) {
        localStorage.setItem('profileImage', decodedToken.profileImage);
      }
      if (data.companyId) {
        localStorage.setItem('companyId', data.companyId);
      }
      if (data.user && data.user.companyName) {
        localStorage.setItem('fullNameCompany', data.user.companyName);
        Cookies.set('fullNameCompany', data.user.companyName, cookieOptions);
      }
      if (data.user && data.user.urlCompanyLogo) {
        localStorage.setItem('profileImageCompany', data.user.urlCompanyLogo);
        Cookies.set('profileImageCompany', data.user.urlCompanyLogo, cookieOptions);
      }

      // Lưu token và role (và tên nếu có) vào cookies
      Cookies.set('token', data.token, cookieOptions);
      Cookies.set('role', data.role, cookieOptions);
      if (data.name) {
        Cookies.set('name', data.name, cookieOptions);
      }
      if (decodedToken && decodedToken.fullName) {
        Cookies.set('fullName', decodedToken.fullName, cookieOptions);
      }
      if (decodedToken && decodedToken.profileImage) {
        Cookies.set('profileImage', decodedToken.profileImage, cookieOptions);
      }
      if (data.companyId) {
        Cookies.set('companyId', data.companyId, cookieOptions);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async register(fullName, email, phone, password) {
    try {
      const userData = {
        fullName,
        email,
        phone,
        password,
        role: '1' // Set default role as user
      };
      const data = await ApiService.register(userData);
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    // Xóa token và các thông tin khác từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('companyId');
    localStorage.removeItem('fullName'); // Remove fullName
    localStorage.removeItem('profileImage'); // Remove profileImage

    // Xóa token và các thông tin khác từ Cookies
    Cookies.remove('token', { path: '/' });
    Cookies.remove('role', { path: '/' });
    Cookies.remove('name', { path: '/' });
    Cookies.remove('companyId', { path: '/' });
    Cookies.remove('fullName', { path: '/' }); // Remove fullName
    Cookies.remove('profileImage', { path: '/' }); // Remove profileImage
    // Nếu bạn có các domain cụ thể, cũng cần xóa
    Cookies.remove('token', { path: '/', domain: 'localhost' });
    Cookies.remove('role', { path: '/', domain: 'localhost' });
    Cookies.remove('name', { path: '/', domain: 'localhost' });
    Cookies.remove('companyId', { path: '/', domain: 'localhost' });
    Cookies.remove('fullName', { path: '/', domain: 'localhost' }); // Remove fullName
    Cookies.remove('profileImage', { path: '/', domain: 'localhost' }); // Remove profileImage
  },

  getToken() {
    // Ưu tiên lấy từ Cookies (nếu là HttpOnly thì an toàn hơn), sau đó là localStorage
    const cookieToken = Cookies.get('token');
    if (cookieToken) {
      return cookieToken;
    }
    return localStorage.getItem('token');
  },

  getRole() {
    const cookieRole = Cookies.get('role');
    if (cookieRole) {
      return cookieRole;
    }
    return localStorage.getItem('role');
  },

  getName() {
    const cookieName = Cookies.get('name');
    if (cookieName) {
      return cookieName;
    }
    return localStorage.getItem('name');
  },

  getFullName() {
    const cookieFullName = Cookies.get('fullName');
    if (cookieFullName) {
      return cookieFullName;
    }
    const storedUser = this._getStoredUser();
    if (storedUser && storedUser.fullName) {
      return storedUser.fullName;
    }
    return localStorage.getItem('fullName');
  },

  getProfileImage() {
    const cookieProfileImage = Cookies.get('profileImage');
    if (cookieProfileImage) {
      return cookieProfileImage;
    }
    const storedUser = this._getStoredUser();
    if (storedUser && (storedUser.avatar || storedUser.image)) {
      return storedUser.avatar || storedUser.image;
    }
    return localStorage.getItem('profileImage');
  },

  getCompanyId() {
    const cookieCompanyId = Cookies.get('companyId');
    if (cookieCompanyId) {
      return cookieCompanyId;
    }
    const localCompanyId = localStorage.getItem('companyId');
    if (localCompanyId) {
      return localCompanyId;
    }
    // Fallback: lấy userId nếu không có companyId
    const cookieUserId = Cookies.get('userId');
    if (cookieUserId) {
      return cookieUserId;
    }
    const localUserId = localStorage.getItem('userId');
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
    if (typeof window === 'undefined') return null; // Only run on client side
    const userString = localStorage.getItem('user');
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

  getFullNameCompany() {
    const cookieFullName = Cookies.get('fullName');
    if (cookieFullName) return cookieFullName;
    return localStorage.getItem('fullNameCompany');
  },

  getProfileImageCompany() {
    const cookieProfileImage = Cookies.get('profileImage');
    if (cookieProfileImage) return cookieProfileImage;
    return localStorage.getItem('profileImageCompany');
  }
};