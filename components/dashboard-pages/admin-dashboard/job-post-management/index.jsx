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

const JobPostManagement = () => {
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

  const [alertMsg, setAlertMsg] = useState("");
  const jobStatuses = ["Pending", "Approved", "Rejected"];

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
      const matchCompany = selectedCompany === "" || job.company?.id === parseInt(selectedCompany);
      const matchIndustry = selectedIndustry === "" || job.industry?.industryId === parseInt(selectedIndustry);
      const matchStatus = filterStatus === "" || job.status === parseInt(filterStatus);
      return matchSearch && matchCompany && matchIndustry && matchStatus;
    });
  }, [allJobs, searchKeyword, selectedCompany, selectedIndustry, filterStatus]);


  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await ApiService.request(`Job/${jobId}/status?newStatus=${newStatus}`, 'PUT');
      setAlertMsg("Job status updated successfully!");
      setAllJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === jobId ? { ...job, status: parseInt(newStatus) } : job
        )
      );
    } catch (error) {
      setAlertMsg(`Failed to update job status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleLockJob = async (jobId, isCurrentlyLocked) => {
    const newLockStatus = !isCurrentlyLocked;
    try {
      await ApiService.request(`Job/${jobId}/lock?isLock=${newLockStatus}`, 'PUT');
      setAlertMsg(`Job ${newLockStatus ? 'locked' : 'unlocked'} successfully!`);
      setAllJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === jobId ? { ...job, deactivatedByAdmin: newLockStatus } : job
        )
      );
    } catch (error) {
      setAlertMsg(`Failed to update lock status: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}><div className="text-center py-5">Loading...</div></div>;
  if (error) return <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}><div className="text-center py-5 text-danger">{error}</div></div>;

  return (
    <>
    <div className={`page-wrapper dashboard`} style={{background:'#f7f8fa', minHeight:'100vh'}}>
      <span className="header-span"></span>
      <DashboardHeader />
      <MobileMenu />
      <DashboardAdminSidebar />

      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Job Post Management" />
          <MenuToggler />
          
          {alertMsg && <div className="alert alert-info alert-dismissible fade show" role="alert" style={{marginBottom: 12}}>
              {alertMsg}
              <button type="button" className="btn-close" onClick={() => setAlertMsg("")}></button>
            </div>}

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                  <h4>Job Post List ({filteredJobs.length})</h4>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <input type="text" className="form-control form-control-sm" style={{width:180}} placeholder="Search job title..." value={searchKeyword} onChange={(e) => {setSearchKeyword(e.target.value); setCurrentPage(1);}} />
                    <select className="form-select form-select-sm" style={{width:160}} value={selectedCompany} onChange={(e) => {setSelectedCompany(e.target.value); setCurrentPage(1);}}>
                      <option value="">All Companies</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 
                    <select className="form-select form-select-sm" style={{width:120}} value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}>
                      <option value="">All Status</option>
                      {jobStatuses.map((status, index) => (<option key={index} value={index}>{status}</option>))}
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
                                {item.deactivatedByAdmin ? (
                                  <span className="badge bg-danger">Locked</span>
                                ) : (
                                  <span className={`badge ${
                                    item.status === 0 ? 'bg-warning' :
                                    item.status === 1 ? 'bg-success' :
                                    item.status === 2 ? 'bg-danger' : 'bg-secondary'
                                  }`}>
                                    {item.status === 0 ? 'Pending' : item.status === 1 ? 'Approved' : item.status === 2 ? 'Rejected' : 'Unknown'}
                                  </span>
                                )}
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
                              {jobStatuses.map((status, index) => (
                                <option key={index} value={index}>{status}</option>
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
                    <nav className="mt-3">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
                            </li>
                        </ul>
                    </nav>
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
    `}</style>
    </>
  );
};

export default JobPostManagement; 