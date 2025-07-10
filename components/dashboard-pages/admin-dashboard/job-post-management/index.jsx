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
import DashboardHeader from "../../../header/DashboardHeaderAdmin";
import MobileMenu from "../../../header/MobileMenu";
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';

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
    { value: 0, label: "Pending" },
    { value: 1, label: "Active" },
    { value: 2, label: "Inactive" }
  ];

  const lockStatuses = [
    { value: "locked", label: "Locked" },
    { value: "unlocked", label: "Unlocked" }
  ];

  const [showExpiredModal, setShowExpiredModal] = useState(false);

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
      const matchStatus = filterStatus === "" || job.status === parseInt(filterStatus);
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

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await ApiService.request(`Job/${jobId}/status?newStatus=${newStatus}`, 'PUT');
      toast.success("Job status updated successfully!");
      setAllJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === jobId ? { ...job, status: parseInt(newStatus) } : job
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
      if (msg.toLowerCase().includes('expired')) {
        setShowExpiredModal(true);
      } else {
        toast.error(`Failed to update job status: ${msg}`);
      }
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
    if (job.deactivatedByAdmin) return { label: 'Locked', color: 'bg-danger' };
    // Nếu job pending nhưng đã hết hạn, ưu tiên hiển thị Expired
    if (job.status === 0) {
      if (new Date(job.timeEnd) < now) return { label: 'Expired', color: 'bg-dark' };
      return { label: 'Pending', color: 'bg-warning' };
    }
    if (job.status === 1) {
      if (new Date(job.timeStart) > now) return { label: 'Not Started', color: 'bg-orange' };
      if (new Date(job.timeEnd) < now) return { label: 'Expired', color: 'bg-dark' };
      return { label: 'Active', color: 'bg-success' };
    }
    if (job.status === 2) {
      if (new Date(job.timeEnd) < now) return { label: 'Expired', color: 'bg-dark' };
      if (new Date(job.timeStart) > now && !job.deactivatedByAdmin) return { label: 'Cancelled', color: 'bg-secondary' };
      return { label: 'Inactive', color: 'bg-secondary' };
    }
    return { label: 'Unknown', color: 'bg-secondary' };
  }

  if (loading) {
    return (
      <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
        <span className="header-span"></span>
        <DashboardHeader />
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
      <DashboardHeader />
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

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                  <h4>Job Post List ({filteredJobs.length})</h4>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <input type="text" className="form-control form-control-sm" style={{width:180}} placeholder="Search job title..." value={searchKeyword} onChange={(e) => {setSearchKeyword(e.target.value); handleSetPage(1);}} />
                    <input type="text" className="form-control form-control-sm" style={{width:160}} placeholder="Search company..." value={selectedCompany} onChange={(e) => {setSelectedCompany(e.target.value); handleSetPage(1);}} />
                 
                    <select className="form-select form-select-sm" style={{width:120}} value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); handleSetPage(1);}}>
                      <option value="">All Status</option>
                      {jobStatuses.map((status, idx) => (<option key={status.value !== undefined ? status.value : `status-${idx}`} value={status.value}>{status.label}</option>))}
                    </select>
                    <select className="form-select form-select-sm" style={{width:120}} value={filterLock} onChange={(e) => {setFilterLock(e.target.value); handleSetPage(1);}}>
                      <option value="">All Lock Status</option>
                      {lockStatuses.map((status, idx) => (<option key={status.value !== undefined ? status.value : `lock-${idx}`} value={status.value}>{status.label}</option>))}
                    </select>
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
                            <h4><Link href={`/job-single-v3/${item.jobId}`}>{item.title}</Link></h4>
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
                            <select
                              className="form-select form-select-sm"
                              value={item.status}
                              onChange={(e) => handleUpdateStatus(item.jobId, e.target.value)}
                              disabled={item.deactivatedByAdmin}
                              style={{ width: '150px' }}
                            >
                              {jobStatuses.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                              ))}
                            </select>
                            <button
                              className={`btn btn-sm ${item.deactivatedByAdmin ? 'btn-outline-success' : 'btn-outline-danger'}`}
                              onClick={() => handleLockJob(item.jobId, item.deactivatedByAdmin)}
                            >
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
    `}</style>
    </>
  );
};

export default JobPostManagement; 