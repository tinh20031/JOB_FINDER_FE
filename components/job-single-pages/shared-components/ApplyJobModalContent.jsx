import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { applicationService } from "@/services/applicationService";
import ApiService from '@/services/api.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";

const ApplyJobModalContent = ({ jobId }) => {
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
    // Also check when modal is shown
    const modal = document.getElementById("applyJobModal");
    if (modal) {
      modal.addEventListener("show.bs.modal", checkAuth);
      modal.addEventListener("show.bs.modal", fetchCVs);
      return () => {
        modal.removeEventListener("show.bs.modal", checkAuth);
        modal.removeEventListener("show.bs.modal", fetchCVs);
      };
    }
  }, []);

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
      setSuccess("Applied successfully!");
      toast.success("Applied successfully!");
      setTimeout(() => {
        document.querySelector('#applyJobModal .closed-modal')?.click();
        router.push("/candidates-dashboard/applied-jobs");
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
        errorMsg.toLowerCase().includes("vui lòng cập nhật đầy đủ thông tin cá nhân")
      ) {
        document.querySelector('#applyJobModal .closed-modal')?.click();
        setShowProfileWarning(true);
        // Không setError, không toast!
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
    <form className="default-form job-apply-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
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
                Upload a new CV
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
  );
};

export default ApplyJobModalContent;
