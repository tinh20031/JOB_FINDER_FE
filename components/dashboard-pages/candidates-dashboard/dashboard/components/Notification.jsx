import { useEffect, useState } from "react";
import notificationService, { getNotificationDetailUrl } from "../../../../../services/notification.service";
import notificationHubService from "../../../../../services/notificationHub";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách notification
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllNotifications(1, 20, null);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Lắng nghe real-time notification từ SignalR
    const handleReceiveNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    notificationHubService.on && notificationHubService.on('ReceiveNotification', handleReceiveNotification);
    return () => {
      notificationHubService.off && notificationHubService.off('ReceiveNotification', handleReceiveNotification);
    };
  }, []);

  // Định dạng ngày/giờ: HH:mm dd/MM/yyyy theo giờ Việt Nam
  const formatDateVN = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
  };

  if (loading) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <ul className="notification-list">
      {notifications.length === 0 && <li>No notifications yet.</li>}
      {notifications.map((n, idx) => (
        <li key={n.notificationId || n.id || idx} className={n.status === "Completed" ? "success" : n.status === "Failed" ? "error" : ""}>
          <a href={getNotificationDetailUrl(n)} style={{ textDecoration: 'none', color: '#1967d2' }}>
            <span className="icon flaticon-briefcase"></span>
            <strong>{n.title}</strong>
          </a>
          {n.createdAt && (
            <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
              {formatDateVN(n.createdAt)}
            </span>
          )}
          {!n.isRead && <span style={{ color: '#d32f2f', marginLeft: 8 }}>(new)</span>}
        </li>
      ))}
    </ul>
  );
};

export default Notification;
