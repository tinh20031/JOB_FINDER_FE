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

  return (
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>Tiêu đề</th>
          <th>Nội dung</th>
          <th>Thời gian</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={4} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
        ) : notifications.length === 0 ? (
          <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>Không có thông báo nào</td></tr>
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
              <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</td>
              <td>
                {n.link ? <Link href={n.link} style={{ color: '#1967d2' }} target="_blank">Xem</Link> : ''}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AlertDataTable;
