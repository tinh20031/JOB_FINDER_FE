import React, { useEffect, useState } from "react";
import { jobService } from "@/services/jobService";

const JobDetailsDescriptions = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDescription = async () => {
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDescription();
    }
  }, [jobId]);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading job description...</p>
    </div>
  );
  
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!job) return null;

  return (
    <div className="job-detail">
      <h4>Job Description</h4>
      <div dangerouslySetInnerHTML={{ __html: job.description }} />
      
      <h4>Education Requirements</h4>
      <div dangerouslySetInnerHTML={{ __html: job.education }} />
    </div>
  );
};

export default JobDetailsDescriptions;
