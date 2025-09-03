import API_CONFIG from "../config/api.config";

const notificationService = {
  getAllNotifications: async (page = 1, pageSize = 1000, isRead = null) => {
    const token = localStorage.getItem("token");
    let url = `${API_CONFIG.BASE_URL}/notification?page=${page}&pageSize=${pageSize}`;
    if (isRead !== null) url += `&isRead=${isRead}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  getUnreadCount: async () => {
    const token = localStorage.getItem("token");
    const url = `${API_CONFIG.BASE_URL}/notification/unread-count`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch unread count");
    return res.json();
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem("token");
    const url = `${API_CONFIG.BASE_URL}/notification/${id}/read`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    return res.text();
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem("token");
    const url = `${API_CONFIG.BASE_URL}/notification/read-all`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to mark all notifications as read");
    return res.text();
  },

  sendNotification: async (notificationRequest) => {
    const token = localStorage.getItem("token");
    const url = `${API_CONFIG.BASE_URL}/notification/send`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationRequest),
    });
    if (!res.ok) throw new Error("Failed to send notification");
    return res.json();
  },

  getUpcomingJobAlerts: async (daysBefore = 2) => {
    const token = localStorage.getItem("token");
    const url = `${API_CONFIG.BASE_URL}/job/notify-upcoming-start-new?daysBefore=${daysBefore}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch upcoming job alerts");
    const data = await res.json();
    return Array.isArray(data.jobs) ? data.jobs : [];
  },
};

// Mapping notification type/link to detail URL
const notificationTypeToUrl = {
  1: (n) => `/job-detail/${n.link?.split("/").pop()}`,
  2: (n) => n.link || "/notifications", // ApplicationStatus
  3: (n) => "/notifications", // SystemNotification
  4: (n) => `/job-detail/${n.link?.split("/").pop()}`,
5: (n) => `/job-detail/${n.link?.split("/").pop()}`,
  6: (n) => n.link, // NewJobApplication
  7: (n) => n.link, // CompanyFavorited
  8: (n) => n.link, // JobFavorited
  9: (n) => n.link, // TryMatchUpdate
  10: (n) => n.link, // ApplicationStatusUpdate
};

export function getNotificationDetailUrl(notification) {
  const fn = notificationTypeToUrl[notification.type] || (() => "/notifications");
  return fn(notification);
}

export default notificationService; 