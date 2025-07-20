import { useEffect, useState } from "react";
import notificationHubService from "../../../../../services/notificationHub";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let token = null;
    let userId = null;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token || user.accessToken;
          userId = user.id || user.userId;
        } catch {}
      }
    }
    if (!token || !userId) return;

    notificationHubService.start(token, userId, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      // Có thể show toast ở đây nếu muốn
    });

    return () => {
      notificationHubService.stop();
    };
  }, []);

  return (
    <ul className="notification-list">
      {notifications.length === 0 && <li>No notifications yet.</li>}
      {notifications.map((n, idx) => (
        <li key={n.id || idx} className={n.status === "Completed" ? "success" : n.status === "Failed" ? "error" : ""}>
        <span className="icon flaticon-briefcase"></span>
          <strong>{n.title}</strong>
          <span className="colored"> {n.message}</span>
          {n.createdAt && (
            <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
              {new Date(n.createdAt).toLocaleString()}
            </span>
          )}
      </li>
      ))}
    </ul>
  );
};

export default Notification;
