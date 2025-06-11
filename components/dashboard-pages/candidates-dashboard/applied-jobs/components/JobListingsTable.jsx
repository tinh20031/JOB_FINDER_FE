'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { applicationService } from "@/services/applicationService";

const JobListingsTable = () => {
  const router = useRouter();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from token
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.unique_name); // unique_name contains the user ID
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Failed to authenticate user');
      }
    } else {
      setError('No authentication token found');
    }
  }, []);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getAppliedJobs();
        setAppliedJobs(response);
        setFilteredJobs(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching applied jobs:', err);
        setError('Failed to fetch applied jobs');
        setAppliedJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchAppliedJobs();
    }
  }, [currentUserId]);

  useEffect(() => {
    // Filter jobs based on search term and status
    let filtered = appliedJobs;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.addressDetail && job.addressDetail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.provinceName && job.provinceName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(job => 
        job.appliedCvs.some(cv => cv.status === parseInt(selectedStatus) && cv.userId === parseInt(currentUserId))
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedStatus, appliedJobs, currentUserId]);

  const handleJobClick = (jobId) => {
    router.push(`/job-single-v3/${jobId}`);
  };

  const toggleJobExpansion = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Accepted";
      case 2: return "Rejected";
      default: return "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return "status-pending";
      case 1: return "status-accepted";
      case 2: return "status-rejected";
      default: return "";
    }
  };

  // Filter CVs for current user
  const getUserCvs = (cvs) => {
    return cvs.filter(cv => cv.userId === parseInt(currentUserId));
  };

  if (error && error.includes('authentication')) {
    return (
      <div className="alert alert-danger">
        {error}
        <br />
        Please <Link href="/login">login</Link> to view your applied jobs.
      </div>
    );
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>

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
          <select 
            className="chosen-single form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
          </select>
        </div>
      </div>

      <div className="widget-content">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div>No jobs found.</div>
        ) : (
          <div className="table-outer">
            {filteredJobs.map((job) => {
              const userCvs = getUserCvs(job.appliedCvs);
              if (userCvs.length === 0) return null; // Skip jobs where user hasn't applied

              return (
                <div key={job.jobId} className="job-card">
                  <div 
                    className="job-header"
                    onClick={() => toggleJobExpansion(job.jobId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="job-title" onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job.jobId);
                    }}>
                      {job.title}
                    </div>
                    <div className="job-info">
                      
                      <span>Location: {job.addressDetail || job.provinceName || "N/A"}</span>
                    </div>
                    <div className="expand-icon">
                      {expandedJobId === job.jobId ? "▼" : "▶"}
                    </div>
                  </div>

                  {expandedJobId === job.jobId && (
                    <div className="job-details">
                      <div className="description">
                        <h5>Description:</h5>
                     
                        <div dangerouslySetInnerHTML={{ __html: job.description }} />
                      </div>
                      
                      <div className="applied-cvs">
                        <h5>My Applied CVs:</h5>
                        <table className="default-table">
                          <thead>
                            <tr>
                              <th>Date Applied</th>
                              <th>Status</th>
                              <th>Cover Letter</th>
                              <th>CV</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userCvs.map((cv) => (
                              <tr key={cv.id}>
                                <td>{new Date(cv.submittedAt).toLocaleString()}</td>
                                <td>
                                  <span className={`status-badge ${getStatusClass(cv.status)}`}>
                                    {getStatusText(cv.status)}
                                  </span>
                                </td>
                                <td>{cv.coverLetter}</td>
                                <td>
                                  <a 
                                    href={cv.resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                  >
                                    View CV
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .job-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .job-header {
          padding: 16px;
          background-color: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .job-title {
          font-size: 18px;
          font-weight: 600;
          color: #1967d2;
        }

        .job-info {
          display: flex;
          gap: 16px;
        }

        .job-info span {
          color: #666;
        }

        .job-details {
          padding: 16px;
          background-color: white;
        }

        .description {
          margin-bottom: 16px;
        }

        .description h5 {
          margin-bottom: 8px;
          color: #333;
        }

        .applied-cvs {
          margin-top: 16px;
        }

        .applied-cvs h5 {
          margin-bottom: 8px;
          color: #333;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-accepted {
          background-color: #d4edda;
          color: #155724;
        }

        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .search-box {
          margin-right: 16px;
        }

        .search-box input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 200px;
        }

        .chosen-outer {
          display: flex;
          align-items: center;
        }

        .expand-icon {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default JobListingsTable;

