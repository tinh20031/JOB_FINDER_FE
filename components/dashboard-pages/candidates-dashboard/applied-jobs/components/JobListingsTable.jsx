'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { applicationService } from "@/services/applicationService";
import { jobService } from "@/services/jobService";
import "../../../employers-dashboard/manage-jobs/components/JobListingsTable.css";

const JobListingsTable = () => {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState({});

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getAppliedJobs();
        setApplications(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching applied jobs:', err);
        setError('Failed to fetch applied jobs');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, []);

  // Group applications by jobId
  useEffect(() => {
    const grouped = {};
    applications.forEach(app => {
      const jobId = app.job.jobId;
      if (!grouped[jobId]) {
        grouped[jobId] = {
          job: app.job,
          count: 1,
          applications: [app],
        };
      } else {
        grouped[jobId].count += 1;
        grouped[jobId].applications.push(app);
      }
    });
    let jobsArr = Object.values(grouped);
    if (searchTerm) {
      jobsArr = jobsArr.filter(item =>
        item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.job.addressDetail && item.job.addressDetail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.job.provinceName && item.job.provinceName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredJobs(jobsArr);
  }, [applications, searchTerm]);

  // Fetch job details if missing company name
  useEffect(() => {
    const fetchMissingJobDetails = async () => {
      const missingJobIds = filteredJobs
        .map(item => item.job.jobId)
        .filter(jobId => !jobDetails[jobId]);
      const uniqueJobIds = [...new Set(missingJobIds)];
      for (const jobId of uniqueJobIds) {
        try {
          const detail = await jobService.getJobById(jobId);
          setJobDetails(prev => ({ ...prev, [jobId]: detail }));
        } catch (e) { /* ignore */ }
      }
    };
    if (filteredJobs.length > 0) fetchMissingJobDetails();
    // eslint-disable-next-line
  }, [filteredJobs]);

  const handleJobClick = (jobId) => {
    router.push(`/job-single-v3/${jobId}`);
  };

  const TableSkeleton = () => (
    <div className="table-outer">
      <table className="default-table manage-job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Applicants</th>
            <th>Created & Expired</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={idx}>
              <td>
                <div className="skeleton-line long" style={{ height: 18, marginBottom: 8, borderRadius: 6 }}></div>
                <div className="skeleton-line medium" style={{ height: 14, width: '60%', borderRadius: 6 }}></div>
              </td>
              <td><div className="skeleton-line medium" style={{ height: 16, borderRadius: 6 }}></div></td>
              <td><div className="skeleton-line short" style={{ height: 16, borderRadius: 6 }}></div></td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
        }
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Job Listings</h4>
        <div className="chosen-outer">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>
      <div className="widget-content">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div>You haven't applied for any jobs.</div>
        ) : (
          <div className="table-outer">
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Applicants</th>
                  <th>Created & Expired</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(item => {
                  const job = item.job;
                  const detail = jobDetails[job.jobId];
                  const companyName = job.Company?.CompanyName || detail?.company?.companyName || "";
                  return (
                    <tr key={job.jobId}>
                      <td>
                        <div style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => handleJobClick(job.jobId)}>
                          {job.title}
                        </div>
                        <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                          <span style={{ marginRight: 12 }}><span className="icon flaticon-briefcase"></span> {companyName}</span>
                          <span>
                            <span className="icon flaticon-map-locator"></span>
                            {[job.addressDetail, job.provinceName].filter(Boolean).join(', ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link href="#" style={{ color: '#1967d2', fontWeight: 500, textDecoration: 'underline' }} onClick={e => { e.preventDefault(); router.push(`/candidates-dashboard/applied-jobs/${job.jobId}`); }}>{item.count} Applied</Link>
                      </td>
                      <td>
                        {job.timeStart ? new Date(job.timeStart).toLocaleDateString() : ''}
                        {job.timeStart && job.timeEnd ? ' - ' : ''}
                        {job.timeEnd ? new Date(job.timeEnd).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingsTable;

