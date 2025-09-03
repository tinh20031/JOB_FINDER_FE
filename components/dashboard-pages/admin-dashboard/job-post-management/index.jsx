"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  addKeyword,
  addLocation,
  addCategory,
  clearJobType,
  addDatePosted,
  clearExperience,
  addSalary,
  addSort,
} from "../../../../features/filter/filterSlice";
import Image from "next/image";
import ApiService from "../../../../services/api.service";
import { authService } from "../../../../services/authService";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import MainHeader from "../../../header/MainHeader";
import MobileMenu from "../../../header/MobileMenu";
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobStatus, getJobStatusColor } from "../../../../utils/jobStatus";

// Skeleton component for job blocks
const JobSkeleton = () => (
  <div className="job-block skeleton-job">
    <div className="inner-box d-flex align-items-center justify-content-between">
      <div className="content">
        <div className="d-flex align-items-center gap-3">
          <div className="skeleton-logo" style={{
            width: 50,
            height: 49,
            borderRadius: '50%',
            backgroundColor: '#e9ecef',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}></div>
          <div className="flex-grow-1">
            <div className="skeleton-title" style={{
              height: 24,
              width: '60%',
              backgroundColor: '#e9ecef',
              borderRadius: 4,
              marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
            <div className="skeleton-info" style={{
              height: 16,
              width: '40%',
              backgroundColor: '#e9ecef',
              borderRadius: 4,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      </div>
      <div className="job-actions d-flex flex-row align-items-center gap-2 ms-3">
        <div className="skeleton-select" style={{
          width: 150,
          height: 38,
          backgroundColor: '#e9ecef',
          borderRadius: 4,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
        <div className="skeleton-button" style={{
          width: 80,
          height: 38,
          backgroundColor: '#e9ecef',
          borderRadius: 4,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></div>
      </div>
    </div>
  </div>
);

const JobPostManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Client-side filtering states
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterLock, setFilterLock] = useState("");

  const jobStatuses = [
    { value: 1, label: "Pending" },
    { value: 2, label: "Active" },
    { value: 3, label: "Inactive" },
    { value: 4, label: "Rejected" },
    { value: "not_started", label: "Not Started" },
    { value: "expired", label: "Expired" }
  ];

  const lockStatuses = [
    { value: "locked", label: "Locked" },
    { value: "unlocked", label: "Unlocked" }
  ];

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  
  // Confirmation modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

  // Fetch all jobs on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const jobsRes = await ApiService.request('Job?role=admin', 'GET');


        if (Array.isArray(jobsRes)) {
          setAllJobs(jobsRes);
        } else {
          console.error("Jobs API did not return an array:", jobsRes);
          setAllJobs([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again.');
        setAllJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Đọc page từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Derive unique companies and industries from allJobs for filtering
  const { companies, industries } = useMemo(() => {
    const companySet = new Map();
    const industrySet = new Map();
    allJobs.forEach(job => {
      if (job.company && !companySet.has(job.company.id)) {
        companySet.set(job.company.id, job.company.companyName);
      }
      if (job.industry && !industrySet.has(job.industry.industryId)) {
        industrySet.set(job.industry.industryId, job.industry.industryName);
      }
    });
    return {
      companies: Array.from(companySet.entries()).map(([id, name]) => ({ id, name })),
      industries: Array.from(industrySet.entries()).map(([id, name]) => ({ id, name })),
    };
  }, [allJobs]);

  // Client-side filtering logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchSearch = searchKeyword === "" || job.title?.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCompany = selectedCompany === "" || job.company?.companyName?.toLowerCase().includes(selectedCompany.toLowerCase());
      const matchIndustry = selectedIndustry === "" || job.industry?.industryId === parseInt(selectedIndustry);
      const derivedStatusLabel = (() => {
        const now = new Date();
        if (job.deactivatedByAdmin) {
          if (job.status === 1) return 'pending (locked)';
          if (job.status === 2) {
            if (new Date(job.timeStart) > now) return 'not started';
            if (new Date(job.timeEnd) < now) return 'expired ';
            return 'active';
          }
          if (job.status === 3) {
            if (new Date(job.timeEnd) < now) return 'expired (locked)';
            return 'inactive (locked)';
          }
          if (job.status === 4) {
            if (new Date(job.timeEnd) < now) return 'expired (locked)';
            return 'rejected (locked)';
          }
          return 'unknown (locked)';
        }
        if (job.status === 1) {
          if (new Date(job.timeEnd) < now) return 'expired';
          return 'pending';
        }
        if (job.status === 2) {
          if (new Date(job.timeStart) > now) return 'not started';
          if (new Date(job.timeEnd) < now) return 'expired';
          return 'active';
        }
        if (job.status === 3) {
          if (new Date(job.timeEnd) < now) return 'expired';
          return 'inactive';
        }
        if (job.status === 4) {
          if (new Date(job.timeEnd) < now) return 'expired';
          return 'rejected';
        }
        return 'unknown';
      })();

      const matchStatus = (() => {
        if (filterStatus === "") return true;
        const numeric = parseInt(filterStatus);
        if (!isNaN(numeric)) {
          return job.status === numeric;
        }
        if (filterStatus === 'not_started') return derivedStatusLabel.startsWith('not started');
        if (filterStatus === 'expired') return derivedStatusLabel.startsWith('expired');
        return true;
      })();

      const matchLock = filterLock === "" || 
        (filterLock === "locked" && job.deactivatedByAdmin) || 
        (filterLock === "unlocked" && !job.deactivatedByAdmin);
      return matchSearch && matchCompany && matchIndustry && matchStatus && matchLock;
    });
  }, [allJobs, searchKeyword, selectedCompany, selectedIndustry, filterStatus, filterLock]);


  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

  const handleStatusChangeClick = (job, status) => {
    setSelectedJob(job);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedJob || newStatus === null) return;
    
    try {
      await ApiService.request(`Job/${selectedJob.jobId}/status?newStatus=${newStatus}`, 'PUT');
      toast.success("Job status updated successfully!");
      setAllJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === selectedJob.jobId ? { ...job, status: parseInt(newStatus) } : job
        )
      );
      setShowStatusModal(false);
      setSelectedJob(null);
      setNewStatus(null);
    } catch (error) {
      let msg = error?.response?.data;
      if (typeof msg === 'object' && msg !== null) {
        msg = msg.message || JSON.stringify(msg);
      }
      if (typeof msg !== 'string') {
        msg = error?.message || 'Unknown error';
      }
      if (msg.toLowerCase().includes('expired')) {
        setShowExpiredModal(true);
      } else {
        toast.error(`Failed to update job status: ${msg}`);
      }
      setShowStatusModal(false);
      setSelectedJob(null);
      setNewStatus(null);
    }
  };

  const handleLockJob = async (jobId, isCurrentlyLocked) => {
    const newLockStatus = !isCurrentlyLocked;
    try {
      await ApiService.request(`Job/${jobId}/lock?isLock=${newLockStatus}`, 'PUT');
      toast.success(`Job ${newLockStatus ? 'locked' : 'unlocked'} successfully!`);
      setAllJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === jobId ? { ...job, deactivatedByAdmin: newLockStatus } : job
        )
      );
    } catch (error) {
      let msg = error?.response?.data;
      if (typeof msg === 'object' && msg !== null) {
        msg = msg.message || JSON.stringify(msg);
      }
      if (typeof msg !== 'string') {
        msg = error?.message || 'Unknown error';
      }
      toast.error(`Failed to update lock status: ${msg}`);
    }
  };

  // Helper để xác định trạng thái phụ
  function getJobDisplayStatus(job) {
    const now = new Date();
    
    // Kiểm tra trạng thái lock trước
    if (job.deactivatedByAdmin) {
      return { label: 'Locked', color: 'bg-danger' };
    }
    
    // Nếu không bị lock, hiển thị trạng thái bình thường

    if (job.status === 1) {
      return { label: 'Pending', color: 'bg-warning' };
    }
    if (job.status === 2) {
      if (new Date(job.timeStart) > now) return { label: 'Not Started', color: 'bg-orange' };
      if (new Date(job.timeEnd) < now) return { label: 'Expired', color: 'bg-dark' };
      return { label: 'Active', color: 'bg-success' };
    }
    if (job.status === 3) {
      if (new Date(job.timeEnd) < now) return { label: 'Expired', color: 'bg-dark' };
      return { label: 'Inactive', color: 'bg-secondary' };
    }
    if (job.status === 4) {
      return { label: 'Rejected', color: 'bg-danger' };
    }
    return { label: 'Unknown', color: 'bg-secondary' };
  }

  if (loading) {
    return (
      <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
        <span className="header-span"></span>
        <MainHeader />
        <MobileMenu />
        <DashboardAdminSidebar />

        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Job Post Management" />
            <MenuToggler />
            
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <h4>Job Post List</h4>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <div className="skeleton-search" style={{
                        width: 180,
                        height: 38,
                        backgroundColor: '#e9ecef',
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div className="skeleton-select" style={{
                        width: 160,
                        height: 38,
                        backgroundColor: '#e9ecef',
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div className="skeleton-select" style={{
                        width: 120,
                        height: 38,
                        backgroundColor: '#e9ecef',
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                    </div>
                  </div>

                  <div className="widget-content">
                    {Array.from({ length: 5 }, (_, index) => (
                      <JobSkeleton key={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) return <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}><div className="text-center py-5 text-danger">{error}</div></div>;

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className={`page-wrapper dashboard`} style={{background:'#f7f8fa', minHeight:'100vh'}}>
      <span className="header-span"></span>
      <MainHeader />
      <MobileMenu />
      <DashboardAdminSidebar />

      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Job Post Management" />
          <MenuToggler />
          
          {/* Modal cảnh báo job hết hạn */}
          <Modal
            open={showExpiredModal}
            onClose={() => setShowExpiredModal(false)}
            title="Cannot update expired job"
            footer={
              <button className="btn-confirm" onClick={() => setShowExpiredModal(false)}>
                Close
              </button>
            }
          >
            <p>This job has expired and cannot be updated. Please check the job posting time!</p>
          </Modal>

          {/* Modal xác nhận thay đổi status */}
          <Modal
            open={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedJob(null);
              setNewStatus(null);
            }}
            title="Confirm Status Change"
            footer={
              <div className="d-flex gap-2">
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedJob(null);
                    setNewStatus(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={handleConfirmStatusChange}
                >
                  Confirm
                </button>
              </div>
            }
          >
            <p>
              Are you sure you want to change the status of job "<strong>{selectedJob?.title}</strong>" to{" "}
              <span style={{ fontWeight: 'bold' }}>
                                                {newStatus === JobStatus.ACTIVE ? "Active" : "Rejected"}
              </span>?
            </p>
          </Modal>

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                  <h4>Job Post List ({filteredJobs.length})</h4>
                  <div className="filter-container d-flex flex-wrap gap-2 align-items-center">
                    <div className="search-group">
                      <input 
                        type="text" 
                        className="form-control form-control-sm search-input" 
                        placeholder="Search job title..." 
                        value={searchKeyword} 
                        onChange={(e) => {setSearchKeyword(e.target.value); handleSetPage(1);}} 
                      />
                    </div>
                    <div className="search-group">
                      <input 
                        type="text" 
                        className="form-control form-control-sm search-input" 
                        placeholder="Search company..." 
                        value={selectedCompany} 
                        onChange={(e) => {setSelectedCompany(e.target.value); handleSetPage(1);}} 
                      />
                    </div>
                    <div className="filter-group">
                      <select 
                        className="form-select form-select-sm filter-select" 
                        value={filterStatus} 
                        onChange={(e) => {setFilterStatus(e.target.value); handleSetPage(1);}}
                      >
                        <option value="">All Status</option>
                        {jobStatuses.map((status, idx) => (
                          <option key={status.value !== undefined ? status.value : `status-${idx}`} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-group">
                      <select 
                        className="form-select form-select-sm filter-select" 
                        value={filterLock} 
                        onChange={(e) => {setFilterLock(e.target.value); handleSetPage(1);}}
                      >
                        <option value="">All Lock Status</option>
                        {lockStatuses.map((status, idx) => (
                          <option key={status.value !== undefined ? status.value : `lock-${idx}`} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="widget-content">
                  {paginatedJobs.length === 0 ? (
                    <div style={{padding:32, textAlign:'center'}}>No jobs found.</div>
                  ) : (
                    paginatedJobs.map((item) => (
                      <div className={`job-block ${item.deactivatedByAdmin ? 'locked-job' : ''}`} key={item.jobId}>
                        <div className="inner-box d-flex align-items-center justify-content-between">
                          <div className="content">
                            <span className="company-logo">
                              <Image width={50} height={49} src={item.company?.urlCompanyLogo || '/images/company-logo/default-logo.png'} alt={item.company?.companyName || 'N/A'} style={{ borderRadius: '50%' }} />
                            </span>
                            <h4><Link href={`/job-detail/${item.jobId}`}>{item.title}</Link></h4>
                            <ul className="job-info">
                              <li><span className="icon flaticon-building"></span>{item.company?.companyName || "N/A"}</li>
                              <li><span className="icon fa fa-calendar"></span>{new Date(item.timeStart).toLocaleDateString()}</li>
                              <li><span className="icon fa fa-calendar"></span>{new Date(item.timeEnd).toLocaleDateString()}</li>
                              <li>
                                {(() => {
                                  const display = getJobDisplayStatus(item);
                                  return <span className={`badge ${display.color}`}>{display.label}</span>;
                                })()}
                              </li>
                            </ul>
                          </div>
                          <div className="job-actions d-flex flex-row align-items-center gap-2 ms-3">
                            <div className="d-flex gap-2">
                              <button
                                className={`btn btn-sm ${item.status === JobStatus.ACTIVE ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleStatusChangeClick(item, JobStatus.ACTIVE)}
                                disabled={item.deactivatedByAdmin || item.status === JobStatus.ACTIVE}
                                style={{
                                  minWidth: '80px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: item.status === JobStatus.ACTIVE ? '0 2px 8px rgba(40, 167, 69, 0.3)' : 'none'
                                }}
                              >
                                <i className="fas fa-check-circle me-1"></i>
                                Active
                              </button>
                              <button
                                className={`btn btn-sm ${item.status === JobStatus.INACTIVEBYADMIN ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => handleStatusChangeClick(item, JobStatus.INACTIVEBYADMIN)}
                                disabled={item.deactivatedByAdmin || item.status === JobStatus.INACTIVEBYADMIN}
                                style={{
                                  minWidth: '80px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: item.status === JobStatus.INACTIVEBYADMIN ? '0 2px 8px rgba(108, 117, 125, 0.3)' : 'none'
                                }}
                              >
                                <i className="fas fa-pause-circle me-1"></i>
                                Inactive
                              </button>
                            </div>
                            <button
                              className={`btn btn-sm ${item.deactivatedByAdmin ? 'btn-success' : 'btn-outline-danger'}`}
                              onClick={() => handleLockJob(item.jobId, item.deactivatedByAdmin)}
                              style={{
                                minWidth: '80px',
                                transition: 'all 0.3s ease',
                                boxShadow: item.deactivatedByAdmin ? '0 2px 8px rgba(40, 167, 69, 0.3)' : 'none'
                              }}
                            >
                              <i className={`fas ${item.deactivatedByAdmin ? 'fa-unlock' : 'fa-lock'} me-1`}></i>
                              {item.deactivatedByAdmin ? 'Unlock' : 'Lock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => handleSetPage(currentPage - 1)}
                        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}
                      >
                        &#8592;
                      </button>
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
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => handleSetPage(currentPage + 1)}
                        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}
                      >
                        &#8594;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
    <style jsx>{`
      .job-block.locked-job .inner-box {
        background-color: #f8d7da;
        border-color: #f5c2c7;
      }
      .page-wrapper.modal-open {
        overflow: hidden;
      }
      .bg-orange {
        background-color: #fd7e14 !important;
        color: #fff;
      }
      .bg-dark {
        background-color: #343a40 !important;
        color: #fff;
      }
      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
      .skeleton-job .inner-box {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
      }
      
      /* Enhanced visual effects for admin interface */
      .job-block {
        transition: all 0.3s ease;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .job-block:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      
      .job-block .inner-box {
        transition: all 0.3s ease;
        border-radius: 12px;
        border: 1px solid #e9ecef;
      }
      
      .job-block:hover .inner-box {
        border-color: #1967d2;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      }
      
      .job-actions button {
        transition: all 0.3s ease;
        border-radius: 8px;
        font-weight: 600;
        position: relative;
        overflow: hidden;
      }
      
      .job-actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .job-actions button:active {
        transform: translateY(0);
      }
      
      .job-actions button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }
      
      .job-actions button:hover::before {
        left: 100%;
      }
      
      .ls-widget {
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }
      
      .ls-widget:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }
      
      .widget-title {
        border-radius: 16px 16px 0 0;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-bottom: 2px solid #e9ecef;
      }
      
      .form-control, .form-select {
        transition: all 0.3s ease;
        border-radius: 8px;
      }
      
      .form-control:focus, .form-select:focus {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(25, 103, 210, 0.15);
      }
      
      .badge {
        transition: all 0.3s ease;
        border-radius: 6px;
        font-weight: 600;
      }
      
      .badge:hover {
        transform: scale(1.05);
      }
      
      /* Loading animation for buttons */
      @keyframes buttonLoading {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .job-actions button:disabled {
        animation: buttonLoading 1.5s infinite;
      }
      
      /* Success animation */
      @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .job-actions button.btn-success {
        animation: successPulse 0.6s ease-out;
      }
      
      /* Responsive filter styles */
      .filter-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      
      .search-group, .filter-group {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .search-input {
        min-width: 180px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        padding: 8px 12px;
        font-size: 14px;
      }
      
      .search-input:focus {
        border-color: #1967d2;
        box-shadow: 0 0 0 3px rgba(25, 103, 210, 0.1);
        transform: translateY(-1px);
      }
      
      .filter-select {
        min-width: 140px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        transition: all 0.3s ease;
        padding: 8px 12px;
        font-size: 14px;
        background-color: #fff;
      }
      
      .filter-select:focus {
        border-color: #1967d2;
        box-shadow: 0 0 0 3px rgba(25, 103, 210, 0.1);
        transform: translateY(-1px);
      }
      
      .search-group:hover .search-input,
      .filter-group:hover .filter-select {
        border-color: #1967d2;
        transform: translateY(-1px);
      }
      
      /* Responsive breakpoints */
      @media (max-width: 1200px) {
        .filter-container {
          flex-direction: column;
          align-items: stretch;
          width: 100%;
        }
        
        .search-group, .filter-group {
          width: 100%;
        }
        
        .search-input, .filter-select {
          width: 100%;
          min-width: unset;
        }
        
        .widget-title {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }
      }
      
      @media (max-width: 768px) {
        .job-actions {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        
        .job-actions .d-flex {
          flex-direction: column;
          gap: 8px;
        }
        
        .job-actions button {
          width: 100%;
          min-width: unset;
        }
        
        .job-block .inner-box {
          flex-direction: column;
          gap: 16px;
        }
        
        .job-block .content {
          width: 100%;
        }
        
        .job-block .job-actions {
          width: 100%;
          margin-left: 0;
        }
      }
      
      @media (max-width: 480px) {
        .modal-content-animated {
          margin: 8px;
          padding: 24px 16px;
        }
        
        .filter-container {
          gap: 8px;
        }
        
        .search-input, .filter-select {
          padding: 10px 12px;
          font-size: 16px; /* Prevent zoom on iOS */
        }
      }
      
      /* Status button styles */
      .status-btn {
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
        border-width: 2px;
        position: relative;
        overflow: hidden;
      }
      
      .status-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .status-btn:active:not(:disabled) {
        transform: translateY(0);
      }
      
      .status-btn.active {
        font-weight: 600;
        border-width: 2px;
      }
      
      .status-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
      
      .btn-outline-success:hover:not(:disabled) {
        background-color: #28a745;
        border-color: #28a745;
        color: white;
      }
      
      .btn-outline-secondary:hover:not(:disabled) {
        background-color: #6c757d;
        border-color: #6c757d;
        color: white;
      }
      
      /* Modal button styles */
      .btn-cancel {
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn-cancel:hover {
        background-color: #5a6268;
      }
      
      .btn-confirm {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn-confirm:hover {
        background-color: #0056b3;
      }
    `}</style>
    </>
  );
};

export default JobPostManagement; 