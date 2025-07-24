'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import notificationService from "@/services/notification.service";

const AlertDataTable = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getUpcomingJobAlerts();
        setJobs(Array.isArray(data) ? data : []);
      } catch {
        setJobs([]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Days Remaining</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td></tr>
        ) : jobs.length === 0 ? (
          <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>No jobs are about to start.</td></tr>
        ) : (
          jobs.map((job, idx) => (
            <tr key={job.jobId || job.title || idx}>
              <td>{job.link ? (
                <Link href={job.link} target="_blank"><strong>{job.title}</strong></Link>
              ) : (
                <strong>{job.title}</strong>
              )}</td>
              <td style={{ color: '#1967d2' }}>
                {job.daysRemaining !== undefined ? (
                  <>
                    {job.daysRemaining} {job.daysRemaining === 1 ? "day" : "days"}
                  </>
                ) : '-'}
              </td>
              <td>
                {job.link ? <Link href={job.link} style={{ color: '#1967d2' }} target="_blank">View</Link> : ''}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AlertDataTable;
