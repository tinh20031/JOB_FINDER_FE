"use client";

import Link from "next/link";
import Image from "next/image.js";
import { useEffect, useState } from "react";
import { jobService } from "../../../../../services/jobService";
import { applicationService } from "../../../../../services/applicationService";
import { useRouter, useSearchParams } from "next/navigation";
import "./JobListingsTable.css";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from 'framer-motion';
import Modal from "@/components/common/Modal";
import PendingApplicationsModal from "@/components/common/PendingApplicationsModal";
import "@/styles/modal.css";

const JobListingsTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  // Removed lockLoadingId state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusJob, setPendingStatusJob] = useState(null);
  const [pendingNewStatus, setPendingNewStatus] = useState(null);
  const [appliedCounts, setAppliedCounts] = useState({});
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [pendingActivateJob, setPendingActivateJob] = useState(null);
  const [showPendingAppsModal, setShowPendingAppsModal] = useState(false);
  const [pendingAppsJob, setPendingAppsJob] = useState(null);
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const userRole = (typeof window !== 'undefined' && (localStorage.getItem('role') || Cookies?.get?.('role') || ''))?.toLowerCase();
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [searchTitle, setSearchTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        setCurrentUserId(userId);

        // Fetch all required data in parallel
        const [
          jobsResponse,
          companiesResponse,
        ] = await Promise.all([
          jobService.getJobs({ role: 'company', companyId: userId }),
          jobService.getCompanies(),
        ]);

        // Không cần filter lại ở FE nữa
        setJobs(jobsResponse.data);

        // Set companies data
        const companiesMap = companiesResponse.reduce((acc, company) => {
          acc[company.id] = company.name;
          return acc;
        }, {});
        setCompanies(companiesMap);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      for (const job of jobs) {
        counts[job.id] = await jobService.getAppliedCount(job.id);
      }
      setAppliedCounts(counts);
    };
    if (jobs && jobs.length > 0) fetchCounts();
  }, [jobs]);

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

  const handleViewJob = (jobId) => {
            router.push(`/job-detail/${jobId}`);
  };

  const formatDateVN = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  const handleEditClick = (job) => {
            router.push(`/dashboard/company-dashboard/edit-job/${job.id}`);
  };

  // Đổi status (company hoặc admin)
  const handleChangeStatus = async (job, newStatus) => {
    setStatusLoadingId(job.id);
    try {
      await jobService.updateJobStatus(job.id, newStatus);
      // Sau khi đổi status, reload lại jobs
      const jobsResponse = await jobService.getJobs({ role: 'company', companyId: currentUserId });
      setJobs(jobsResponse.data);
    } catch (err) {
      alert('Failed to update status: ' + (err?.response?.data || err.message));
    } finally {
      setStatusLoadingId(null);
    }
  };

  // Removed handleLockJob function

  const handleRequestChangeStatus = async (job, newStatus) => {
    // Nếu là deactivate job, kiểm tra pending applications
    if (newStatus === 'inactive') {
      try {
        const pendingAppsResult = await applicationService.checkPendingApplications(job.id);
        
        if (pendingAppsResult.hasPendingApplications) {
          // Có pending applications, hiển thị popup thông báo
          setPendingAppsJob(job);
          setPendingAppsCount(pendingAppsResult.pendingCount);
          setShowPendingAppsModal(true);
          return;
        }
      } catch (error) {
        console.error('Error checking pending applications:', error);
        // Nếu có lỗi khi check, vẫn tiếp tục với flow bình thường
      }
    }
    
    // Flow bình thường (không có pending apps hoặc không phải deactivate)
    setPendingStatusJob(job);
    setPendingNewStatus(newStatus);
    setShowStatusModal(true);
  };

  const handleConfirmChangeStatus = async () => {
    if (pendingStatusJob && pendingNewStatus) {
      await handleChangeStatus(pendingStatusJob, pendingNewStatus);
      setShowStatusModal(false);
      setPendingStatusJob(null);
      setPendingNewStatus(null);
    }
  };

  const handleCancelChangeStatus = () => {
    setShowStatusModal(false);
    setPendingStatusJob(null);
    setPendingNewStatus(null);
  };

  // Handle khi user chọn "Yes, see applications"
  const handleViewPendingApplications = () => {
    if (pendingAppsJob) {
      // Navigate to all applications page của job đó
              router.push(`/company-dashboard/all-applicants?jobId=${pendingAppsJob.id}`);
    }
    setShowPendingAppsModal(false);
    setPendingAppsJob(null);
    setPendingAppsCount(0);
  };

  // Handle khi user chọn "Không" - chỉ tắt popup, không deactivate
  const handleProceedDeactivateAnyway = () => {
    setShowPendingAppsModal(false);
    setPendingAppsJob(null);
    setPendingAppsCount(0);
    // Không làm gì thêm - chỉ tắt popup
  };

  // Handle đóng pending apps modal
  const handleClosePendingAppsModal = () => {
    setShowPendingAppsModal(false);
    setPendingAppsJob(null);
    setPendingAppsCount(0);
  };

  const now = new Date();
  const isBeforeStart = (job) => new Date(job.timeStart) > now;

  // Animation variants cho modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  // Skeleton loader for table
  const TableSkeleton = () => (
    <div className="table-outer">
      <table className="default-table manage-job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Applicants</th>
            <th>Created & Expired</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={idx}>
              <td><div className="skeleton-line long"></div></td>
              <td><div className="skeleton-line medium"></div></td>
              <td><div className="skeleton-line short"></div></td>
              <td><div className="skeleton-line short"></div></td>
              <td><div className="skeleton-line medium"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Hàm xác định trạng thái hiển thị cho công ty
  function getCompanyJobStatus(job) {
    const now = new Date();
    
    // Kiểm tra trạng thái lock trước
    if (job.deactivatedByAdmin) {
      return 'Locked';
    }
    
    // Nếu không bị lock, hiển thị trạng thái bình thường
    if (job.status === 1) {
      // Pending luôn hiển thị Pending theo yêu cầu
      return "Pending";
    }
    if (job.status === 2) {
      if (new Date(job.timeStart) > now) return "Not Started";
      if (new Date(job.timeEnd) < now) return "Expired";
      return "Active";
    }
    if (job.status === 3) {
      if (new Date(job.timeEnd) < now) return "Expired";
      return "Inactive";
    }
    if (job.status === 4) {
      return "Rejected";
    }
    return "Unknown";
  }

  // Hàm tạo CSS class name cho trạng thái
  function getStatusClassName(job) {
    const now = new Date();
    
    // Kiểm tra trạng thái lock trước
    if (job.deactivatedByAdmin) {
      // Locked
      return 'status-locked';
    }
    
    // Nếu không bị lock, tạo class name bình thường
    if (job.status === 1) return 'status-pending';
    if (job.status === 2) {
      if (new Date(job.timeStart) > now) return 'status-not-started';
      if (new Date(job.timeEnd) < now) return 'status-expired';
      return 'status-active';
    }
    if (job.status === 3) {
      if (new Date(job.timeEnd) < now) return 'status-expired';
      return 'status-inactive';
    }
    if (job.status === 4) {
      return 'status-rejected';
    }
    return 'status-unknown';
  }

  // Filter jobs theo trạng thái, thời gian, tên job
  const filteredJobs = jobs.filter(job => {
    // Filter trạng thái
    if (filterStatus !== 'all') {
      const status = getCompanyJobStatus(job).toLowerCase();
      const filterStatusLower = filterStatus.toLowerCase();
      
      // Xử lý filter cho trạng thái locked
      if (filterStatusLower === 'locked') {
        if (!job.deactivatedByAdmin) return false;
      } else {
        // Nếu filter không phải 'locked', kiểm tra trạng thái cơ bản
        if (job.deactivatedByAdmin) {
          // Nếu job bị lock, lấy trạng thái cơ bản (bỏ phần "(Locked)")
          const baseStatus = status.replace(' (locked)', '').toLowerCase();
          if (baseStatus !== filterStatusLower) return false;
        } else {
          if (status !== filterStatusLower) return false;
        }
      }
    }
    // Filter theo tên job
    if (searchTitle.trim() && !job.jobTitle.toLowerCase().includes(searchTitle.trim().toLowerCase())) {
      return false;
    }
    // Filter theo thời gian
    if (filterTime !== 'all') {
      const now = new Date();
      const created = new Date(job.timeStart);
      let diff = (now - created) / (1000 * 60 * 60 * 24); // số ngày
      if (filterTime === '7d' && diff > 7) return false;
      if (filterTime === '30d' && diff > 30) return false;
      if (filterTime === '6m' && diff > 183) return false;
      if (filterTime === '12m' && diff > 365) return false;
      if (filterTime === '5y' && diff > 1825) return false;
    }
    return true;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

  if (loading) {
    return <TableSkeleton />;
  }

  if (!currentUserId) {
    return <div>Please login to view your jobs</div>;
  }

  return (
    <>
      <div className="tabs-box">
        <div className="widget-title">
          <h4>My Job Listings</h4>
          <div className="chosen-outer" style={{display:'flex', alignItems:'center', gap:8}}>
            {/* Search job title bên trái cùng */}
            <input
              type="text"
              className="job-search-input"
              placeholder="Search job title..."
              value={searchTitle}
              onChange={e=>{setSearchTitle(e.target.value); setCurrentPage(1);}}
              style={{minWidth:180, maxWidth:220}}
            />
            {/* Filter theo trạng thái */}
            <select className="chosen-single form-select" value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setCurrentPage(1);}}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
               <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="locked">Locked</option>
              <option value="not started">Not Started</option>
            </select>
            {/* Filter theo thời gian */}
            <select className="chosen-single form-select" value={filterTime} onChange={e=>{setFilterTime(e.target.value); setCurrentPage(1);}}>
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="5y">Last 5 years</option>
            </select>
          </div>
        </div>
        {/* End filter top bar */}
        {/* Start table widget content */}
        <div className="widget-content">
          <div className="table-outer">
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Applicants</th>
                  <th>Created & Expired</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => {
    const isPending = job.status === 1;
    const isExpired = new Date(job.timeEnd) < new Date();
     const isInactiveByAdmin = job.status === 4; // INACTIVEBYADMIN
    const isLocked = job.deactivatedByAdmin;
     const disableStatusButton = isPending || isExpired || isInactiveByAdmin || isLocked;
    const isActive = job.status === 2;
                  const canViewDetail = isActive || isExpired;
                  return (
                    <tr key={job.id}>
                      <td>
                        {/* <!-- Job Block --> */}
                        <div className="job-block">
                          <div className="inner-box">
                            <div className="content">
                              <h4>
                                <Link href={`/job-detail/${job.id}`}>
                                  {job.jobTitle}
                                </Link>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span>
                                  {companies[job.companyId] || 'Unknown Company'}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span>
                                  {job.location}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="applied">
                        <Link href={`/company-dashboard/all-applicants?jobId=${job.id}`}>
                          {appliedCounts[job.id] === undefined
                            ? <span className="skeleton skeleton-applied" style={{ width: 30, height: 16, display: 'inline-block', verticalAlign: 'middle' }} />
                            : appliedCounts[job.id] === 0
                              ? 'No Applied'
                              : appliedCounts[job.id] > 9
                                ? '9+ Applied'
                                : `${appliedCounts[job.id]} Applied`}
                        </Link>
                      </td>
                      <td>
                        {formatDateVN(job.timeStart)} <br />
                        {formatDateVN(job.timeEnd)}
                      </td>
                      <td className="status">
                        <span className={getStatusClassName(job)}>{getCompanyJobStatus(job)}</span>
                      </td>
                      <td>
                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button
                                disabled={!canViewDetail}
                                style={!canViewDetail ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                onClick={canViewDetail ? () => handleViewJob(job.id) : undefined}
                                data-text="View Job"
                              >
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={() => handleEditClick(job)}
                                data-text="Edit Job"
                              >
                                <span className="la la-pencil"></span>
                              </button>
                            </li>
                            {userRole === 'company' && (
                              <li>
                                <button
                                  disabled={disableStatusButton || statusLoadingId === job.id}
                                  style={disableStatusButton ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                  onClick={() => {
                                    if (job.status !== 1 && isBeforeStart(job)) {
                                      setPendingActivateJob(job);
                                      setShowStartDateModal(true);
                                    } else {
                                      // Chỉ cho phép toggle giữa active và inactive (không phải inactivebyadmin)
                                      if (job.status === 2) {
                                        handleRequestChangeStatus(job, 'inactive');
                                      } else if (job.status === 3) {
                                        handleRequestChangeStatus(job, 'active');
                                      }
                                    }
                                  }}
                                  data-text={job.status === 2 ? 'Deactivate' : 'Activate'}
                                >
                                  {statusLoadingId === job.id ? (
                                    <span className="la la-spinner fa-spin"></span>
                                  ) : job.status === 2 ? (
                                    <span className="la la-toggle-off"></span>
                                  ) : (
                                    <span className="la la-toggle-on"></span>
                                  )}
                                </button>
                              </li>
                            )}
                                                         {/* Admin: dropdown đổi status */}
                            {userRole === 'admin' && (
                                <li>
                                  <select
                                    value={job.status}
                                    disabled={statusLoadingId === job.id}
                                    onChange={e => handleChangeStatus(job, e.target.value)}
                                    style={{ minWidth: 90 }}
                                  >
                                      <option value={1}>Pending</option>
                                      <option value={2}>Active</option>
                                      <option value={3}>Inactive</option>
                                     <option value={4}>Rejected</option>
                                  </select>
                                </li>
                            )}
                            <li>
                              <button
                                onClick={() => router.push(`/company-dashboard/clone-job/${job.id}`)}
                                data-text="Clone Job"
                              >
                                <span className="la la-copy"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedJobs.length === 0 && (
                  <tr><td colSpan={5}>No jobs found</td></tr>
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
        </div>
        {/* End table widget content */}
      </div>

      {/* Modal xác nhận đổi status */}
      <Modal
        open={showStatusModal}
        onClose={handleCancelChangeStatus}
        title="Confirm Status Change"
        footer={
          <>
            <button className="btn-cancel" onClick={handleCancelChangeStatus}>Cancel</button>
            <button className="btn-confirm" onClick={handleConfirmChangeStatus}>Confirm</button>
          </>
        }
      >
        <p>
          Are you sure you want to <b>{pendingNewStatus === 'active' ? 'activate' : 'deactivate'}</b> the job <b>{pendingStatusJob?.jobTitle}</b>?
        </p>
      </Modal>

      <Modal
        open={showStartDateModal}
        onClose={() => setShowStartDateModal(false)}
        title="Cannot Activate Job"
        footer={
          <button className="btn-confirm" onClick={() => setShowStartDateModal(false)}>OK</button>
        }
      >
        <p>
          The job <b>{pendingActivateJob?.jobTitle}</b> cannot be activated before its start date (<b>{formatDateVN(pendingActivateJob?.timeStart)}</b>).<br/>
          You can only activate this job on or after its start date.
        </p>
      </Modal>

      {/* Pending Applications Modal */}
      <PendingApplicationsModal
        open={showPendingAppsModal}
        onClose={handleClosePendingAppsModal}
        onViewApplications={handleViewPendingApplications}
        onProceedAnyway={handleProceedDeactivateAnyway}
        jobTitle={pendingAppsJob?.jobTitle}
        pendingCount={pendingAppsCount}
      />

      <style jsx>{`
        .skeleton-applied {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
          border-radius: 6px;
          height: 16px;
          width: 30px;
          display: inline-block;
          vertical-align: middle;
        }
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
        .status-scheduled--not-started { color: #f0ad4e; font-weight: bold; }
        .status-locked { color: #d9534f; font-weight: bold; }
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
    </>
  );
};

export default JobListingsTable;
