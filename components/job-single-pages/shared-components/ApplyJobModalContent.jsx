import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { applicationService } from "@/services/applicationService";
import ApiService from '@/services/api.service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";

const ApplyJobModalContent = ({ jobId, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    coverLetter: "",
    cvFile: null,
    cvId: ""
  });
  const [cvList, setCvList] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [cvOption, setCvOption] = useState("existing"); // 'existing' or 'upload'
  const [fileError, setFileError] = useState("");
  const [cvListError, setCvListError] = useState("");
  const [coverLetterError, setCoverLetterError] = useState("");
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showJobLimitModal, setShowJobLimitModal] = useState(false);

  // Lấy CV mới nhất (giả sử sort theo createdAt giảm dần)
  const latestCV = cvList && cvList.length > 0
    ? [...cvList].sort((a, b) => new Date(b.createdAt || b.CreatedAt) - new Date(a.createdAt || a.CreatedAt))[0]
    : null;

  useEffect(() => {
    // Check if user is logged in and get their role
    const checkAuth = () => {
      const token = Cookies.get("token");
      const role = Cookies.get("role");
      setIsAuthenticated(!!token);
      setUserRole(role);
    };
    checkAuth();
    // Fetch CV list when modal is shown
    const fetchCVs = async () => {
      try {
        const data = await ApiService.getMyCVs();
        setCvList(data);
      } catch (err) {
        // ignore error
      }
    };
    fetchCVs();
    
    // Add event listener for Bootstrap modal close button
    const modal = document.getElementById("applyJobModal");
    if (modal) {
      const closeButton = modal.querySelector('.closed-modal');
      if (closeButton) {
        const handleCloseClick = (e) => {
          if (isLoading) {
            e.preventDefault();
            e.stopPropagation();
            setShowCancelConfirmModal(true);
          }
          // else: let Bootstrap close modal as normal
        };
        closeButton.addEventListener('click', handleCloseClick);
        
        // Cleanup
        return () => {
          closeButton.removeEventListener('click', handleCloseClick);
        };
      }
    }
  }, [isLoading]); // Add isLoading to dependency array

  // Confirm cancel logic
  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    setIsLoading(false);
    setError("");
    setSuccess("");
    setFileError("");
    setCvListError("");
    setCoverLetterError("");
    // Close modal by triggering click on close button
    const modal = document.getElementById("applyJobModal");
    if (modal) {
      const closeBtn = modal.querySelector('.closed-modal');
      if (closeBtn) closeBtn.click();
    }
  };

  // Cancel cancel logic
  const handleCancelCancel = () => {
    setShowCancelConfirmModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (file.type !== "application/pdf") {
        setFileError("Please upload a PDF file");
        setSelectedFileName("");
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size should be less than 5MB");
        setSelectedFileName("");
        return;
      }
      setFormData(prev => ({
        ...prev,
        cvFile: file,
        cvId: ""
      }));
      setSelectedFileName(file.name);
      setFileError(""); // Clear file error if valid
    }
  };

  const handleSelectCV = (cvId) => {
    setFormData(prev => ({
      ...prev,
      cvId,
      cvFile: null
    }));
    setSelectedFileName("");
    setError("");
    setCvListError("");
  };

  const handleCvOptionChange = (value) => {
    setCvOption(value);
    setError("");
    setFileError("");
    setCvListError("");
    if (value === "existing") {
      setFormData(prev => ({ ...prev, cvFile: null }));
      setSelectedFileName("");
    } else {
      setFormData(prev => ({ ...prev, cvId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFileError("");
    setCvListError("");
    setCoverLetterError("");
    setIsLoading(true);

    const token = Cookies.get("token");
    const role = Cookies.get("role");
    let hasError = false;

    if (!token) {
      setError("Please login to apply for this job");
      setIsLoading(false);
      return;
    }
    if (role !== "Candidate") {
      setError("Only candidates can apply for jobs");
      setIsLoading(false);
      return;
    }
    if (!formData.coverLetter.trim()) {
      setCoverLetterError("Please enter a cover letter.");
      hasError = true;
    }
    if (cvOption === "existing" && (!formData.cvId || !cvList.length)) {
      setCvListError("Please select a CV from the list");
      hasError = true;
    }
    if (cvOption === "upload" && !formData.cvFile) {
      setFileError("Please upload a PDF CV file");
      hasError = true;
    }
    if (hasError) {
      setIsLoading(false);
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("JobId", jobId);
      formDataToSend.append("CoverLetter", formData.coverLetter);
      if (cvOption === "upload") {
        formDataToSend.append("CvFile", formData.cvFile);
      } else if (cvOption === "existing") {
        formDataToSend.append("CvId", formData.cvId);
      }
      await applicationService.apply(jobId, formDataToSend);
      setSuccess("You have successfully applied for this job!");
      toast.success("You have successfully applied for this job!");
      setTimeout(() => {
        setIsLoading(false); // Tắt loading trước
        if (onClose) onClose(); // Đóng modal trước
        setTimeout(() => {
          router.push("/candidates-dashboard/applied-jobs");
        }, 200); // Đợi modal đóng xong mới chuyển trang
      }, 1500);
    } catch (error) {
      // Lấy message từ nhiều key, ưu tiên errorMessage, ErrorMessage, message
      const errorMsg =
        error.response?.data?.ErrorMessage ||
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to apply for the job. Please try again.";

      // So sánh không phân biệt hoa thường
      if (
        error.response &&
        error.response.status === 400 &&
        errorMsg.toLowerCase().includes("Please update your personal information completely.")
      ) {
        setIsLoading(false);
        setShowProfileWarning(true);
        // Không setError, không toast!
      } else if (
        error.response &&
        error.response.status === 400 &&
        (errorMsg.includes("You are only allowed to apply for a maximum of 3 positions.") ||
         errorMsg.includes("maximum 3 pending applications"))
      ) {
        // Special handling for 3-job limit error - show detailed modal
        setIsLoading(false);
        setShowJobLimitModal(true);
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const token = Cookies.get("token");
  const role = Cookies.get("role");
  if (!token) {
    return (
      <div className="text-center p-4">
        <p>Please login to apply for this job</p>
        <Link href="/login" className="theme-btn btn-style-one">
          Login
        </Link>
      </div>
    );
  }
  if (role !== "Candidate") {
    return (
      <div className="text-center p-4">
        <p>Only candidates can apply for jobs</p>
      </div>
    );
  }
  return (
    <>
      <form className="default-form job-apply-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {isLoading && (
          <div className="modal-loading-overlay">
            <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
          </div>
        )}
        <div className="row">
          {/* Card: Use current CV (dropdown) */}
          <div
            className={`col-12 form-group cv-option-card${cvOption === "existing" ? " selected" : ""}`}
            style={{ marginBottom: 6, cursor: 'pointer' }}
            onClick={() => handleCvOptionChange("existing")}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <input
                type="radio"
                name="cvOption"
                value="existing"
                checked={cvOption === "existing"}
                onChange={() => handleCvOptionChange("existing")}
                style={{ marginRight: 12, marginTop: 2, accentColor: '#1976d2', width: 20, height: 20 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1976d2', marginBottom: 2 }}>
                  Use your CV from the list
                </div>
                {cvList && cvList.length > 0 ? (
                  <>
                    <div className="form-group" style={{ width: '100%', margin: 0, padding: 0 }}>
                      <select
                        className="custom-cv-select"
                        value={formData.cvId}
                        onChange={e => handleSelectCV(e.target.value)}
                        style={{ width: '100%', margin: '8px 0', fontSize: 16 }}
                        disabled={cvOption !== "existing"}
                      >
                        <option value="">-- Select your uploaded CV --</option>
                        {cvList.map(cv => (
                          <option key={cv.cvId || cv.CVId} value={cv.cvId || cv.CVId}>
                            {cv.fileName || cv.fileUrl?.split("/").pop() || cv.FileUrl?.split("/").pop() || "CV"}
                          </option>
                        ))}
                      </select>
                      {formData.cvId && (
                        <div className="upload-date">
                          Upload date: {
                            (() => {
                              const selected = cvList.find(cv => String(cv.cvId || cv.CVId) === String(formData.cvId));
                              return selected ? new Date(selected.createdAt || selected.CreatedAt).toLocaleDateString() : '';
                            })()
                          }
                        </div>
                      )}
                    </div>
                    {formData.cvId && (() => {
                      const selectedCV = cvList.find(cv => String(cv.cvId || cv.CVId) === String(formData.cvId));
                      const fileUrl = selectedCV?.fileUrl || selectedCV?.FileUrl;
                      if (fileUrl) {
                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-cv-link-btn"
                          >
                            <i className="la la-eye" style={{ marginRight: 4 }}></i>
                            View selected CV
                          </a>
                        );
                      } else {
                        return (
                          <span className="field-error" style={{ display: 'inline-block', marginTop: 4 }}>
                            CV file not found or unavailable.
                          </span>
                        );
                      }
                    })()}
                  </>
                ) : (
                  <div style={{ color: '#888', fontSize: 14 }}>No CV uploaded yet.</div>
                )}
                {cvListError && (
                  <div className="field-error">
                    {cvListError}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Card: Upload new CV */}
          <div
            className={`col-12 form-group cv-option-card${cvOption === "upload" ? " selected" : ""}`}
            style={{ marginBottom: 6, cursor: 'pointer' }}
            onClick={() => handleCvOptionChange("upload")}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <input
                type="radio"
                name="cvOption"
                value="upload"
                checked={cvOption === "upload"}
                onChange={() => handleCvOptionChange("upload")}
                style={{ marginRight: 12, marginTop: 2, accentColor: '#1976d2', width: 20, height: 20 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1976d2', marginBottom: 2 }}>
                  Upload New CV
                </div>
                <div className="choose-file-row">
                  <label htmlFor="upload-cv-file" style={{ display: 'inline-block', background: '#fff', border: '1.5px solid #1976d2', color: '#1976d2', borderRadius: 6, padding: '7px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                    <span style={{ marginRight: 8, fontSize: 18 }}> <i className="la la-upload"></i> </span>
                    Choose file
                    <input
                      id="upload-cv-file"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      disabled={cvOption !== "upload"}
                    />
                  </label>
                  <span
                    className="selected-file-name"
                    style={{ fontWeight: 500, color: '#222', fontSize: 15 }}
                    title={selectedFileName}
                  >
                    {selectedFileName || "No file chosen"}
                  </span>
                </div>
                {fileError && (
                  <div className="field-error">
                    {fileError}
                  </div>
                )}
                <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                  Please upload a .pdf file, maximum 5MB.
                </div>
              </div>
            </div>
          </div>
          {/* Cover letter */}
          <div className="col-12 form-group">
            <textarea
              className="darma"
              name="coverLetter"
              placeholder="Cover Letter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              style={{ minHeight: 100, fontSize: 16 }}
            ></textarea>
            {coverLetterError && (
              <div className="field-error">
                {coverLetterError}
              </div>
            )}
          </div>
          {error && (
            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
              <div className="alert alert-danger">{error}</div>
            </div>
          )}
          {success && (
            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
              <div className="alert alert-success">{success}</div>
            </div>
          )}
          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <button
              className="theme-btn btn-style-one w-100"
              type="submit"
              disabled={isLoading}
              style={{ fontSize: 18, fontWeight: 400 }}
            >
              {isLoading ? "Applying..." : "Apply Job"}
            </button>
          </div>
        </div>

        {/* Modal cảnh báo cập nhật profile */}
        <Modal
          open={showProfileWarning}
          onClose={() => setShowProfileWarning(false)}
          title="Update profile"
          footer={
            <>
              <button className="btn-cancel" onClick={() => setShowProfileWarning(false)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={() => {
                  window.open('/candidates-dashboard/my-profile', '_blank');
                  setShowProfileWarning(false);
                }}
              >
                Update Profile
              </button>
            </>
          }
        >
          <p>You need to update your profile to apply for this job.</p>
        </Modal>
      </form>

      {/* Modal xác nhận hủy Apply Job - overlay style, not Bootstrap modal */}
      {showCancelConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: 340,
            maxWidth: '90vw',
            padding: '32px 28px 24px 28px',
            position: 'relative',
            textAlign: 'center',
          }}>
            <button
              onClick={handleCancelCancel}
              style={{
                position: 'absolute', top: 16, right: 18, border: 'none', background: 'transparent', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 400
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 style={{fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#222'}}>Cancel Application?</h3>
            <div style={{fontSize: 16, color: '#444', marginBottom: 28}}>
              Are you sure you want to cancel your application? Your progress will be lost.
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
              <button className="btn-cancel" style={{minWidth: 80, padding: '8px 0', borderRadius: 6, border: '1px solid #ccc', background: '#f7f7f7', color: '#333', fontWeight: 500, fontSize: 16}} onClick={handleCancelCancel}>No</button>
              <button className="btn-confirm" style={{minWidth: 80, padding: '8px 0', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16}} onClick={handleConfirmCancel}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo giới hạn 3 job */}
      {showJobLimitModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: 420,
            maxWidth: '90vw',
            padding: '32px 28px 24px 28px',
            position: 'relative',
            textAlign: 'center',
          }}>
            <button
              onClick={() => setShowJobLimitModal(false)}
              style={{
                position: 'absolute', top: 16, right: 18, border: 'none', background: 'transparent', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 400
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{fontSize: 28, marginBottom: 16}}>⚠️</div>
            <h3 style={{fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#dc3545'}}>Đã đạt giới hạn ứng tuyển</h3>
            <div style={{fontSize: 16, color: '#444', marginBottom: 8, lineHeight: 1.5}}>
            You have 3 applications pending at this company.
            </div>
            <div style={{fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.4}}>
            Please wait for the results of your previous applications before applying for new positions with this company.
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
              <button 
                style={{
                  minWidth: 100, padding: '10px 16px', borderRadius: 6, 
                  border: '1px solid #ccc', background: '#f7f7f7', color: '#333', 
                  fontWeight: 500, fontSize: 14, cursor: 'pointer'
                }} 
                onClick={() => setShowJobLimitModal(false)}
              >
                Close
              </button>
              <button 
                style={{
                  minWidth: 100, padding: '10px 16px', borderRadius: 6, 
                  border: 'none', background: '#1967d2', color: '#fff', 
                  fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }} 
                onClick={() => {
                  setShowJobLimitModal(false);
                  if (onClose) onClose();
                  router.push('/candidates-dashboard/applied-jobs');
                }}
              >
                View submitted applications
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyJobModalContent;