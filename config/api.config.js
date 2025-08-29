// API Configuration
const API_CONFIG = {

  // Use environment variables or fallback to local proxy paths
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://jobfindersever.io.vn/api",
  SIGNALR_CHAT_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_CHAT_HUB_URL || "https://jobfindersever.io.vn/chathub",
  SIGNALR_NOTIFICATION_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_NOTIFICATION_HUB_URL || "https://jobfindersever.io.vn/notificationHub",
  // BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5194/api",
  // SIGNALR_CHAT_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_CHAT_HUB_URL || "http://localhost:5194/chathub",
  // SIGNALR_NOTIFICATION_HUB_URL: process.env.NEXT_PUBLIC_SIGNALR_NOTIFICATION_HUB_URL || "http://localhost:5194/notificationHub",

  ENDPOINTS: {
    AUTH: {
      LOGIN: "auth/login",
      REGISTER: "auth/register",
      LOGOUT: "auth/logout",
      REFRESH_TOKEN: "auth/refresh-token",
      CHANGE_PASSWORD: "auth/change-password",
      FORGOT_PASSWORD: "auth/forgot-password",
      RESET_PASSWORD: "auth/reset-password",
      GOOGLE_LOGIN: "auth/login-google", 
    },
    USER: { 
      BASE: "User",
      PROFILE: "users/profile",
      VERIFY: (id) => `users/${id}/verify`,
      LOCK: (id) => `User/${id}/lock`,
      UNLOCK: (id) => `User/${id}/unlock`,  
      CHANGE_PASSWORD: "users/change-password",
      UPDATE_PROFILE: "users/update-profile",
      UPLOAD_AVATAR: "users/upload-avatar",
      UPLOAD_CV: "users/upload-cv",
      GET_CV: (id) => `users/${id}/cv`,
      GET_APPLICATIONS: (id) => `users/${id}/applications`,
      GET_SAVED_JOBS: (id) => `users/${id}/saved-jobs`,
      SAVE_JOB: (userId, jobId) => `users/${userId}/saved-jobs/${jobId}`,
      UNSAVE_JOB: (userId, jobId) => `users/${userId}/saved-jobs/${jobId}`,
    },
    ROLE: {
      BASE: "role",
      GET_ALL: "role",
      GET_BY_ID: (id) => `role/${id}`,
      CREATE: "role",
      UPDATE: (id) => `role/${id}`,
      DELETE: (id) => `role/${id}`,
    },
    JOB: {
      BASE: "job",
      CREATE: "job/create",
      TRENDING_CREATE: "job/trending",
      UPDATE: (id) => `job/${id}`,
      DELETE: (id) => `job/${id}`,
      APPLY: (id) => `job/${id}/apply`,
      SEARCH: "job/search",
      FILTER: "job/filter",
      RECOMMEND: "job/recommend",
      GET_APPLICANTS: (id) => `job/${id}/applicants`,
      GET_COMPANY_JOBS: (companyId) => `job/company/${companyId}`,
      GET_SAVED_JOBS: (userId) => `job/saved/${userId}`,
      GET_RECENT_JOBS: "job/recent",
      GET_FEATURED_JOBS: "job/featured",
      GET_SIMILAR_JOBS: (id) => `job/${id}/similar`,
      SAVE_DRAFT: "job/save-draft",
      GET_DRAFTS: "job/drafts",
      DELETE_DRAFT: (id) => `job/draft/${id}`,
    },
    COMPANY: {
      BASE: "CompanyProfile",
      PROFILE: (id) => `companies/${id}/profile`,
      VERIFY: (id) => `companies/${id}/verify`,
      LOCK: (id) => `companies/${id}/lock`,
      UNLOCK: (id) => `companies/${id}/unlock`,
      JOBS: (id) => `companies/${id}/jobs`,
      REVIEWS: (id) => `companies/${id}/reviews`,
      UPDATE_PROFILE: (id) => `companies/${id}/profile`,
      UPLOAD_LOGO: (id) => `companies/${id}/logo`,
      GET_STATISTICS: (id) => `companies/${id}/statistics`,
      GET_APPLICATIONS: (id) => `companies/${id}/applications`,
      GET_REVIEWS: (id) => `companies/${id}/reviews`,
      ADD_REVIEW: (id) => `companies/${id}/reviews`,
    },
    JOB_POST: {
      BASE: "job-posts",
      APPROVE: (id) => `job-posts/${id}/approve`,
      REJECT: (id) => `job-posts/${id}/reject`,
      DRAFT: (id) => `job-posts/${id}/draft`,
      PUBLISH: (id) => `job-posts/${id}/publish`,
      GET_PENDING: "job-posts/pending",
      GET_APPROVED: "job-posts/approved",
      GET_REJECTED: "job-posts/rejected",
      GET_DRAFTS: "job-posts/drafts",
      GET_STATISTICS: "job-posts/statistics",
    },
    MASTER_DATA: {
      LEVELS: "master/levels",
      INDUSTRIES: "/Industry",
      JOB_TYPES: "master/job-types",
      EXPERIENCE_LEVELS: "master/experience-levels",
      PROVINCES: "master/provinces",
      SKILLS: "master/skills",
      TEAM_SIZES: "master/team-sizes",
      SALARY_RANGES: "master/salary-ranges",
      EDUCATION_LEVELS: "master/education-levels",
      LANGUAGES: "master/languages",
    },
    APPLICATION: {
      BASE: "applications",
      SUBMIT: "applications/submit",
      WITHDRAW: (id) => `applications/${id}/withdraw`,
      UPDATE_STATUS: (id) => `applications/${id}/status`,
      CANDIDATE_APPLICATIONS: "applications/candidate",
      COMPANY_APPLICATIONS: "applications/company",
      GET_STATISTICS: "applications/statistics",
      GET_BY_JOB: (jobId) => `applications/job/${jobId}`,
      GET_BY_CANDIDATE: (candidateId) =>
        `applications/candidate/${candidateId}`,
      GET_BY_COMPANY: (companyId) => `applications/company/${companyId}`,
    },
    CANDIDATE_PROFILE: {
      BASE: "CandidateProfile",
      GET_BY_ID: (id) => `CandidateProfile/${id}`,
    },
    NOTIFICATION: {
      BASE: "notifications",
      MARK_READ: (id) => `notifications/${id}/read`,
      MARK_ALL_READ: "notifications/mark-all-read",
      SETTINGS: "notifications/settings",
      GET_UNREAD: "notifications/unread",
      GET_ALL: "notifications/all",
      GET_BY_USER: (userId) => `notifications/user/${userId}`,
      SEND: "notifications/send",
    },
    UPLOAD: {
      AVATAR: "upload/avatar",
      CV: "upload/cv",
      COMPANY_LOGO: "upload/company-logo",
      JOB_IMAGE: "upload/job-image",
    },
    SKILL: {
      BASE: "Skill",
      GET_BY_ID: (id) => `Skill/${id}`,
    },
    REVENUE_STATISTICS: {
      BASE: "RevenueStatistics",
      SUMMARY: "RevenueStatistics/summary",
      MONTHLY: "RevenueStatistics/monthly",
      BY_PACKAGE_TYPE: "RevenueStatistics/by-package-type",
      RECENT_TRANSACTIONS: "RevenueStatistics/recent-transactions",
      DASHBOARD: "RevenueStatistics/dashboard",
      EXPORT: "RevenueStatistics/export",
      PACKAGE_UPGRADES: "RevenueStatistics/package-upgrades",
    },
    CANDIDATE_TO_COMPANY: {
      BASE: "candidatetocompany",
      REQUESTS: "candidatetocompany/requests",
      PROCESS_UPGRADE: (userId) => `candidatetocompany/process-upgrade/${userId}`,
    },
    LEVEL: "/Level",
    JOB_TYPE: "/JobType",
    EXPERIENCE_LEVEL: "/ExperienceLevels",
    INDUSTRY: "/Industry",
    JOB_SKILLS: "/JobSkill",
    SKILLS: "/Skill",
  },

  // Helper functions để tạo URL đầy đủ
  getUrl: (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
  },

  // Thêm hàm lấy Google login URL
  getGoogleLoginUrl: () =>
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL ||
    `${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN}`,


  getUrlWithParams: (endpoint, params) => {
    const url = API_CONFIG.getUrl(endpoint);
    if (!params) return url;
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    return queryString ? `${url}?${queryString}` : url;
  },

  // Helper function để tạo request options
  getRequestOptions: (method = "GET", data = null, headers = {}) => {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      credentials: "include", // Cho phép gửi cookies
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    return options;
  },

  // Helper function để xử lý response
  handleResponse: async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
      // Preserve original error data for better error handling
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
      error.data = errorData;
      throw error;
    }
    return response.json();
  },
};

export default API_CONFIG;