import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { applicationService } from "@/services/applicationService";

const ApplyJobModalContent = ({ jobId }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    coverLetter: "",
    cvFile: null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    // Check if user is logged in and get their role
    const checkAuth = () => {
      const token = Cookies.get("token");
      const role = Cookies.get("role");
      
      console.log("Auth Check - Token:", token ? "exists" : "missing");
      console.log("Auth Check - Role:", role);
      
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    // Check immediately
    checkAuth();

    // Also check when modal is shown
    const modal = document.getElementById("applyJobModal");
    if (modal) {
      modal.addEventListener("show.bs.modal", checkAuth);
      return () => {
        modal.removeEventListener("show.bs.modal", checkAuth);
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
        setError("Please upload a PDF file");
        setSelectedFileName("");
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        setSelectedFileName("");
        return;
      }
      setFormData(prev => ({
        ...prev,
        cvFile: file
      }));
      setSelectedFileName(file.name);
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Recheck authentication before submitting
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    
    console.log("Submit Check - Token:", token ? "exists" : "missing");
    console.log("Submit Check - Role:", role);

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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("JobId", jobId);
      formDataToSend.append("CoverLetter", formData.coverLetter);
      formDataToSend.append("CvFile", formData.cvFile);

      await applicationService.apply(jobId, formDataToSend);
      
      setSuccess("Applied successfully!");
      // Hiện thông báo 1.5 giây rồi đóng modal
      setTimeout(() => {
        document.querySelector('#applyJobModal .closed-modal')?.click();
        // Nếu muốn redirect sau khi đóng modal, bỏ comment dòng dưới:
        router.push("/candidates-dashboard/applied-jobs");
      }, 1500);
    } catch (error) {
      console.error("Error applying for job:", error);
      setError(error.response?.data?.message || "Failed to apply for the job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Recheck authentication before rendering
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
    <form className="default-form job-apply-form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <div className="uploading-outer apply-cv-outer">
            <div className="uploadButton">
              <input
                className="uploadButton-input"
                type="file"
                name="cvFile"
                accept="application/pdf"
                id="upload"
                onChange={handleFileChange}
                required
              />
              <label
                className="uploadButton-button ripple-effect"
                htmlFor="upload"
              >
                {selectedFileName ? selectedFileName : "Upload CV (PDF)"}
              </label>
            </div>
            {selectedFileName && (
              <div className="text-success mt-2">
                <i className="la la-check-circle"></i> File selected: {selectedFileName}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <textarea
            className="darma"
            name="coverLetter"
            placeholder="Cover Letter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <div className="input-group checkboxes square">
            <input type="checkbox" name="remember-me" id="rememberMe" required />
            <label htmlFor="rememberMe" className="remember">
              <span className="custom-checkbox"></span> You accept our{" "}
              <span data-bs-dismiss="modal">
                <Link href="/terms">
                  Terms and Conditions and Privacy Policy
                </Link>
              </span>
            </label>
          </div>
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
          >
            {isLoading ? "Applying..." : "Apply Job"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ApplyJobModalContent;
