import Cookies from 'js-cookie';
import ApiService from './api.service';

export const authService = {
  async login(email, password) {
    try {
      const data = await ApiService.login(email, password);
      console.log('authService.login: Raw data from ApiService.login:', data);
      // Lưu token và role (và tên nếu có) vào cookies với domain và path phù hợp
      const cookieOptions = {
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      };

      Cookies.set('token', data.token, cookieOptions);
      Cookies.set('role', data.role, cookieOptions);
      if (data.name) {
        Cookies.set('name', data.name, cookieOptions);
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
    Cookies.remove('token', { path: '/' });
    Cookies.remove('role', { path: '/' });
    Cookies.remove('name', { path: '/' });
    Cookies.remove('token', { path: '/', domain: 'localhost' });
    Cookies.remove('role', { path: '/', domain: 'localhost' });
    Cookies.remove('name', { path: '/', domain: 'localhost' });
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
  },

  getToken() {
    return Cookies.get('token');
  },

  getRole() {
    return Cookies.get('role');
  },

  getName() {
    return Cookies.get('name');
  },

  getCompanyId() {
    return Cookies.get('companyId');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};