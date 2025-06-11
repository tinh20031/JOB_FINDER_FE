"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addPerPage,
  addSalary,
  addSort,
  addTag,
  clearExperience,
  clearJobType,
} from "../../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearExperienceToggle,
  clearJobTypeToggle,
} from "../../../../features/job/jobSlice";
import Image from "next/image";
import { jobService } from "../../../../services/jobService";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import DashboardHeader from "../../../header/DashboardHeaderAdmin";
import "../user-manager/user-manager-animations.css";
import ApiService from "../../../../services/api.service";
import API_CONFIG from '../../../../config/api.config';
import { authService } from "../../../../services/authService";

const JobPostManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [displayCount, setDisplayCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Separate states for companies and industries
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Debounced states
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [debouncedCompany, setDebouncedCompany] = useState("");
  const [debouncedIndustry, setDebouncedIndustry] = useState("");
  const [debouncedFilterStatus, setDebouncedFilterStatus] = useState("");

  // State để lưu dữ liệu lookup
  const [companies, setCompanies] = useState([]);
  const [jobTypesData, setJobTypesData] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [industries, setIndustries] = useState([]);

  // Adjust useSelector path for filters if needed (assuming filterSlice is shared or adapted)
  // Using Redux state for public job filters for consistency, adjust if admin needs separate filters
  const { jobList, jobSort } = useSelector((state) => state.filter);
  const {
    keyword,
    location,
    destination,
    category,
    jobType,
    datePosted,
    experience,
    salary,
    tag,
  } = jobList || {};

  const { sort } = jobSort;
  const dispatch = useDispatch();

  const [alertMsg, setAlertMsg] = useState("");

  const jobStatuses = ["Pending", "Approved", "Rejected"];

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced handlers
  const debouncedKeywordHandler = useCallback(
    debounce((value) => {
      setDebouncedKeyword(value);
    }, 500),
    []
  );

  const debouncedCompanyHandler = useCallback(
    debounce((value) => {
      setDebouncedCompany(value);
    }, 500),
    []
  );

  const debouncedIndustryHandler = useCallback(
    debounce((value) => {
      setDebouncedIndustry(value);
    }, 500),
    []
  );

  const debouncedFilterStatusHandler = useCallback(
    debounce((value) => {
      setDebouncedFilterStatus(value);
    }, 500),
    []
  );

  // Fetch jobs và lookup data
  useEffect(() => {
    console.log('Initial data fetch started');
    fetchLookupData();
  }, []); // Empty dependency array for initial load only

  // Separate useEffect for jobs fetch
  useEffect(() => {
    console.log('Jobs fetch triggered with filters:', {
      keyword: debouncedKeyword,
      company: debouncedCompany,
      industry: debouncedIndustry,
      status: debouncedFilterStatus
    });
    fetchJobs();
  }, [
    debouncedKeyword,
    debouncedCompany,
    debouncedIndustry,
    debouncedFilterStatus,
    location,
    jobType,
    datePosted,
    experience,
    salary,
    sort,
    currentPage,
    itemsPerPage
  ]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = {};

      // Use debounced values for API parameters
      if (debouncedKeyword) filters.keyword = debouncedKeyword;
      if (location) filters.location = location;
      if (debouncedCompany) filters.companyId = parseInt(debouncedCompany);
      if (debouncedIndustry) filters.industryId = parseInt(debouncedIndustry);
      if (jobType?.length > 0) filters.jobTypeIds = jobType;
      if (experience?.length > 0) filters.experienceLevelIds = experience;
      if (salary?.min !== 0 || salary?.max !== 20000) filters.salaryRange = salary;
      if (datePosted && datePosted !== "all") filters.datePosted = datePosted;
      if (debouncedFilterStatus) filters.status = parseInt(debouncedFilterStatus);

      // Pagination parameters
      filters.page = currentPage;
      filters.limit = itemsPerPage;

      console.log('Fetching jobs with filters:', filters);

      // Convert filters to query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const queryString = queryParams.toString();
      const url = `Job/filter${queryString ? `?${queryString}` : ''}`;
      
      console.log('API Request URL:', url);
      const response = await ApiService.request(url, 'GET');

      if (Array.isArray(response)) {
        setJobs(response);
        setTotalJobs(response.length);
        setError(null);
        console.log('Jobs fetched successfully:', response);
      } else {
        console.error('Unexpected API response format:', response);
        setJobs([]);
        setTotalJobs(0);
        setError('Unexpected data format from API');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchLookupData function to use query parameters
  const fetchLookupData = async () => {
    try {
      console.log('Fetching lookup data...');
      const [companiesRes, jobTypesRes, expLevelsRes, industriesRes] = await Promise.all([
        jobService.getCompanies().catch(err => { 
          console.error('Failed to fetch companies data', err); 
          return []; 
        }),
        jobService.getJobTypes().catch(err => { 
          console.error('Failed to fetch job types data', err); 
          return []; 
        }),
        jobService.getExperienceLevels().catch(err => { 
          console.error('Failed to fetch experience levels data', err); 
          return []; 
        }),
        jobService.getIndustries().catch(err => { 
          console.error('Failed to fetch industries data', err); 
          return []; 
        })
      ]);

      console.log('Raw API responses:', {
        companies: companiesRes,
        jobTypes: jobTypesRes,
        expLevels: expLevelsRes,
        industries: industriesRes
      });

      // Map companies
      const mappedCompanies = companiesRes.map(company => ({
        Id: company.id,
        CompanyName: company.name,
        logo: company.logo,
      }));

      // Map industries
      const mappedIndustries = industriesRes.map(industry => ({
        Id: industry.industryId,
        IndustryName: industry.industryName,
      }));

      // Map job types
      const mappedJobTypes = jobTypesRes.map(type => ({
        Id: type.id,
        JobTypeName: type.jobTypeName,
      }));

      // Map experience levels
      const mappedExpLevels = expLevelsRes.map(level => ({
        Id: level.id,
        Name: level.name,
      }));

      setCompanies(mappedCompanies);
      setIndustries(mappedIndustries);
      setJobTypesData(mappedJobTypes);
      setExperienceLevels(mappedExpLevels);

      console.log('Mapped data:', {
        companies: mappedCompanies,
        industries: mappedIndustries,
        jobTypes: mappedJobTypes,
        expLevels: mappedExpLevels
      });

    } catch (err) {
      console.error('Error fetching lookup data:', err);
      setCompanies([]);
      setIndustries([]);
      setJobTypesData([]);
      setExperienceLevels([]);
    }
  };

  // Helper function để tìm tên từ ID trong dữ liệu lookup (Sử dụng mapped data)
  const getCompanyName = (companyId) => {
    console.log('Attempting to get company name for companyId:', companyId);
    console.log('Current companies array in getCompanyName:', companies);
    const company = companies.find(c => c.Id === companyId);
    return company ? company.CompanyName : 'N/A';
  };

  const getIndustryName = (industryId) => {
    const industry = industries.find(i => i.Id === industryId);
    return industry ? industry.IndustryName : 'N/A';
  };

  const getJobTypeName = (jobTypeId) => {
    const type = jobTypesData.find(jt => jt.Id === jobTypeId);
    return type ? type.JobTypeName : 'N/A';
  };

  const getExperienceLevelName = (expLevelId) => {
    const level = experienceLevels.find(el => el.Id === expLevelId);
    return level ? level.Name : 'N/A';
  };

  // Frontend filtering and sorting will be removed or minimal if API handles it
  // Keeping these helper functions for now but rely more on API filters

  // Pagination logic remains as it operates on the fetched and filtered list
  const totalPages = Math.ceil(totalJobs / itemsPerPage);

  // Lọc jobs theo search và filter
  const filteredJobs = jobs.filter(job => {
    const matchSearch = searchKeyword === "" || 
      job.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchCompany = selectedCompany === "" || job.companyId === parseInt(selectedCompany);
    const matchIndustry = selectedIndustry === "" || job.industryId === parseInt(selectedIndustry);
    const matchStatus = filterStatus === "" || job.status === parseInt(filterStatus);
    return matchSearch && matchCompany && matchIndustry && matchStatus;
  });

  // Phân trang
  const paginatedJobs = filteredJobs.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  // Adjust content mapping to display job data and admin actions
  let content = paginatedJobs
    ?.map((item) => (
      <div className="job-block" key={item.jobId}>
        <div className="inner-box">
          <div className="content">
            {/* Company Logo */}
            <span className="company-logo">
              {(() => {
                const company = companies.find(c => c.Id === item.companyId);
                const logoSrc = company?.logo || '/images/company-logo/default-logo.png';
                const companyName = company?.CompanyName || 'N/A';
                return <Image width={50} height={49} src={logoSrc} alt={companyName} />;
              })()}
            </span>

            <div className="job-details">
              {/* Job Title */}
              <h4>
                <Link href={`/job-single-v3/${item.jobId}`}>{item.title}</Link>
              </h4>

              <ul className="job-info">
                {/* Company Name from lookup */}
                {item.companyId && companies.length > 0 && (
                  <li>
                    <span className="icon flaticon-building"></span>
                    {getCompanyName(item.companyId)}
                  </li>
                )}
                {/* Province Name */}
                {item.provinceName && (
                  <li>
                    <span className="icon flaticon-map-locator"></span>
                    {item.provinceName}
                  </li>
                )}
                {/* Salary */}
                {item.salary !== undefined && (
                  <li>
                    <span className="icon flaticon-money"></span>
                    {item.salary}
                  </li>
                )}
                {/* Add Status if available on job object */}
                {item.status !== undefined && (
                  <li className={`badge badge-status ${item.status}`}>{jobStatuses[item.status]}</li>
                )}
                {/* Add Created At if available */}
                {item.createdAt && (
                  <li>
                    <span className="icon fa fa-calendar"></span>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </li>
                )}
              </ul>

              {/* Job Tags (Industry, Job Type, Experience Level) */}
              <ul className="job-other-info">
                {/* Industry tag from lookup */}
                {item.industryId && industries.length > 0 && (
                  <li className="time">{getIndustryName(item.industryId)}</li>
                )}
                {/* Job Type tag from lookup */}
                {item.jobTypeId && jobTypesData.length > 0 && (
                  <li className="time">{getJobTypeName(item.jobTypeId)}</li>
                )}
                {/* Experience Level tag from lookup */}
                {item.experienceLevelId && experienceLevels.length > 0 && (
                  <li className="urgent">{getExperienceLevelName(item.experienceLevelId)}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Admin Actions Buttons */}
          <div className="job-actions">
            {/* Approve/Reject buttons */}
            {item.status === 0 && (
              <button className="btn btn-sm me-1" onClick={() => handleApproveJob(item.jobId)}>Approve</button>
            )}
            {item.status === 0 && (
              <button className="btn btn-sm me-1" onClick={() => handleRejectJob(item.jobId)}>Reject</button>
            )}
            {/* Edit button */}
            <button className="btn btn-sm me-1" onClick={() => handleShowEdit(item)}>Edit</button>
            {/* Delete button */}
            <button className="btn btn-sm me-1" onClick={() => handleShowDelete(item)}>Delete</button>
          </div>
        </div>
      </div>
    ));

  // Pagination controls - Operate on totalJobs from API and local currentPage/itemsPerPage
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
    setCurrentPage(1);
  };

  const perPageHandler = (e) => {
    const limit = Number(e.target.value);
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Clear all filters - Adjust to clear relevant filters
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addCategory(""));
    dispatch(clearJobType());
    dispatch(addDatePosted(""));
    dispatch(clearExperience());
    dispatch(addSalary({ min: 0, max: 20000 }));
    setFilterStatus('');
    dispatch(addSort(""));
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  // --- Admin specific logic (Modals and Handlers) ---

  // Add state for modals and selected job for actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJobToDelete, setSelectedJobToDelete] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [formJob, setFormJob] = useState({});
  const [editError, setEditError] = useState("");

  // Handlers for admin actions (Implement API calls using ApiService)

  const handleShowAdd = () => {
    setFormJob({});
    setShowAddModal(true);
  };

  const handleShowEdit = (job) => {
    setEditJob({ ...job });
    setEditError("");
    setShowEditModal(true);
  };

  const handleShowDelete = (job) => {
    setSelectedJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleApproveJob = async (jobId) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`Attempting to approve job with ID: ${jobId}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7266/api'}/Job/${jobId}/status?newStatus=1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      setAlertMsg("Job post approved successfully!");
      // Cập nhật lại danh sách jobs
      await fetchJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      setAlertMsg(`Failed to approve job post: ${error.message || error}`);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`Attempting to reject job with ID: ${jobId}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7266/api'}/Job/${jobId}/status?newStatus=2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      setAlertMsg("Job post rejected!");
      fetchJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
      setAlertMsg(`Failed to reject job post: ${error.message || error}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedJobToDelete) return;
    try {
      console.log(`Attempting to delete job with ID: ${selectedJobToDelete.jobId}`);
      const response = await ApiService.request(`Job/${selectedJobToDelete.jobId}`, 'DELETE');
      if (response.ok) {
        setAlertMsg(`Job post ${selectedJobToDelete.title} removed!`);
        fetchJobs();
      } else {
        const errorData = await response.json();
        setAlertMsg(errorData.message || `Failed to remove job post ${selectedJobToDelete.title}: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setAlertMsg(`Failed to remove job post ${selectedJobToDelete.title}: ${error.message || error}`);
    }
    setShowDeleteModal(false);
    setSelectedJobToDelete(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const processedValue = ['companyId', 'industryId', 'jobTypeId', 'experienceLevelId', 'status'].includes(name) ? parseInt(value) || '' : value;

    setEditJob({
      ...editJob,
      [name]: processedValue,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editJob?.jobId) return;
    try {
      console.log(`Attempting to edit job with ID: ${editJob.jobId}`, editJob);
      const response = await ApiService.request(`Job/${editJob.jobId}`, 'PUT', editJob);

      if (response.ok) {
        setAlertMsg("Job post updated successfully!");
        setShowEditModal(false);
        fetchJobs();
      } else {
        const errorData = await response.json();
        setEditError(errorData.message || `Failed to update job post: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating job post:', error);
      setEditError(error.message || "Failed to update job post.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting to add new job post:', formJob);
      const response = await ApiService.request('Job/create', 'POST', formJob);

      if (response.ok) {
        setAlertMsg("Job post added successfully!");
        setShowAddModal(false);
        fetchJobs();
      } else {
        const errorData = await response.json();
        setAlertMsg(errorData.message || `Failed to add job post: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding job post:', error);
      setAlertMsg(error.message || "Failed to add job post.");
    }
  };

  // --- Modals JSX ---

  // Add Job Modal JSX (Adjust fields based on job creation API)
  const AddJobModal = () => (
    <div className={`modal show ${showAddModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog" style={{display: showAddModal ? 'block' : 'none'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleFormSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add New Job Post</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" name="title" value={formJob.title || ''} onChange={(e) => setFormJob({...formJob, title: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Company (Select from lookup)</label>
                <select className="form-select" name="companyId" value={formJob.companyId || ''} onChange={(e) => setFormJob({...formJob, companyId: parseInt(e.target.value) || ''})} required>
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.Id} value={company.Id}>{company.CompanyName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Industry (Select from lookup)</label>
                <select className="form-select" name="industryId" value={formJob.industryId || ''} onChange={(e) => setFormJob({...formJob, industryId: parseInt(e.target.value) || ''})}>
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.Id} value={industry.Id}>{industry.IndustryName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Salary</label>
                <input type="text" className="form-control" name="salary" value={formJob.salary || ''} onChange={(e) => setFormJob({...formJob, salary: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Job Type (Select from lookup)</label>
                <select className="form-select" name="jobTypeId" value={formJob.jobTypeId || ''} onChange={(e) => setFormJob({...formJob, jobTypeId: parseInt(e.target.value) || ''})}>
                  <option value="">Select Job Type</option>
                  {jobTypesData.map(type => (
                    <option key={type.Id} value={type.Id}>{type.JobTypeName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Experience Level (Select from lookup)</label>
                <select className="form-select" name="experienceLevelId" value={formJob.experienceLevelId || ''} onChange={(e) => setFormJob({...formJob, experienceLevelId: parseInt(e.target.value) || ''})}>
                  <option value="">Select Experience Level</option>
                  {experienceLevels.map(level => (
                    <option key={level.Id} value={level.Id}>{level.Name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Province Name</label>
                <input type="text" className="form-control" name="provinceName" value={formJob.provinceName || ''} onChange={(e) => setFormJob({...formJob, provinceName: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Address Detail</label>
                <input type="text" className="form-control" name="addressDetail" value={formJob.addressDetail || ''} onChange={(e) => setFormJob({...formJob, addressDetail: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Status (Select)</label>
                <select className="form-select" name="status" value={formJob.status !== undefined ? formJob.status : ''} onChange={(e) => setFormJob({...formJob, status: parseInt(e.target.value) || ''})} required>
                  <option value="">Select Status</option>
                  <option value={0}>Pending</option>
                  <option value={1}>Approved</option>
                  <option value={2}>Rejected</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formJob.description || ''} onChange={(e) => setFormJob({...formJob, description: e.target.value})} rows="4"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Job Post</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Edit Job Modal JSX (Adjust fields based on job edit API and data structure)
  const EditJobModal = () => (
    <div className={`modal show ${showEditModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog" style={{display: showEditModal ? 'block' : 'none'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleEditSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Job Post</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {editError && <div className="alert alert-danger">{editError}</div>}
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" name="title" value={editJob?.title || ''} onChange={handleEditChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Company (Select from lookup)</label>
                <select className="form-select" name="companyId" value={editJob?.companyId || ''} onChange={handleEditChange} required>
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.Id} value={company.Id}>{company.CompanyName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Industry (Select from lookup)</label>
                <select className="form-select" name="industryId" value={editJob?.industryId || ''} onChange={handleEditChange}>
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.Id} value={industry.Id}>{industry.IndustryName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Salary</label>
                <input type="text" className="form-control" name="salary" value={editJob?.salary || ''} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Job Type (Select from lookup)</label>
                <select className="form-select" name="jobTypeId" value={editJob?.jobTypeId || ''} onChange={handleEditChange}>
                  <option value="">Select Job Type</option>
                  {jobTypesData.map(type => (
                    <option key={type.Id} value={type.Id}>{type.JobTypeName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Experience Level (Select from lookup)</label>
                <select className="form-select" name="experienceLevelId" value={editJob?.experienceLevelId || ''} onChange={handleEditChange}>
                  <option value="">Select Experience Level</option>
                  {experienceLevels.map(level => (
                    <option key={level.Id} value={level.Id}>{level.Name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Province Name</label>
                <input type="text" className="form-control" name="provinceName" value={editJob?.provinceName || ''} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Address Detail</label>
                <input type="text" className="form-control" name="addressDetail" value={editJob?.addressDetail || ''} onChange={handleEditChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Status (Select)</label>
                <select className="form-select" name="status" value={editJob?.status !== undefined ? editJob.status : ''} onChange={handleEditChange} required>
                  <option value="">Select Status</option>
                  <option value={0}>Pending</option>
                  <option value={1}>Approved</option>
                  <option value={2}>Rejected</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={editJob?.description || ''} onChange={handleEditChange} rows="4"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal JSX
  const DeleteJobModal = () => (
    <div className={`modal show ${showDeleteModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog" style={{display: showDeleteModal ? 'block' : 'none'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Delete</h5>
            <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete the job post <b>{selectedJobToDelete?.title}</b>?
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
        <span className="header-span"></span>
        <DashboardHeader />
        <DashboardAdminSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Job Post Management" />
            <MenuToggler />
            <div className="text-center py-5">Loading...</div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
        <span className="header-span"></span>
        <DashboardHeader />
        <DashboardAdminSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Job Post Management" />
            <MenuToggler />
            <div className="text-center py-5 text-danger">{error}</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
      <style>{`
        .job-block {
          position: relative;
          margin-bottom: 30px;
        }
        .job-block .inner-box {
          position: relative;
          padding: 32px 20px 22px 30px;
          background: #ffffff;
          border: 1px solid #ecedf2;
          box-sizing: border-box;
          border-radius: 10px;
          transition: all 300ms ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .job-block .inner-box:hover {
          box-shadow: 0px 7px 18px rgba(64, 79, 104, 0.05);
        }
        .job-block .content {
          position: relative;
          padding-left: 68px;
          min-height: 51px;
          flex-grow: 1;
        }
        .job-block .company-logo {
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          transition: all 300ms ease;
        }
        .job-block h4 {
          font-size: 18px;
          color: #202124;
          font-weight: 500;
          line-height: 26px;
          margin-bottom: 3px;
        }
        .job-block h4 a {
          color: #202124;
          transition: all 300ms ease;
        }
        .job-block h4 a:hover {
          color: var(--primary-color);
        }
        .job-block .job-info {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .job-block .job-info li {
          position: relative;
          font-size: 14px;
          line-height: 22px;
          color: #696969;
          font-weight: 400;
          padding-left: 25px;
          margin-bottom: 5px;
          margin-right: 20px;
        }
        .job-block .job-info li .icon {
          position: absolute;
          left: 0;
          top: 0;
          font-size: 18px;
          line-height: 22px;
          color: #696969;
        }
        .job-block .job-other-info {
          position: relative;
          display: flex;
          flex-wrap: wrap;
        }
        .job-block .job-other-info li {
          position: relative;
          font-size: 13px;
          line-height: 15px;
          margin-right: 15px;
          padding: 5px 20px;
          border-radius: 50px;
          margin-bottom: 10px;
        }
        .job-block .job-other-info li.time {
          background: rgba(25, 103, 210, 0.15);
          color: var(--primary-color);
        }
        .job-block .job-other-info li.urgent {
          background: rgba(52, 168, 83, 0.15);
          color: #34a853;
        }
        .job-actions {
          display: flex;
          gap: 10px;
        }
        .job-actions .btn {
          position: relative;
          display: inline-block;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          user-select: none;
          border: 1px solid #ecedf2;
          padding: 6px 16px;
          font-size: 13px;
          line-height: 1.5;
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
          font-weight: 500;
          background: #ffffff;
          color: #696969;
        }
        .job-actions .btn:hover, .job-actions .btn:focus {
          background: #f5f7fa;
          border-color: #1967d2;
          color: #1967d2;
          box-shadow: 0 2px 8px rgba(25,103,210,0.08);
          transform: scale(1.05);
          transition: all 0.18s;
        }
        .badge-status {
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 8px;
        }
        .badge-status.0 { background: #d1f5e0; color: #1a7f37; }
        .badge-status.1 { background: #fff3cd; color: #856404; }
        .badge-status.2 { background: #f8d7da; color: #842029; }
        @media (max-width: 768px) {
          .job-block .inner-box {
            flex-direction: column;
            align-items: flex-start;
          }
          .job-block .content {
            padding-left: 0;
            margin-bottom: 20px;
          }
          .job-block .company-logo {
            position: relative;
            margin-bottom: 15px;
          }
          .job-block .job-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .job-actions {
            width: 100%;
            justify-content: flex-end;
            flex-wrap: wrap;
          }
          .job-actions .btn {
            flex: 1;
            min-width: 80px;
          }
        }
      `}</style>
      <span className="header-span"></span>
      <DashboardHeader />
      <DashboardAdminSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Job Post Management" />
          <MenuToggler />
          {alertMsg && (
            <div className="alert alert-info" style={{marginBottom: 12}}>
              {alertMsg}
            </div>
          )}
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-title d-flex flex-wrap gap-2 justify-content-between align-items-center">
                  <h4>Job Post List</h4>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{width:180}}
                      placeholder="Search job title..."
                      value={searchKeyword}
                      onChange={handleSearch}
                    />
                    <select 
                      className="form-select form-select-sm" 
                      style={{width:140}} 
                      value={selectedCompany}
                      onChange={(e) => {
                        setSelectedCompany(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Companies</option>
                      {companies.map(company => (
                        <option key={company.Id} value={company.Id}>{company.CompanyName}</option>
                      ))}
                    </select>
                    <select 
                      className="form-select form-select-sm" 
                      style={{width:140}} 
                      value={selectedIndustry}
                      onChange={(e) => {
                        setSelectedIndustry(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry.Id} value={industry.Id}>{industry.IndustryName}</option>
                      ))}
                    </select>
                    <select 
                      className="form-select form-select-sm" 
                      style={{width:120}} 
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="0">Pending</option>
                      <option value="1">Approved</option>
                      <option value="2">Rejected</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleShowAdd}>Add Job</button>
                  </div>
                </div>
                <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <div>
                      {paginatedJobs.length === 0 ? (
                        <div style={{padding:32, textAlign:'center'}}>No job found</div>
                      ) : (
                        content
                      )}
                      {totalPages > 1 && (
                        <nav className="mt-3">
                          <ul className="pagination justify-content-end">
                            <li className={`page-item${currentPage===1?' disabled':''}`}>
                              <button className="page-link" onClick={()=>setCurrentPage(currentPage-1)} disabled={currentPage===1}>&laquo;</button>
                            </li>
                            {Array.from({length: totalPages}, (_,i)=>(
                              <li key={i+1} className={`page-item${currentPage===i+1?' active':''}`}>
                                <button className="page-link" onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
                              </li>
                            ))}
                            <li className={`page-item${currentPage===totalPages?' disabled':''}`}>
                              <button className="page-link" onClick={()=>setCurrentPage(currentPage+1)} disabled={currentPage===totalPages}>&raquo;</button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showAddModal && <AddJobModal />}
      {showEditModal && editJob && <EditJobModal />}
      {showDeleteModal && selectedJobToDelete && <DeleteJobModal />}
    </div>
  );
};

export default JobPostManagement; 