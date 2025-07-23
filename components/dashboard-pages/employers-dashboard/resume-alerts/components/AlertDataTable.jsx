'use client';
import { useEffect, useState } from "react";
import Link from "next/link";

const AlertDataTable = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("/api/notification?page=1&pageSize=1000", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  // Định dạng ngày/giờ: HH:mm dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
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

  // Hàm hiển thị thời gian kiểu 'x phút trước', 'x giờ trước', ... (tiếng Anh, giờ VN)
  function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    // Luôn cộng 7 tiếng để chuyển sang giờ Việt Nam
    date.setHours(date.getHours() + 7);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    return date.toLocaleDateString("en-US");
  }

  return (
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Content</th>
          <th>Notification Time</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
        ) : notifications.length === 0 ? (
          <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No notifications</td></tr>
        ) : (
          notifications.map((n) => (
            <tr key={n.notificationId} style={{
              fontWeight: n.isRead ? 400 : 600,
              color: n.isRead ? '#aaa' : '#222',
              background: n.isRead ? '#fff' : '#f1f6fd',
              opacity: n.isRead ? 0.7 : 1,
            }}>
              <td>{n.title}</td>
              <td>{n.message}</td>
              <td>{n.createdAt ? timeAgo(n.createdAt) : ''}</td>
              <td>
                {n.link ? <Link href={n.link} style={{ color: '#1967d2' }} target="_blank">View</Link> : ''}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AlertDataTable;
