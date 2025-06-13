// API Configuration
const API_CONFIG = {
  // Base URL sẽ được set từ biến môi trường
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5194/api',

  // Tách riêng các endpoint không phụ thuộc vào URL
  ENDPOINTS: {
    AUTH: {
      LOGIN: 'auth/login',
      REGISTER: 'auth/register',
      LOGOUT: 'auth/logout',
      REFRESH_TOKEN: 'auth/refresh-token',
      CHANGE_PASSWORD: 'auth/change-password',
      FORGOT_PASSWORD: 'auth/forgot-password',
      RESET_PASSWORD: 'auth/reset-password',
    },
    USER: {
      BASE: 'User',
      PROFILE: 'users/profile',
      VERIFY: (id) => `users/${id}/verify`,
      LOCK: (id) => `User/${id}/lock`,
      UNLOCK: (id) => `User/${id}/unlock`,
      CHANGE_PASSWORD: 'users/change-password',
      UPDATE_PROFILE: 'users/update-profile',
      UPLOAD_AVATAR: 'users/upload-avatar',
      UPLOAD_CV: 'users/upload-cv',
      GET_CV: (id) => `users/${id}/cv`,
      GET_APPLICATIONS: (id) => `users/${id}/applications`,
      GET_SAVED_JOBS: (id) => `users/${id}/saved-jobs`,
      SAVE_JOB: (userId, jobId) => `users/${userId}/saved-jobs/${jobId}`,
      UNSAVE_JOB: (userId, jobId) => `users/${userId}/saved-jobs/${jobId}`,
    },
    ROLE: {
      BASE: 'role',
      GET_ALL: 'role',
      GET_BY_ID: (id) => `role/${id}`,
      CREATE: 'role',
      UPDATE: (id) => `role/${id}`,
      DELETE: (id) => `role/${id}`,
    },
    JOB: {
      BASE: 'job',
      CREATE: 'job/create',
      UPDATE: (id) => `job/${id}`,
      DELETE: (id) => `job/${id}`,
      APPLY: (id) => `job/${id}/apply`,
      SEARCH: 'job/search',
      FILTER: 'job/filter',
      RECOMMEND: 'job/recommend',
      GET_APPLICANTS: (id) => `job/${id}/applicants`,
      GET_COMPANY_JOBS: (companyId) => `job/company/${companyId}`,
      GET_SAVED_JOBS: (userId) => `job/saved/${userId}`,
      GET_RECENT_JOBS: 'job/recent',
      GET_FEATURED_JOBS: 'job/featured',
      GET_SIMILAR_JOBS: (id) => `job/${id}/similar`,
    },
    COMPANY: {
      BASE: 'CompanyProfile',
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
      BASE: 'job-posts',
      APPROVE: (id) => `job-posts/${id}/approve`,
      REJECT: (id) => `job-posts/${id}/reject`,
      DRAFT: (id) => `job-posts/${id}/draft`,
      PUBLISH: (id) => `job-posts/${id}/publish`,
      GET_PENDING: 'job-posts/pending',
      GET_APPROVED: 'job-posts/approved',
      GET_REJECTED: 'job-posts/rejected',
      GET_DRAFTS: 'job-posts/drafts',
      GET_STATISTICS: 'job-posts/statistics',
    },
    MASTER_DATA: {
      LEVELS: 'master/levels',
      INDUSTRIES: 'Industry',
      JOB_TYPES: 'master/job-types',
      EXPERIENCE_LEVELS: 'master/experience-levels',
      PROVINCES: 'master/provinces',
      SKILLS: 'master/skills',
      TEAM_SIZES: 'master/team-sizes',
      SALARY_RANGES: 'master/salary-ranges',
      EDUCATION_LEVELS: 'master/education-levels',
      LANGUAGES: 'master/languages',
    },
    APPLICATION: {
      BASE: 'applications',
      SUBMIT: 'applications/submit',
      WITHDRAW: (id) => `applications/${id}/withdraw`,
      UPDATE_STATUS: (id) => `applications/${id}/status`,
      CANDIDATE_APPLICATIONS: 'applications/candidate',
      COMPANY_APPLICATIONS: 'applications/company',
      GET_STATISTICS: 'applications/statistics',
      GET_BY_JOB: (jobId) => `applications/job/${jobId}`,
      GET_BY_CANDIDATE: (candidateId) => `applications/candidate/${candidateId}`,
      GET_BY_COMPANY: (companyId) => `applications/company/${companyId}`,
    },
    CANDIDATE_PROFILE: {
      BASE: 'CandidateProfile',
      GET_BY_ID: (id) => `CandidateProfile/${id}`,
    },
    NOTIFICATION: {
      BASE: 'notifications',
      MARK_READ: (id) => `notifications/${id}/read`,
      MARK_ALL_READ: 'notifications/mark-all-read',
      SETTINGS: 'notifications/settings',
      GET_UNREAD: 'notifications/unread',
      GET_ALL: 'notifications/all',
      GET_BY_USER: (userId) => `notifications/user/${userId}`,
      SEND: 'notifications/send',
    },
    UPLOAD: {
      AVATAR: 'upload/avatar',
      CV: 'upload/cv',
      COMPANY_LOGO: 'upload/company-logo',
      JOB_IMAGE: 'upload/job-image',
    },
    SKILL: {
      BASE: 'Skill',
      GET_BY_ID: (id) => `Skill/${id}`,
    },
    LEVEL: '/Level',
    JOB_TYPE: '/JobType',
    EXPERIENCE_LEVEL: '/ExperienceLevels',
    INDUSTRY: '/Industry',
  },

  // Helper functions để tạo URL đầy đủ
  getUrl: (endpoint) => `${API_CONFIG.BASE_URL}/${endpoint}`,
  
  // Helper function để tạo URL với query params
  getUrlWithParams: (endpoint, params) => {
    const url = API_CONFIG.getUrl(endpoint);
    if (!params) return url;
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return queryString ? `${url}?${queryString}` : url;
  },

  // Helper function để tạo request options
  getRequestOptions: (method = 'GET', data = null, headers = {}) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      credentials: 'include', // Cho phép gửi cookies
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    return options;
  },

  // Helper function để xử lý response
  handleResponse: async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

export default API_CONFIG; 