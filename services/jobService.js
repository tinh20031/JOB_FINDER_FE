"use client";

import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../config/api.config";
import { JobStatus, getJobStatusLabel, getJobStatusColor } from "../utils/jobStatus";


const API_URL = API_CONFIG.BASE_URL;

// Cấu hình axios
axios.defaults.headers.common["Content-Type"] = "application/json";

// Map job types
const JOB_TYPES = {
  1: "Full-time",
  2: "Part-time",
  3: "Contract",
  4: "Internship",
};

// Map industries
const INDUSTRIES = {
  1: "Technology",
  2: "Finance",
  3: "Healthcare",
  4: "Education",
  5: "Marketing",
};

// Map job levels
const JOB_LEVELS = {
  1: "Intern",
  2: "Junior",
  3: "Middle",
  4: "Senior",
  5: "Lead",
  6: "Manager",
};

// Danh sách categories mẫu
const CATEGORIES = [
  "Design",
  "Development",
  "Marketing",
  "Business",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
];

// Danh sách job titles mẫu
const JOB_TITLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "QA Engineer",
];

// Danh sách companies mẫu
const COMPANIES = [
  "Tech Solutions Inc.",
  "Digital Innovations",
  "Future Systems",
  "Smart Tech",
  "Global Software",
  "Innovative Solutions",
  "Tech Pioneers",
  "Digital Dynamics",
  "Future Technologies",
  "Smart Solutions",
];

function getToken() {
  let token = localStorage.getItem("token");
  if (!token) {
    token = Cookies.get("token");
  }
  return token;
}

