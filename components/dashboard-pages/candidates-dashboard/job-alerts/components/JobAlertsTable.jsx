'use client';

import Link from "next/link.js";
import { useEffect, useState } from "react";

const JobAlertsTable = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Lấy tối đa 1000 thông báo, tuỳ backend hỗ trợ
        const res = await fetch("/api/notification?page=1&pageSize=1000", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>Notification</h4>
      </div>
      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Content</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{textAlign:'center'}}>Loading...</td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign:'center'}}>No notifications</td></tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.notificationId} style={{
                    fontWeight: n.isRead ? 400 : 600,
                    color: n.isRead ? '#aaa' : '#222',
                    opacity: n.isRead ? 0.7 : 1,
                    background: n.isRead ? '#fff' : '#f1f6fd',
                  }}>
                    <td>{n.title}</td>
                    <td>{n.message}</td>
                    <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</td>
                    <td>
                      {n.link ? (
                        <Link href={n.link} legacyBehavior>
                          <a style={{ color: '#1967d2', fontWeight: 500 }}>See details</a>
                        </Link>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobAlertsTable;
