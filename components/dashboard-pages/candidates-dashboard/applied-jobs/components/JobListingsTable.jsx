'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { applicationService } from "@/services/applicationService";
import { jobService } from "@/services/jobService";
import "../../../employers-dashboard/manage-jobs/components/JobListingsTable.css";

const JobListingsTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

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

  // Khi mount, đọc page từ query string
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Khi đổi trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

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
            router.push(`/job-detail/${jobId}`);
  };

  // Định dạng ngày/giờ: dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDateVN = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

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
        <h4>My Applied Jobs</h4>
        <div className="chosen-outer" style={{display:'flex', alignItems:'center', gap:8}}>
          <input
            type="text"
            className="job-search-input"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            style={{minWidth:180, maxWidth:220}}
          />
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
                  <th>Applications</th>
                  <th>Created & Expired</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map(item => {
                  const job = item.job;
                  const detail = jobDetails[job.jobId];
                  const companyName = job.Company?.CompanyName || detail?.company?.companyName || "";
                  return (
                    <tr
                      key={job.jobId}
                      onClick={() => handleJobClick(job.jobId)}
                      className="job-row"
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>
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
                        <Link href="#" style={{ color: '#1967d2', fontWeight: 500, textDecoration: 'underline' }} onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/candidates-dashboard/applied-jobs/${job.jobId}`); }}>{item.count} Applied</Link>
                      </td>
                      <td>
                        {job.timeStart ? formatDateVN(job.timeStart) : ''}
                        {job.timeStart && job.timeEnd ? ' - ' : ''}
                        {job.timeEnd ? formatDateVN(job.timeEnd) : ''}
                      </td>
                    </tr>
                  );
                })}
                {paginatedJobs.length === 0 && filteredJobs.length > 0 && (
                  <tr><td colSpan={3}>No jobs found on this page</td></tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination UI */}
            {filteredJobs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handleSetPage(currentPage - 1)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}
                >&#8592;</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleSetPage(i + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: currentPage === i + 1 ? '#1967d2' : 'none',
                      color: currentPage === i + 1 ? '#fff' : '#444',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 18,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: 'none',
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >{i + 1}</button>
                ))}
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handleSetPage(currentPage + 1)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}
                >&#8594;</button>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .manage-job-table tbody tr.job-row:hover {
            background: #f7fafd;
          }
        }
        @media (hover: none) and (pointer: coarse) {
          .manage-job-table tbody tr.job-row {
            cursor: pointer;
          }
        }
        .manage-job-table tbody tr.job-row td div[style*="font-weight: 600"]:hover {
          color: #2563eb;
        }
        .job-search-input {
          background: #f6f8fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          height: 44px;
          min-width: 180px;
          max-width: 220px;
          padding: 0 16px;
          font-size: 16px;
          color: #444;
          transition: background 0.2s, border 0.2s;
          outline: none;
          box-shadow: none;
          margin-right: 0;
          font-weight: 400;
        }
        .job-search-input:focus {
          background: #fff;
          border: 1.5px solid #1967d2;
          color: #222;
        }
      `}</style>
    </div>
  );
};

export default JobListingsTable;

