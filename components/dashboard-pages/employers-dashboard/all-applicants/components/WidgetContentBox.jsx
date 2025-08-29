"use client";


import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import ApiService from "@/services/api.service";
import { jobService } from "@/services/jobService";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { saveAs } from 'file-saver';
import Modal from '@/components/common/Modal';
import "@/styles/modal.css";
import axios from "axios";
import API_CONFIG from "@/config/api.config";
// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return null; // Invalid URL
};


const ApplicantModal = ({ applicationId, show, onClose }) => {
  const [application, setApplication] = useState(null);
  useEffect(() => {
    const fetchApplication = async () => {
      if (show && applicationId) {
        try {
          const data = await applicationService.getApplicationById(applicationId);
          setApplication(data);
        } catch {
          setApplication(null);
        }
      }
    };
    fetchApplication();
  }, [show, applicationId]);

  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Applicant</h2>
          <button onClick={onClose} style={{ fontSize: 24, border: "none", background: "none" }}>×</button>
        </div>
        {!application ? (
          <div className="skeleton-modal">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-line" style={{ width: 120 }}></div>
            <div className="skeleton-line" style={{ width: 200 }}></div>
            <div className="skeleton-line" style={{ width: 80 }}></div>
          </div>
        ) : (
          <>
            <div style={{ margin: "16px 0" }}>
              <label><b>Cover Letter:</b></label>
              <div style={{
                background: "#f8f9fa",
                borderRadius: 4,
                padding: 12,
                minHeight: 80,
                marginTop: 4,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                {application.coverLetter || "No cover letter"}
              </div>
            </div>
            <div style={{ margin: "16px 0", textAlign: 'center', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button
                className="cancel-btn"
                style={{
                  background: '#f0f0f0',
                  color: '#555',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={onClose}
                onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
                onMouseOut={e => e.currentTarget.style.background = '#f0f0f0'}
              >
                Cancel
              </button>
              <button
                className="theme-btn btn-style-one"
                onClick={() => window.open(application.resumeUrl, "_blank")}
              >
                View CV (PDF)
              </button>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          position: relative;
        }
        .skeleton-modal { padding: 24px; }
        .skeleton-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: #e0e0e0; margin-bottom: 16px;
        }
        .skeleton-line {
          height: 16px; background: #e0e0e0; border-radius: 4px;
          margin-bottom: 12px;
          animation: skeleton-blink 1.2s infinite linear alternate;
        }
        @keyframes skeleton-blink {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};


const EXPORT_FIELDS = [
  { key: "ApplicationId", label: "Application ID" },
  { key: "FullName", label: "Candidate Name" },
  { key: "Email", label: "Email" },
  { key: "JobTitle", label: "Job Title" },
  { key: "CompanyName", label: "Company" },
  { key: "Status", label: "Status" },
  { key: "SubmittedAt", label: "Submitted At" },
  { key: "ResumeUrl", label: "CV URL" },
  { key: "CoverLetter", label: "Cover Letter" },
  { key: "SimilarityScore", label: "Matching Score" },
];


const WidgetContentBox = ({ jobId, candidateName, showMatchingInfo, useMatchingApi }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [jobCounts, setJobCounts] = useState({});


  // State cho export
  const [selectedIds, setSelectedIds] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [searchText, setSearchText] = useState("");
  const exportBtnRef = useRef();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, applicationId: null, status: null });
  const [statusFilter, setStatusFilter] = useState("all");

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchText]);


  // New state for 'View More Top CVs'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cvViewLimit, setCvViewLimit] = useState(null); // limit from package
  const [cvViewed, setCvViewed] = useState(0); // how many CVs viewed
  const [viewMoreLoading, setViewMoreLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const jobDetails = await jobService.getJobById(jobId);
        if (jobDetails && jobDetails.title) {
          setJobTitle(jobDetails.title);
          setJobDetails(jobDetails);
        } else {
          setJobTitle(`Job ID: ${jobId}`);
          setJobDetails(null);
        }


        let response;
        if (useMatchingApi) {
          // Gọi API matching_job
          response = await applicationService.getMatchingJobApplicants(jobId);
        } else {
          response = await applicationService.getJobApplicants(jobId);
        }


        if (response && response.length > 0) {
          const applicantsWithAllDetails = await Promise.allSettled(
            response.map(async (applicant) => {
              let candidateProfileDetails = null;
              let userDetails = null;


              try {
                candidateProfileDetails = await ApiService.getCandidateProfileById(applicant.userId);


                if (candidateProfileDetails && candidateProfileDetails.avatar === "string") {
                  candidateProfileDetails.avatar = null;
                }


              } catch (profileError) {
                console.error("Error fetching candidate profile:", profileError);
              }


              try {
                userDetails = await ApiService.getUserById(applicant.userId);
              } catch (userError) {
                console.error("Error fetching user details:", userError);
              }


              return {
                ...applicant,
                candidateProfile: candidateProfileDetails,
                user: userDetails
              };
            })
          );


          const fulfilledApplicants = applicantsWithAllDetails
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);


          const sortedApplicants = fulfilledApplicants.slice().sort(
            (a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0)
          );


          setApplicants(sortedApplicants);
        } else {
          setApplicants([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [jobId, useMatchingApi]);


  useEffect(() => {
    const fetchJobCounts = async () => {
      if (!applicants || applicants.length === 0 || !jobDetails?.companyId) return;
      const counts = {};
      await Promise.all(applicants.map(async (applicant) => {
        try {
          const count = await applicationService.getDistinctJobCountByUserInCompany(applicant.userId, jobDetails.companyId);
          counts[applicant.userId] = count;
        } catch (e) {
          counts[applicant.userId] = '-';
        }
      }));
      setJobCounts(counts);
    };
    fetchJobCounts();
  }, [applicants, jobDetails?.companyId]);


  // Fetch employer's package info (cvMatchLimit)
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const sub = await ApiService.getMyCompanySubscription();
        setCvViewLimit(sub?.cvMatchLimit ?? null);
      } catch (e) {
        setCvViewLimit(null);
      }
    };
    fetchPackage();
  }, []);

  // Track how many CVs are being shown (simulate view count)
  useEffect(() => {
    setCvViewed(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

 

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


  const totalApplicants = applicants.length;
  const approvedApplicants = applicants.filter(app => (app.status === 'Approved' || app.status === 1) && app.candidateProfile).length;
  const rejectedApplicants = applicants.filter(app => (app.status === 'Rejected' || app.status === 2) && app.candidateProfile).length;


  // Lọc theo tên ứng viên và status
  const filteredApplicants = applicants.filter(app => {
    // Filter by search text
    const nameMatch = searchText
      ? (app.candidateProfile?.fullName || app.user?.fullName || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true;
    
    // Filter by status
    const statusMatch = statusFilter === "all" 
      ? true 
      : statusFilter === "pending" 
        ? app.status === 0
        : statusFilter === "accepted"
          ? app.status === 2
          : statusFilter === "rejected"
            ? app.status === 1
            : true;
    
    return nameMatch && statusMatch;
  });


  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const applicantsToShow = filteredApplicants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  // Định nghĩa hàm chuyển trang khi nhấn icon list
  const handleShowAppliedJobs = (userId) => {
    const companyId = jobDetails?.companyId;
            let url = `/company-dashboard/shortlisted-resumes?userId=${userId}`;
    if (companyId) url += `&companyId=${companyId}`;
    router.push(url);
  };


  // Chọn tất cả
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(applicantsToShow.map(a => a.applicationId));
    } else {
      setSelectedIds([]);
    }
  };
  // Chọn từng ứng viên
  const handleSelectOne = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };
  // Mở modal export
  const openExportModal = () => {
    setSelectedFields([]);
    setShowExportModal(true);
  };
  // Gửi export
  const handleExport = async () => {
    if (!selectedIds.length) {
      alert('Please select at least one applicant to export CVs!');
      return;
    }
    try {
      // Gọi applicationService.exportApplications chỉ với selectedIds
      const response = await applicationService.exportApplications(selectedIds);
  
      // Xử lý response để tải file ZIP
      const contentDisposition = response.headers['content-disposition'];
      const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : `CVs_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
  
      // Tạo blob và tải file
      const blob = new Blob([response.data], { type: 'application/zip' });
      saveAs(blob, fileName);
  
      // Đóng modal xác nhận
      setShowDownloadConfirm(false);
    } catch (e) {
      console.error('Error exporting CVs:', e.message, { selectedIds });
      alert('Export failed! Please try again or contact support.');
    }
  };
 // Thêm hàm xác nhận/từ chối
 const handleConfirm = async (applicationId, status) => {
  try {
    setUpdatingId(applicationId + status);
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${API_CONFIG.BASE_URL}/application/confirm/${applicationId}`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 200) {
      // Thành công, refetch lại danh sách
      let response;
      if (useMatchingApi) {
        response = await applicationService.getMatchingJobApplicants(jobId);
      } else {
        response = await applicationService.getJobApplicants(jobId);
      }
      // ... mapping lại profile như fetchData ở trên (nếu cần)
      window.location.reload(); // hoặc cập nhật lại state nếu muốn tối ưu
    } else {
      alert("An error occurred!");
    }
  } catch (e) {
    alert("An error occurred!");
  } finally {
    setUpdatingId(null);
  }
};
  if (loading) {
    return (
      <div className="row">
        {[...Array(6)].map((_, idx) => (
          <div className="col-lg-6 col-md-12 mb-4" key={idx}>
            <div className="applicant-box" style={{ padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px #eee', minHeight: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-subtitle" />
                  <div className="skeleton skeleton-line" style={{ width: 120 }} />
                </div>
              </div>
              <div className="skeleton skeleton-line" style={{ width: '80%', margin: '16px 0 0 0' }} />
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-line" style={{ width: 80, height: 20, marginLeft: 12 }} />
              </div>
            </div>
          </div>
        ))}
        <style jsx>{`
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
            background-size: 400% 100%;
            animation: skeleton-loading 1.4s ease infinite;
          }
          @keyframes skeleton-loading {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
          }
          .skeleton-avatar { width: 72px; height: 72px; border-radius: 50%; }
          .skeleton-title { width: 160px; height: 22px; border-radius: 6px; margin-bottom: 8px; }
          .skeleton-subtitle { width: 120px; height: 16px; border-radius: 6px; margin-bottom: 8px; }
          .skeleton-line { height: 14px; border-radius: 6px; margin-bottom: 6px; }
          .skeleton-btn { width: 36px; height: 36px; border-radius: 50%; }
        `}</style>
      </div>
    );
  }


  if (!jobId) {
    return <div className="text-center py-5">No job selected</div>;
  }


  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }


  if (totalApplicants === 0 && !loading) {
    return <div className="text-center py-5">No applicants found for this job</div>;
  }


  return (
    <div className="widget-content">
      <div className="tabs-box">
        {/* Thanh tiêu đề (chỉ giữ 1 lần) */}
        {/* ĐÃ XOÁ tiêu đề Applicant ở dưới */}
        {/* Thanh công cụ search, filter status, select all, export Excel */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <input
              type="text"
              placeholder="Enter Candidate name..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ flex: 1, maxWidth: 320, background: '#f5f8fa', border: '1px solid #e5e9ec', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', height: 44, boxShadow: 'none', outline: 'none', color: '#6f6f6f', fontWeight: 400, paddingLeft: 16 }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ 
                background: '#f5f8fa', 
                border: '1px solid #e5e9ec', 
                borderRadius: 8, 
                fontSize: 14, 
                fontFamily: 'inherit', 
                height: 44, 
                boxShadow: 'none', 
                outline: 'none', 
                color: '#6f6f6f', 
                fontWeight: 400, 
                paddingLeft: 12,
                paddingRight: 32,
                minWidth: 140
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease',
                userSelect: 'none'
              }}
              onClick={() => handleSelectAll(!(selectedIds.length === applicantsToShow.length && applicantsToShow.length > 0))}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <input
                type="checkbox"
                checked={selectedIds.length === applicantsToShow.length && applicantsToShow.length > 0}
                onChange={e => handleSelectAll(e.target.checked)}
                style={{ marginRight: 4 }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ marginRight: 8 }}>Select all</span>
            </div>
            <button
              ref={exportBtnRef}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 18px', fontWeight: 600 }}
              disabled={selectedIds.length === 0}
              onClick={() => setShowDownloadConfirm(true)}
            >
              Download CVs
            </button>
          </div>
        </div>
        {/* Modal chọn trường export */}
        {/* Xóa toàn bộ phần showExportModal và selectedFields liên quan đến export fields */}
        <Tabs>
          <div className="aplicants-upper-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h6 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>Applicants for Job: {jobTitle}</h6>
              <span style={{
                display: 'inline-block',
                background: '#e3eafc',
                color: '#1967d2',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                padding: '2px 14px',
                marginLeft: 4
              }}>
                {statusFilter === "all" 
                  ? `Total(s): ${totalApplicants}` 
                  : `Showing ${filteredApplicants.length} of ${totalApplicants}`}
              </span>
            </div>
           
          </div>


          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {applicantsToShow.map((applicant) => {
                  const percent = applicant.similarityScore !== null && applicant.similarityScore !== undefined ? Math.round(applicant.similarityScore * 100) : 0;
                  const color = percent > 50 ? '#1967d2' : '#e53935';
                  return (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={applicant.applicationId}
                    >
                      <div 
                        className="inner-box" 
                        style={{ 
                          position: 'relative', 
                          padding: 24, 
                          borderRadius: 16, 
                          background: '#fff', 
                          boxShadow: '0 2px 8px #eee', 
                          minHeight: 180,
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s ease',
                          border: selectedIds.includes(applicant.applicationId) ? '2px solid #1967d2' : '2px solid transparent'
                        }}
                        onClick={(e) => {
                          // Không trigger nếu click vào checkbox hoặc các button action
                          if (e.target.type === 'checkbox' || 
                              e.target.closest('.option-list') || 
                              e.target.closest('button') ||
                              e.target.closest('a')) {
                            return;
                          }
                          handleSelectOne(applicant.applicationId, !selectedIds.includes(applicant.applicationId));
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.closest('.option-list') && !e.target.closest('button') && !e.target.closest('a')) {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 103, 210, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.target.closest('.option-list') && !e.target.closest('button') && !e.target.closest('a')) {
                            e.currentTarget.style.boxShadow = '0 2px 8px #eee';
                          }
                        }}
                      >
                        {/* Checkbox chọn ứng viên */}
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(applicant.applicationId)}
                          onChange={e => handleSelectOne(applicant.applicationId, e.target.checked)}
                          style={{ position: 'absolute', left: 16, top: 16, zIndex: 2 }}
                          title="Select this applicant"
                        />
                        {/* Hiển thị similarity score chỉ khi showMatchingInfo là true */}
                        {showMatchingInfo && (
                         <div style={{ position: 'absolute', top: 16, right: 16, width: 48, height: 48, zIndex: 2 }}>
                         <CircularProgressbar
                           value={Math.round(applicant.similarityScore)}
                           text={`${(applicant.similarityScore || 0).toFixed(1)}%`}
                           styles={buildStyles({
                             textColor: Math.round(applicant.similarityScore) >= 50 ? '#1967d2' : '#e53935',
                             pathColor: Math.round(applicant.similarityScore) >= 50 ? '#1967d2' : '#e53935',
                             trailColor: '#e0e0e0',
                             textSize: '22px',
                             strokeLinecap: 'round',
                           })}
                         />
                       </div>
                       
                        )}
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={getValidImageUrl(applicant.user?.image) || getValidImageUrl(applicant.candidateProfile?.avatar) || "/images/resource/candidate-1.png"}
                              alt={applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `Applicant ${applicant.userId}`}
                            />
                          </figure>
                          <h4 className="name">
                            <Link href={`/candidate-profile/${applicant.userId}`}>
                              {applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `User ID: ${applicant.userId}`}
                            </Link>
                          </h4>


                          <ul className="candidate-info">
                            <li className="designation">
                              {applicant.candidateProfile?.jobTitle || applicant.user?.designation || `Job ID: ${applicant.jobId}`}
                            </li>
                            <li>
                              <span className="icon la la-venus-mars"></span>{" "}
                              {applicant.candidateProfile?.gender || 'N/A'}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {
                                [
                                  applicant.candidateProfile?.address,
                                  applicant.candidateProfile?.city,
                                  applicant.candidateProfile?.province
                                ].filter(Boolean).join(', ') ||
                                applicant.user?.location ||
                                `Status: ${applicant.status}`
                              }
                            </li>
                          </ul>


                          {/* Hiển thị skills, education, experience, description % chỉ khi showMatchingInfo là true */}
                          {showMatchingInfo && (
                            <>
                              <div style={{ fontSize: 13, color: '#555', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div><b>Education Match:</b> {formatScoreWithDecimal(applicant.similarityEducation)}</div>
                                <div><b>Experience Match:</b> {formatScoreWithDecimal(applicant.similarityExperience)}</div>
                                <div><b>Skills Match:</b> {formatScoreWithDecimal(applicant.similaritySkills)}</div>
                                <div><b>Description Match:</b> {formatScoreWithDecimal(applicant.similarityDescription)}</div>
                              </div>
                            </>
                          )}


                          <div style={{ margin: '8px 0', fontSize: 14, color: '#1967d2', fontWeight: 500 }}>
                            Applied for <b>{jobCounts[applicant.userId] ?? '-'}</b> job(s) at your company
                          </div>
                        </div>


                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button onClick={() => { setSelectedApplicationId(applicant.applicationId); setShowModal(true); }} data-text="View Applicant">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Approve Applicant"
                                className={applicant.status === 2 ? 'approved' : ''}
                                onClick={() => setConfirmModal({ open: true, applicationId: applicant.applicationId, status: 2 })}
                                disabled={applicant.status !== 0 || updatingId === applicant.applicationId + "2"}
                              >
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Reject Applicant"
                                onClick={() => setConfirmModal({ open: true, applicationId: applicant.applicationId, status: 1 })}
                                disabled={applicant.status !== 0 || updatingId === applicant.applicationId + "1"}
                              >
                                <span className="la la-times"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="View all jobs this candidate applied for at your company"
                                onClick={() => handleShowAppliedJobs(applicant.userId)}
                              >
                                <span className="la la-list"></span>
                              </button>
                            </li>
                          </ul>
                          {/* Hiển thị trạng thái rõ ràng */}
                          <div style={{marginTop: 8}}>
                            {applicant.status === 2 && <span className="status-badge status-accepted">Accepted</span>}
                            {applicant.status === 1 && <span className="status-badge status-rejected">Rejected</span>}
                            {applicant.status === 0 && <span className="status-badge status-pending">Pending</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <button disabled={currentPage === 1} onClick={() => handleSetPage(currentPage - 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}>
                  &#8592;
                </button>
                {Array.from({ length: totalPages || 1 }, (_, i) => (
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
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => handleSetPage(currentPage + 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}>
                  &#8594;
                </button>
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
      <ApplicantModal
        applicationId={selectedApplicationId}
        show={showModal}
        onClose={() => setShowModal(false)}
      />
      <Modal
        open={showDownloadConfirm}
        onClose={() => setShowDownloadConfirm(false)}
        title="Download CVs?"
        footer={
          <>
            <button className="btn-cancel" onClick={() => setShowDownloadConfirm(false)}>No</button>
            <button className="btn-confirm" onClick={() => { setShowDownloadConfirm(false); handleExport(); }}>Yes</button>
          </>
        }
      >
        <div style={{textAlign: 'center', fontSize: 17, color: '#444', padding: '12px 0 4px 0'}}>
          Are you sure you want to download the selected CV(s) as a ZIP file?
        </div>
      </Modal>
       {/* Modal xác nhận Accept/Reject */}
       <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, applicationId: null, status: null })}
        title={confirmModal.status === 2 ? "Confirm Accept" : "Confirm Reject"}
        footer={
          <>
            <button className="btn-cancel" onClick={() => setConfirmModal({ open: false, applicationId: null, status: null })}>No</button>
            <button className="btn-confirm" onClick={async () => {
              await handleConfirm(confirmModal.applicationId, confirmModal.status);
              setConfirmModal({ open: false, applicationId: null, status: null });
            }}>Yes</button>
          </>
        }
      >
        {confirmModal.status === 2 ? "Are you sure you want to accept this applicant?" : "Are you sure you want to reject this applicant?"}
      </Modal>
      <Modal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="You have reached your limit of viewing top CVs."
        footer={
          <>
            <button className="btn-cancel" onClick={() => setShowUpgradeModal(false)}>Close</button>
            <button className="btn-confirm" onClick={() => { setShowUpgradeModal(false); window.location.href = '/company-dashboard/packages/buy'; }}>Upgrade package</button>
          </>
        }
      >
        <div style={{textAlign: 'center', fontSize: 17, color: '#444', padding: '12px 0 4px 0'}}>
        You have reached the limit of the number of top CV views in your current package. Do you want to upgrade your package to see more top CVs?
        </div>
      </Modal>
      <style jsx global>{`
        .CircularProgressbar-text {
          font-weight: 700 !important;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-right: 6px;
        }
        .status-accepted { background: #e6f4ea; color: #219653; }
        .status-rejected { background: #fdeaea; color: #d32f2f; }
        .status-pending { background: #e3eafc; color: #1967d2; }
      `}</style>
    </div>
  );
};


export default WidgetContentBox;


// Helper function
function formatScore(scoreStr) {
  if (!scoreStr) return '';
  const [num, denom] = scoreStr.split('/');
  return `${Math.round(parseFloat(num))}/${Math.round(parseFloat(denom))}`;
}

// Helper function to format score with 1 decimal place for numerator only
function formatScoreWithDecimal(scoreStr) {
  if (!scoreStr) return '';
  const [num, denom] = scoreStr.split('/');
  return `${parseFloat(num).toFixed(1)}/${Math.round(parseFloat(denom))}`;
}