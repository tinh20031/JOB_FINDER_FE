/**
 * Job Status Enum
 * Định nghĩa các trạng thái của job
 */
export const JobStatus = {
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
  INACTIVEBYADMIN: 4
};

/**
 * Job Status Labels (Tiếng Việt)
 */
export const JobStatusLabels = {
[JobStatus.PENDING]: "Pending",
[JobStatus.ACTIVE]: "Active",
[JobStatus.INACTIVE]: "Paused",
[JobStatus.INACTIVEBYADMIN]: "Rejected"
};

/**
 * Job Status Labels (English)
 */
export const JobStatusLabelsEN = {
  [JobStatus.PENDING]: "Pending",
  [JobStatus.ACTIVE]: "Active", 
  [JobStatus.INACTIVE]: "Inactive",
  [JobStatus.INACTIVEBYADMIN]: "Rejected"
};

/**
 * Job Status Colors for UI
 */
export const JobStatusColors = {
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

// Removed isJobDraft function

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