function getValidToken() {
  let token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined")
    token = Cookies.get("token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
}

// Helper function to set auth header
function getAuthConfig() {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export const jobService = {
  // ==================== CRUD OPERATIONS ====================

  // GET: Lấy danh sách tất cả jobs (có hỗ trợ filter role, companyId, ...)
  async getJobs(filters = {}) {
    const config = getAuthConfig();
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}/Job${params ? `?${params}` : ""}`,
      config
    );
    const apiJobs = response.data;

    // Ánh xạ dữ liệu từ API sang cấu trúc frontend
    const jobs = apiJobs.map((job) => ({
      id: job.jobId,
      jobTitle: job.title,
      description: job.description,
      education: job.education,
      yourSkill: job.yourSkill,
      yourExperience: job.yourExperience,
      location: `${job.addressDetail || ""}${
        job.addressDetail && job.provinceName ? ", " : ""
      }${job.provinceName || ""}`.trim(),
      provinceName: job.provinceName,
      isSalaryNegotiable: job.isSalaryNegotiable,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      logo:
        job.company?.urlCompanyLogo ||
        "/images/company-logo/default-logo.png",

      // Company info
      companyId: job.companyId,
      company: job.company
        ? {
            id: job.company.id,
            fullName: job.company.fullName,
            email: job.company.email,
            companyName: job.company.companyName,
            location: job.company.location,
            urlCompanyLogo: job.company.urlCompanyLogo,
          }
        : null,

      // Other IDs
      industryId: job.industryId,
      industry: job.industry
        ? {
            industryId: job.industry.industryId,
            industryName: job.industry.industryName,
          }
        : null,
      jobTypeId: job.jobTypeId,
      jobType: job.jobType
        ? {
            id: job.jobType.id,
            jobTypeName: job.jobType.jobTypeName,
          }
        : null,
      levelId: job.levelId,
      level: job.level
        ? {
            id: job.level.id,
            levelName: job.level.levelName,
          }
        : null,
      quantity: job.quantity ?? 1,
      // Time fields
      expiryDate: job.expiryDate,
      timeStart: job.timeStart,
      timeEnd: job.timeEnd,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      status: job.status,
      addressDetail: job.addressDetail,
      skills: job.skills || [],
      descriptionWeight: job.descriptionWeight ?? null,
      skillsWeight: job.skillsWeight ?? null,
      experienceWeight: job.experienceWeight ?? null,
      educationWeight: job.educationWeight ?? null,
      deactivatedByAdmin: job.deactivatedByAdmin,
    }));

    // Apply frontend filters
    let filteredJobs = [...jobs];

    if (filters.keyword) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.jobTitle
            ?.toLowerCase()
            .includes(filters.keyword.toLowerCase()) ||
          job.description
            ?.toLowerCase()
            .includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter((job) =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType?.length) {
      filteredJobs = filteredJobs.filter((job) =>
        filters.jobType.includes(job.jobTypeId)
      );
    }

    if (filters.category) {
      filteredJobs = filteredJobs.filter(
        (job) => job.industryId === parseInt(filters.category)
      );
    }

    if (filters.salary?.min !== undefined) {
      filteredJobs = filteredJobs.filter(
        (job) => job.minSalary >= filters.salary.min
      );
    }

    if (filters.salary?.max !== undefined) {
      filteredJobs = filteredJobs.filter(
        (job) => job.maxSalary <= filters.salary.max
      );
    }

    if (filters.quantity) {
      filteredJobs = filteredJobs.filter((job) => job.quantity === parseInt(filters.quantity));
    }

    // Pagination
    const total = filteredJobs.length;
    const start = filters.page
      ? (filters.page - 1) * (filters.limit || 10)
      : 0;
    const end = filters.limit ? start + filters.limit : filteredJobs.length;
    const paginatedJobs = filteredJobs.slice(start, end);

    return {
      data: paginatedJobs,
      total: total,
    };
  },

  // GET: Lấy job theo ID
  async getJobById(id) {
    try {
      const token = getValidToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/Job/${id}`, { headers });
      const job = response.data;

      if (!job) return null;

      return {
        id: job.jobId,
        title: job.title,
        jobTitle: job.title,
        description: job.description,
        education: job.education,
        yourSkill: job.yourSkill,
        yourExperience: job.yourExperience,
        addressDetail: job.addressDetail,
        location: `${job.addressDetail || ""}${
          job.addressDetail && job.provinceName ? ", " : ""
        }${job.provinceName || ""}`.trim(),
        provinceName: job.provinceName,
        isSalaryNegotiable: job.isSalaryNegotiable,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        logo:
          job.company?.urlCompanyLogo ||
          "/images/company-logo/default-logo.png",

        // Company info
        companyId: job.companyId,
        company: job.company
          ? {
              id: job.company.id,
              fullName: job.company.fullName,
              email: job.company.email,
              companyName: job.company.companyName,
              location: job.company.location,
              urlCompanyLogo: job.company.urlCompanyLogo,
            }
          : null,

        // Other IDs
        industryId: job.industryId,
        industry: job.industry
          ? {
              industryId: job.industry.industryId,
              industryName: job.industry.industryName,
            }
          : null,
        jobTypeId: job.jobTypeId,
        jobType: job.jobType
          ? {
              id: job.jobType.id,
              jobTypeName: job.jobType.jobTypeName,
            }
          : null,
        levelId: job.levelId,
        level: job.level
          ? {
              id: job.level.id,
              levelName: job.level.levelName,
            }
          : null,
        quantity: job.quantity ?? 1,
        // Time fields
        expiryDate: job.expiryDate,
        timeStart: job.timeStart,
        timeEnd: job.timeEnd,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        status: job.status,
        skills: job.skills || [],
        descriptionWeight: job.descriptionWeight ?? null,
        skillsWeight: job.skillsWeight ?? null,
        experienceWeight: job.experienceWeight ?? null,
        educationWeight: job.educationWeight ?? null,
        deactivatedByAdmin: job.deactivatedByAdmin,
      };
    } catch (error) {
      // Nếu là lỗi 403 hoặc 404 thì ném lại để page.jsx bắt được
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        throw error;
      }
      // Các lỗi khác thì log và trả về null
      console.error(`Error fetching job by ID ${id}:`, error);
      return null;
    }
  },

  // POST: Tạo job mới
  async createJob(jobData) {
    try {
      const config = getAuthConfig();

      const payload = {
        title: jobData.title,
        description: jobData.description,
        education: jobData.education,
        yourSkill: jobData.yourSkill,
        yourExperience: jobData.yourExperience,
        companyId: jobData.companyId,
        industryId: jobData.industryId,
        expiryDate: jobData.expiryDate,
        levelId: jobData.levelId,
        jobTypeId: jobData.jobTypeId,
        quantity: jobData.quantity,
        timeStart: jobData.timeStart,
        timeEnd: jobData.timeEnd,
        provinceName: jobData.provinceName,
        addressDetail: jobData.addressDetail,
        isSalaryNegotiable: jobData.isSalaryNegotiable,
        minSalary: jobData.isSalaryNegotiable ? null : jobData.minSalary,
        maxSalary: jobData.isSalaryNegotiable ? null : jobData.maxSalary,
        skillInputs: jobData.skillInputs || [],
        descriptionWeight:
          typeof jobData.descriptionWeight === "number"
            ? jobData.descriptionWeight / 100
            : null,
        skillsWeight:
          typeof jobData.skillsWeight === "number"
            ? jobData.skillsWeight / 100
            : null,
        experienceWeight:
          typeof jobData.experienceWeight === "number"
            ? jobData.experienceWeight / 100
            : null,
        educationWeight:
          typeof jobData.educationWeight === "number"
            ? jobData.educationWeight / 100
            : null,
      };

      const response = await axios.post(
        `${API_URL}/Job/create`,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // PUT: Cập nhật job
  async updateJob(jobId, jobData) {
    try {
      const config = getAuthConfig();

      const payload = {
        title: jobData.title,
        description: jobData.description,
        education: jobData.education,
        yourSkill: jobData.yourSkill,
        yourExperience: jobData.yourExperience,
        companyId: jobData.companyId,
        industryId: jobData.industryId,
        expiryDate: jobData.expiryDate,
        levelId: jobData.levelId,
        jobTypeId: jobData.jobTypeId,
        quantity: jobData.quantity,
        timeStart: jobData.timeStart,
        timeEnd: jobData.timeEnd,
        provinceName: jobData.provinceName,
        addressDetail: jobData.addressDetail,
        isSalaryNegotiable: jobData.isSalaryNegotiable,
        minSalary: jobData.isSalaryNegotiable
          ? null
          : Number(jobData.minSalary) || null,
        maxSalary: jobData.isSalaryNegotiable
          ? null
          : Number(jobData.maxSalary) || null,
        status: jobData.status, // Thêm status vào payload
        deactivatedByAdmin: jobData.deactivatedByAdmin, // Thêm deactivatedByAdmin vào payload
      };

      const response = await axios.put(
        `${API_URL}/Job/${jobId}`,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },

  // DELETE: Xóa job
  async deleteJob(jobId) {
    try {
      const config = getAuthConfig();
      const response = await axios.delete(`${API_URL}/Job/${jobId}`, config);
      return response.data;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },

  // ==================== STATUS MANAGEMENT ====================

  // PUT: Cập nhật trạng thái job
  async updateJobStatus(jobId, newStatus) {
    try {
      const config = getAuthConfig();
      const response = await axios.put(
        `${API_URL}/Job/${jobId}/status?newStatus=${newStatus}`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error updating job status:", error);
      throw error;
    }
  },

  // PUT: Lock/Unlock job (Admin only)
  async lockJob(jobId, isLock) {
    try {
      const config = getAuthConfig();
      const response = await axios.put(
        `${API_URL}/Job/${jobId}/lock?isLock=${isLock}`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error locking/unlocking job:", error);
      throw error;
    }
  },

  // ==================== FILTERING ====================

  // GET: Lọc jobs với backend filter
  async filterJobs(filterParams) {
    try {
      const queryParams = new URLSearchParams();

      if (filterParams.title) queryParams.append("Title", filterParams.title);
      if (filterParams.industryId)
        queryParams.append("IndustryId", filterParams.industryId);
      if (filterParams.levelId)
        queryParams.append("LevelId", filterParams.levelId);
      if (filterParams.jobTypeId)
        queryParams.append("JobTypeId", filterParams.jobTypeId);
      if (filterParams.quantity)
        queryParams.append("Quantity", filterParams.quantity);
      if (filterParams.minSalary)
        queryParams.append("MinSalary", filterParams.minSalary);
      if (filterParams.maxSalary)
        queryParams.append("MaxSalary", filterParams.maxSalary);
      if (filterParams.provinceName)
        queryParams.append("ProvinceName", filterParams.provinceName);
      if (filterParams.status)
        queryParams.append("Status", filterParams.status);
      if (filterParams.companyId)
        queryParams.append("CompanyId", filterParams.companyId);
      if (filterParams.timeStart)
        queryParams.append("TimeStart", filterParams.timeStart);
      if (filterParams.timeEnd)
        queryParams.append("TimeEnd", filterParams.timeEnd);
      if (filterParams.skillIds) {
        filterParams.skillIds.forEach((id) =>
          queryParams.append("SkillIds", id)
        );
      }
      if (filterParams.skillName)
        queryParams.append("SkillName", filterParams.skillName);

      const response = await axios.get(
        `${API_URL}/Job/filter?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error filtering jobs:", error);
      throw error;
    }
  },

  // ==================== LOOKUP DATA ====================

  // GET: Lấy job types
  async getJobTypes() {
    try {
      const response = await axios.get(`${API_URL}/JobType`);
      return response.data;
    } catch (error) {
      console.error("Error fetching job types:", error);
      throw error;
    }
  },

  // GET: Lấy job levels
  async getJobLevels() {
    try {
      const response = await axios.get(`${API_URL}/Level`);
      return response.data;
    } catch (error) {
      console.error("Error fetching job levels:", error);
      throw error;
    }
  },

  // GET: Lấy industries
  async getIndustries() {
    try {
      const response = await axios.get(`${API_URL}/Industry`);
      return response.data;
    } catch (error) {
      console.error("Error fetching industries:", error);
      throw error;
    }
  },

  // GET: Lấy skills
  async getSkills() {
    try {
      const response = await axios.get(`${API_URL}/Skill`);
      return response.data;
    } catch (error) {
      console.error("Error fetching skills:", error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  // GET: Lấy job categories (mapping từ industries)
  async getJobCategories() {
    try {
      const industries = await this.getIndustries();
      return industries.map((industry, index) => ({
        id: industry.industryId,
        title: industry.industryName,
      }));
    } catch (error) {
      console.error("Error fetching job categories:", error);
      // Fallback to static categories
      return CATEGORIES.map((category, index) => ({
        id: index + 1,
        title: category,
      }));
    }
  },

  // GET: Lấy companies
  async getCompanies() {
    try {
      const response = await axios.get(`${API_URL}/CompanyProfile`);
      return response.data.map((company) => ({
        id: company.userId,
        name: company.companyName,
        description: company.companyProfileDescription,
        location: company.location,
        logo: company.urlCompanyLogo || "/images/company-logo/default-logo.png",
        logoLgr: company.imageLogoLgr,
        teamSize: company.teamSize,
        website: company.website,
        contact: company.contact,
        industryId: company.industryId,
        isActive: company.isActive,
        industryName: INDUSTRIES[company.industryId] || "",
      }));
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  // GET: Lấy provinces
  async getProvinces() {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/`);
      return response.data.map((province) => ({
        id: province.code,
        name: province.name,
      }));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }
  },

  // ==================== APPLICATION RELATED ====================

  // GET: Lấy jobs đã apply
  async getAppliedJobs() {
    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${API_URL}/Application/my-applied-jobs-with-cvs`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      throw error;
    }
  },

  // GET: Lấy applicants của job (cho company)
  async getJobApplicants(jobId) {
    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${API_URL}/Application/job/${jobId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching applicants for job ID ${jobId}:`, error);
      throw error;
    }
  },

  // ==================== FAVORITE COMPANIES ====================

  // GET: Lấy favorite companies
  async getFavoriteCompanies() {
    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${API_URL}/Application/my-favorite-companies`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error getting favorite companies:", error);
      throw error;
    }
  },

  // POST: Thêm company vào favorite
  async favoriteCompany(companyId) {
    try {
      const config = getAuthConfig();
      const response = await axios.post(
        `${API_URL}/Application/favorite-company/${companyId}`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error favoriting company:", error);
      throw error;
    }
  },

  // DELETE: Xóa company khỏi favorite
  async unfavoriteCompany(companyId) {
    try {
      const config = getAuthConfig();
      const response = await axios.delete(
        `${API_URL}/Application/favorite-company/${companyId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error unfavoriting company:", error);
      throw error;
    }
  },

  // ==================== HELPER FUNCTIONS ====================

  // Helper: Map job status to display text
  getJobStatusText(status) {
    return getJobStatusLabel(status, 'vi');
  },

  // Admin job management methods
  async approveJob(jobId) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/Job/${jobId}/status?newStatus=2`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error approving job:", error);
      throw error;
    }
  },

  async rejectJob(jobId) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/Job/${jobId}/status?newStatus=3`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting job:", error);
      throw error;
    }
  },

  // Helper: Check if job can be edited by company
  canCompanyEditJob(job) {
    if (!job) return false;

    // Job must not be expired
    if (new Date(job.timeEnd) < new Date()) return false;

    // Job must not be locked by admin
    if (job.deactivatedByAdmin) return false;

    return true;
  },

  // Helper: Check if job can be deleted
  canDeleteJob(job) {
    if (!job) return false;

    // Cannot delete active jobs
    if (job.status === "active") return false;

    return true;
  },

  // Helper: Format salary display
  formatSalary(minSalary, maxSalary, isNegotiable) {
    if (isNegotiable) return "Thỏa thuận";
    if (minSalary && maxSalary) {
      return `${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} VNĐ`;
    }
    if (minSalary) return `Từ ${minSalary.toLocaleString()} VNĐ`;
    if (maxSalary) return `Đến ${maxSalary.toLocaleString()} VNĐ`;
    return "Không công bố";
  },



  async getAppliedCount(jobId) {
    try {
      const response = await axios.get(`${API_URL}/Application/job/${jobId}`);
      return Array.isArray(response.data) ? response.data.length : 0;
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        // Không log nếu là 404
        return 0;
      }
      // Các lỗi khác mới log
      console.error("Error fetching applied count:", error);
      return 0;
    }
  },

  // Hàm lấy tất cả job active (status === 2) và không bị lock
  async getActiveJobs(filters = {}) {
    const { data: jobs } = await this.getJobs(filters);
    return jobs.filter((job) => job.status === 2 && !job.deactivatedByAdmin && job.status !== 4);
  },

  // POST: Track job view
  async trackJobView(jobId) {
    try {
      const token = getValidToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${API_URL}/JobView/track`,
        { jobId },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking job view:", error);
      // Optionally, you can throw or return null
      return null;
    }
  },

  // Lấy thống kê tổng hợp cho công ty (view, apply, phần trăm apply, từng job) theo khoảng thời gian
  async getCompanyStatistics(companyId, fromDate, toDate) {
    try {
      const token = getValidToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const response = await axios.get(
        `${API_URL}/JobStatistics/company/${companyId}`,
        { headers, params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching company statistics:", error);
      throw error;
    }
  },

  // Lấy danh sách job theo companyId
  async getJobsByCompanyId(companyId) {
    try {
      const config = getAuthConfig();
      const response = await axios.get(`${API_URL}/Job`, config);
      const apiJobs = response.data;
      // Lọc job theo companyId
      const jobs = apiJobs.filter((job) => job.companyId === companyId);
      return jobs;
    } catch (error) {
      console.error("Error fetching jobs by companyId:", error);
      return [];
    }
  },

  // Lấy thống kê job theo khoảng thời gian tuỳ ý
  async getJobStatisticsFiltered(jobId, fromDate, toDate) {
    try {
      const token = getValidToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const response = await axios.get(
        `${API_URL}/JobStatistics/job/${jobId}`,
        { headers, params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching job statistics filtered:", error);
      throw error;
    }
  },


  // Lấy job nổi bật (highlight) của company
  async getCompanyHighlightJobs(companyId, limit = 5, timeRange = '7d') {
    try {
      const response = await axios.get(`${API_URL}/Job/company/${companyId}/highlight?limit=${limit}&timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching highlight jobs:', error);
      return { Jobs: [] };
    }
  },

  // GET: Lấy danh sách trending jobs
  async getTrendingJobs({ role = "candidate", companyId = null, page = 1, pageSize = 10 } = {}) {
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (companyId) params.append("companyId", companyId);
      if (page) params.append("page", page);
      if (pageSize) params.append("pageSize", pageSize);
      const response = await axios.get(`${API_URL}/job/trending?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching trending jobs:", error);
      throw error;

    }
  },
};

export default jobService;
