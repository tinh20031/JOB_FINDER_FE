import { useState, useEffect } from "react";
import notificationHubService from "@/services/notificationHub";

const Notification = () => {
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm fetch danh sách job sắp start
  const fetchUpcomingJobs = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch("/api/job/notify-upcoming-start-new", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      setUpcomingJobs(Array.isArray(data) ? data : (data.jobs || data.notifications || []));
    } catch {
      setUpcomingJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUpcomingJobs();
    // Lắng nghe real-time notification từ SignalR
    const handleReceiveNotification = (notification) => {
      if (notification.type === 'UpcomingStart') {
        fetchUpcomingJobs();
      }
    };
    notificationHubService.on && notificationHubService.on('ReceiveNotification', handleReceiveNotification);
    return () => {
      notificationHubService.off && notificationHubService.off('ReceiveNotification', handleReceiveNotification);
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Upcoming Job Starts</div>
      {upcomingJobs.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center' }}>No jobs are about to start.</div>
      ) : (
        <ul className="notification-list">
          {upcomingJobs.map((job) => (
            <li key={job.id || job.jobId}>
              <span className="icon flaticon-briefcase"></span>
              <strong className="notification-job-title" title={job.title || job.jobTitle}>{job.title || job.jobTitle}</strong>
              {job.daysRemaining !== undefined && (
                <span style={{ marginLeft: 8, color: '#1967d2' }}>
                  will start in <b>{job.daysRemaining}</b> days
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Notification;
