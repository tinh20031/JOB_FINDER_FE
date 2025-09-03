'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import notificationService, { getNotificationDetailUrl } from "@/services/notification.service";

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7); // Nếu backend trả về UTC
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  return date.toLocaleDateString("en-US");
}

const AlertDataTable = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchNotifications();
  }, []);

  return (
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Time</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td></tr>
        ) : notifications.length === 0 ? (
          <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>No notifications.</td></tr>
        ) : (
          notifications.map((n, idx) => (
            <tr key={n.notificationId || n.id || idx} style={{ background: n.isRead ? '#fff' : '#f1f6fd' }}>
              <td>{n.title}</td>
              <td>{n.createdAt ? timeAgo(n.createdAt) : ""}</td>
              <td>
                <div className="option-box">
                  <ul className="option-list">
                    <li>
                      <Link href={getNotificationDetailUrl(n)} target="_blank">
                        <button data-text="View Notification" title="View Notification">
                          <span className="la la-eye"></span>
                        </button>
                      </Link>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AlertDataTable;
