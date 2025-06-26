import API_CONFIG from "../config/api.config";




const BASE_URL = 'http://localhost:5194/api';
// Định nghĩa class trước
class ApiServiceClass {
  // Auth APIs
  static async login(email, password) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);
    const options = API_CONFIG.getRequestOptions("POST", { email, password });
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async register(userData) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER);
    const options = API_CONFIG.getRequestOptions("POST", userData);
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  // User APIs
  static async getUsers(params) {
    const url = API_CONFIG.getUrlWithParams(
      API_CONFIG.ENDPOINTS.USER.BASE,
      params
    );
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async getUserById(id) {
    const url = API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.USER.BASE}/${id}`);
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async updateUser(id, userData) {
    const url = API_CONFIG.getUrl(
      `${API_CONFIG.ENDPOINTS.USER.BASE}/full/${id}`
    );
    let options;
    if (userData instanceof FormData) {
      options = {
        method: "PUT",
        body: userData,
      };
    } else {
      options = API_CONFIG.getRequestOptions("PUT", userData);
    }
    const response = await fetch(url, options);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  // Job APIs
  static async getJobs(params) {
    const url = API_CONFIG.getUrlWithParams(
      API_CONFIG.ENDPOINTS.JOB.BASE,
      params
    );
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async createJob(jobData) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.JOB.CREATE);
    let options;
    if (jobData instanceof FormData) {
      options = {
        method: "POST",
        body: jobData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // Don't set Content-Type for FormData, browser will set it automatically with boundary
      };
    } else {
      options = {
        ...API_CONFIG.getRequestOptions("POST", jobData),
        headers: {
          ...API_CONFIG.getRequestOptions("POST", jobData).headers,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: `Failed to parse error response from server (status: ${response.status})`,
          }));
        console.error("Job creation error details:", errorData);
        throw new Error(
          errorData.message ||
            errorData.title ||
            `HTTP error! status: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      console.error("Job creation exception:", error);
      throw error;
    }
  }

  // Company APIs
  static async getCompanies(params) {
    const url = API_CONFIG.getUrlWithParams(
      API_CONFIG.ENDPOINTS.COMPANY.BASE,
      params
    );
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async verifyCompany(id) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.COMPANY.VERIFY(id));
    const options = API_CONFIG.getRequestOptions("PATCH");
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  // Master Data APIs
  static async getMasterData(type) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.MASTER_DATA[type]);
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  // Generic method để xử lý các API calls khác
  static async request(endpoint, method = "GET", data = null, params = null) {
    const url = API_CONFIG.getUrlWithParams(endpoint, params);
    const token = localStorage.getItem("token");
    const options = {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      if (data instanceof FormData) {
        options.body = data;
        // KHÔNG set Content-Type, browser sẽ tự động set boundary cho multipart/form-data
        delete options.headers["Content-Type"];
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      // If response is 204 No Content, return null instead of trying to parse JSON
      if (response.status === 204) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  static async getCompanyProfileById(id) {
    const url = API_CONFIG.getUrl(`CompanyProfile/${id}`);
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  // Candidate Profile APIs
  static async getCandidateProfileById(id) {
    const url = API_CONFIG.getUrl(
      API_CONFIG.ENDPOINTS.CANDIDATE_PROFILE.GET_BY_ID(id)
    );
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  // Skill APIs
  static async getSkillById(id) {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SKILL.GET_BY_ID(id));
    const options = API_CONFIG.getRequestOptions();
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async verifyEmail(email, verificationCode) {
    const url = API_CONFIG.getUrl("auth/verify-email");
    const options = API_CONFIG.getRequestOptions("POST", {
      email,
      verificationCode,
    });
    return API_CONFIG.handleResponse(await fetch(url, options));
  }

  static async resendVerification(email) {
    const url = API_CONFIG.getUrl("auth/resend-verification");
    const options = API_CONFIG.getRequestOptions("POST", { email });
    return API_CONFIG.handleResponse(await fetch(url, options));
  }
}

// Sau đó tạo object từ class
const ApiService = {
  get: (endpoint) => {
    const token = localStorage.getItem("token");
    return fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    });
  },
  post: (endpoint, data) => {
    const token = localStorage.getItem("token");
    return fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        // Cố gắng parse lỗi từ body
        const errorData = await res
          .json()
          .catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      const text = await res.text();
      try {
        // Thử parse dưới dạng JSON trước
        return JSON.parse(text);
      } catch (error) {
        // Nếu không phải JSON, trả về dạng text (cho các response như "OK")
        return text;
      }
    });
  },
  login: ApiServiceClass.login,
  register: ApiServiceClass.register,
  getCompanies: ApiServiceClass.getCompanies,
  verifyCompany: ApiServiceClass.verifyCompany,
  getMasterData: ApiServiceClass.getMasterData,
  getUsers: ApiServiceClass.getUsers,
  getUserById: ApiServiceClass.getUserById,
  updateUser: ApiServiceClass.updateUser,
  request: ApiServiceClass.request,
  createJob: ApiServiceClass.createJob,
  addUser: async (formData) => {
    const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.USER.BASE);
    const options = {
      method: "POST",
      body: formData,
      // KHÔNG set Content-Type, browser sẽ tự động set boundary cho multipart/form-data
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  },
  deleteUser: async (id) => {
    const url = API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.USER.BASE}/${id}`);
    const options = { method: "DELETE" };
    return fetch(url, options);
  },
  getCompanyProfileById: ApiServiceClass.getCompanyProfileById,
  getCandidateProfileById: ApiServiceClass.getCandidateProfileById,
  getSkillById: ApiServiceClass.getSkillById,
  changePassword: (payload) => {
    return ApiService.post("/Auth/change-password", payload);
  },
  getJobList: (params) => {
    return ApiService.get("/Job/list-job", { params });
  },
  verifyEmail: ApiServiceClass.verifyEmail,
  resendVerification: ApiServiceClass.resendVerification,
};

export default ApiService;
