/**
 * Job Status Enum
 * Định nghĩa các trạng thái của job
 */
export const JobStatus = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3
};

/**
 * Job Status Labels (Tiếng Việt)
 */
export const JobStatusLabels = {
  [JobStatus.DRAFT]: "Bản nháp",
  [JobStatus.PENDING]: "Chờ duyệt", 
  [JobStatus.ACTIVE]: "Đang hoạt động",
  [JobStatus.INACTIVE]: "Tạm dừng"
};

/**
 * Job Status Labels (English)
 */
export const JobStatusLabelsEN = {
  [JobStatus.DRAFT]: "Draft",
  [JobStatus.PENDING]: "Pending",
  [JobStatus.ACTIVE]: "Active", 
  [JobStatus.INACTIVE]: "Inactive"
};

/**
 * Job Status Colors for UI
 */
export const JobStatusColors = {
  [JobStatus.DRAFT]: "bg-info",
  [JobStatus.PENDING]: "bg-warning",
  [JobStatus.ACTIVE]: "bg-success",
  [JobStatus.INACTIVE]: "bg-secondary"
};

/**
 * Helper function to get status label
 */
export const getJobStatusLabel = (status, language = 'vi') => {
  if (language === 'en') {
    return JobStatusLabelsEN[status] || 'Unknown';
  }
  return JobStatusLabels[status] || 'Không xác định';
};

/**
 * Helper function to get status color
 */
export const getJobStatusColor = (status) => {
  return JobStatusColors[status] || 'bg-secondary';
};

/**
 * Helper function to check if job is active
 */
export const isJobActive = (status) => {
  return status === JobStatus.ACTIVE;
};

/**
 * Helper function to check if job is pending
 */
export const isJobPending = (status) => {
  return status === JobStatus.PENDING;
};

/**
 * Helper function to check if job is draft
 */
export const isJobDraft = (status) => {
  return status === JobStatus.DRAFT;
};

/**
 * Helper function to check if job is inactive
 */
export const isJobInactive = (status) => {
  return status === JobStatus.INACTIVE;
};

export default JobStatus; 