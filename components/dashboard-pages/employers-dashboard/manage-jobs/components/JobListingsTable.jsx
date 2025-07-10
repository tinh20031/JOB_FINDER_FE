"use client";

import Link from "next/link";
import Image from "next/image.js";
import { useEffect, useState } from "react";
import { jobService } from "../../../../../services/jobService";
import { useRouter } from "next/navigation";
import "./JobListingsTable.css";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from 'framer-motion';
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";

const JobListingsTable = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [lockLoadingId, setLockLoadingId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusJob, setPendingStatusJob] = useState(null);
  const [pendingNewStatus, setPendingNewStatus] = useState(null);
  const [appliedCounts, setAppliedCounts] = useState({});
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [pendingActivateJob, setPendingActivateJob] = useState(null);
  const userRole = (typeof window !== 'undefined' && (localStorage.getItem('role') || Cookies?.get?.('role') || ''))?.toLowerCase();

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

        console.log('Raw jobs data from API:', jobsResponse.data);

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

  const handleViewJob = (jobId) => {
    router.push(`/job-single-v3/${jobId}`);
  };

  const formatDateVN = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  const handleEditClick = (job) => {
    router.push(`/dashboard/employers-dashboard/edit-job/${job.id}`);
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

  // Lock/Unlock (admin)
  const handleLockJob = async (job) => {
    setLockLoadingId(job.id);
    try {
      await jobService.lockJob(job.id, !job.deactivatedByAdmin);
      const jobsResponse = await jobService.getJobs({ role: 'company', companyId: currentUserId });
      setJobs(jobsResponse.data);
    } catch (err) {
      alert('Failed to lock/unlock: ' + (err?.response?.data || err.message));
    } finally {
      setLockLoadingId(null);
    }
  };

  const handleRequestChangeStatus = (job, newStatus) => {
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
    if (job.deactivatedByAdmin) return "Locked";
    if (job.status === 0) return "Pending";
    if (job.status === 1) {
      if (new Date(job.timeStart) > now) return "Not Started";
      if (new Date(job.timeEnd) < now) return "Expired";
      return "Active";
    }
    if (job.status === 2) {
      if (new Date(job.timeEnd) < now) return "Expired";
      if (new Date(job.timeStart) > now && !job.deactivatedByAdmin) return "Cancelled";
      return "Inactive";
    }
    return "Unknown";
  }

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

          <div className="chosen-outer">
            {/* <!--Tabs Box--> */}
            <select className="chosen-single form-select">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>Last 16 Months</option>
              <option>Last 24 Months</option>
              <option>Last 5 year</option>
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
                {jobs.map((job) => {
                  const isPending = job.status === 0;
                  const isExpired = new Date(job.timeEnd) < new Date();
                  const isLocked = job.deactivatedByAdmin;
                  const disableStatusButton = isPending || isExpired || isLocked;
                  const isActive = job.status === 1;
                  const canViewDetail = isActive || isExpired;
                  return (
                    <tr key={job.id}>
                      <td>
                        {/* <!-- Job Block --> */}
                        <div className="job-block">
                          <div className="inner-box">
                            <div className="content">
                              <h4>
                                <Link href={`/job-single-v3/${job.id}`}>
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
                        <Link href={`/employers-dashboard/all-applicants?jobId=${job.id}`}>
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
                        <span className={`status-${getCompanyJobStatus(job).toLowerCase().replace(/[^a-z]/g, '-')}`}>{getCompanyJobStatus(job)}</span>
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
                                      handleRequestChangeStatus(job, job.status === 1 ? 'inactive' : 'active');
                                    }
                                  }}
                                  data-text={job.status === 1 ? 'Deactivate' : 'Activate'}
                                >
                                  {statusLoadingId === job.id ? (
                                    <span className="la la-spinner fa-spin"></span>
                                  ) : job.status === 1 ? (
                                    <span className="la la-toggle-off"></span>
                                  ) : (
                                    <span className="la la-toggle-on"></span>
                                  )}
                                </button>
                              </li>
                            )}
                            {/* Admin: dropdown đổi status + lock/unlock */}
                            {userRole === 'admin' && (
                              <>
                                <li>
                                  <select
                                    value={job.status}
                                    disabled={statusLoadingId === job.id}
                                    onChange={e => handleChangeStatus(job, e.target.value)}
                                    style={{ minWidth: 90 }}
                                  >
                                    <option value={0}>Pending</option>
                                    <option value={1}>Active</option>
                                    <option value={2}>Inactive</option>
                                  </select>
                                </li>
                                <li>
                                  <button
                                    disabled={lockLoadingId === job.id}
                                    onClick={() => handleLockJob(job)}
                                    data-text={job.deactivatedByAdmin ? 'Unlock' : 'Lock'}
                                  >
                                    {lockLoadingId === job.id ? (
                                      <span className="la la-spinner fa-spin"></span>
                                    ) : job.deactivatedByAdmin ? (
                                      <span className="la la-unlock"></span>
                                    ) : (
                                      <span className="la la-lock"></span>
                                    )}
                                  </button>
                                </li>
                              </>
                            )}
                            <li>
                              <button
                                onClick={() => router.push(`/employers-dashboard/clone-job/${job.id}`)}
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
              </tbody>
            </table>
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
      `}</style>
    </>
  );
};

export default JobListingsTable;
