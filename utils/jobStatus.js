/**
 * Job Status Enum
 * Định nghĩa các trạng thái của job
 */
export const JobStatus = {
  DRAFT: 0,
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
  INACTIVEBYADMIN: 4
};

/**
 * Job Status Labels (Tiếng Việt)
 */
export const JobStatusLabels = {
  [JobStatus.DRAFT]: "Bản nháp",
  [JobStatus.PENDING]: "Chờ duyệt", 
  [JobStatus.ACTIVE]: "Đang hoạt động",
  [JobStatus.INACTIVE]: "Tạm dừng",
  [JobStatus.INACTIVEBYADMIN]: "Tạm dừng (Admin)"
};

/**
 * Job Status Labels (English)
 */
export const JobStatusLabelsEN = {
  [JobStatus.DRAFT]: "Draft",
  [JobStatus.PENDING]: "Pending",
  [JobStatus.ACTIVE]: "Active", 
  [JobStatus.INACTIVE]: "Inactive",
  [JobStatus.INACTIVEBYADMIN]: "Inactive (Admin)"
};

/**
 * Job Status Colors for UI
 */
export const JobStatusColors = {
  [JobStatus.DRAFT]: "bg-info",
  [JobStatus.PENDING]: "bg-warning",
  [JobStatus.ACTIVE]: "bg-success",
  [JobStatus.INACTIVE]: "bg-secondary",
  [JobStatus.INACTIVEBYADMIN]: "bg-danger"
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

/**
 * Helper function to check if job is inactive by admin
 */
export const isJobInactiveByAdmin = (status) => {
  return status === JobStatus.INACTIVEBYADMIN;
};

/**
 * Helper function to check if job is inactive (either by company or admin)
 */
export const isJobInactiveAny = (status) => {
  return status === JobStatus.INACTIVE || status === JobStatus.INACTIVEBYADMIN;
};

export default JobStatus; 