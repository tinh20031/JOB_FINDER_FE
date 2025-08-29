"use client";


import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applicationService } from "@/services/applicationService";


const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');


  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getJobApplicants(jobId);
        setApplicants(response);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };


    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);


  if (loading) {
    return <div className="text-center py-5">Loading applicants...</div>;
  }


  if (!jobId) {
    return <div className="text-center py-5">No job selected</div>;
  }


  if (applicants.length === 0) {
    return <div className="text-center py-5">No applicants found for this job</div>;
  }


  return (
    <div className="applicants-list">
      {applicants.map((applicant) => (
        <div key={applicant.id} className="applicant-card">
          <div className="applicant-header">
            <div className="applicant-info">
              <h4>{applicant.user?.fullName || 'Anonymous'}</h4>
              <p>Applied: {new Date(applicant.submittedAt).toLocaleDateString()}</p>
            </div>
            <div className="applicant-status">
              <span className={`status-badge status-${typeof applicant.status === 'string' ? applicant.status.toLowerCase() : applicant.status || ''}`}>
                {applicant.status}
              </span>
            </div>
          </div>
          <div className="applicant-details">
            <div className="cover-letter">
              <h5>Cover Letter:</h5>
              <p>{applicant.coverLetter}</p>
            </div>
            <div className="cv-link">
              <a
                href={applicant.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                View CV
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default Applicants;