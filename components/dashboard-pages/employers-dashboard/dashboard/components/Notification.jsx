import { useState, useEffect } from "react";
import notificationService from "@/services/notification.service";

const Notification = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách job sắp bắt đầu
  const fetchUpcomingJobs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getUpcomingJobAlerts();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUpcomingJobs();
  }, []);

  if (loading) {
    return <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Upcoming Job Starts</div>
      {jobs.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center' }}>No jobs are about to start.</div>
      ) : (
        <ul className="notification-list">
          {jobs.map((job) => (
            <li key={job.jobId || job.id}>
              <span className="icon flaticon-briefcase"></span>
              <strong className="notification-job-title" title={job.title}>{job.title}</strong>
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
