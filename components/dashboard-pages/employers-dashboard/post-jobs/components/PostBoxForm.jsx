'use client'

import Map from "../../../Map";
import { useState, useEffect } from "react";
// import Map from "../../../Map";
import Select from "react-select";
import { useRouter } from 'next/navigation';
import ApiService from "../../../../../services/api.service";
import { authService } from "../../../../../services/authService";
import API_CONFIG from "../../../../../config/api.config";
import Cookies from "js-cookie";
import axios from "axios";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const PostBoxForm = () => {
  const specialisms = [
    { value: "Banking", label: "Banking" },
    { value: "Digital & Creative", label: "Digital & Creative" },
    { value: "Retail", label: "Retail" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Managemnet", label: "Managemnet" },
    { value: "Accounting & Finance", label: "Accounting & Finance" },
    { value: "Digital", label: "Digital" },
    { value: "Creative Art", label: "Creative Art" },
  ];
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobId: 0,
    title: '',
    description: '',
    companyId: 0,
    salary: "",
    industryId: 0,
    expiryDate: '',
    levelId: 0,
    jobTypeId: 0,
    experienceLevelId: 0,
    timeStart: '',
    timeEnd: '',
    status: 0,
    provinceName: '',
    addressDetail: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [levels, setLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Lấy thông tin user từ localStorage hoặc cookies
  const [user, setUser] = useState(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    ApiService.get(API_CONFIG.ENDPOINTS.LEVEL).then(setLevels);
    ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE).then(setJobTypes);
    ApiService.get(API_CONFIG.ENDPOINTS.EXPERIENCE_LEVEL).then(setExperienceLevels);
    ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY).then(setIndustries);
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(res => setProvinces(res.data))
      .catch(() => setProvinces([]));
    // Lấy userId từ localStorage hoặc cookies
    const userId = localStorage.getItem('userId') || Cookies.get('userId');
    const userRole = localStorage.getItem('role') || Cookies.get('role');
    setUser({ userId, role: userRole });
    setIsClient(true);
  }, []);

  // Cleanup the image preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    }
    if (!formData.industryId) {
      newErrors.industryId = 'Industry is required';
    }
    if (!formData.levelId) {
      newErrors.levelId = 'Job level is required';
    }
    if (!formData.jobTypeId) {
      newErrors.jobTypeId = 'Job type is required';
    }
    if (!formData.experienceLevelId) {
      newErrors.experienceLevelId = 'Experience level is required';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Application deadline is required';
    }
    if (!formData.timeStart) {
      newErrors.timeStart = 'Start date is required';
    }
    if (!formData.timeEnd) {
      newErrors.timeEnd = 'End date is required';
    }
    if (!formData.provinceName) {
      newErrors.provinceName = 'Province is required';
    }
    if (!formData.addressDetail) {
      newErrors.addressDetail = 'Address detail is required';
    }

    // Validate dates
    if (formData.timeStart) {
      const startDate = new Date(formData.timeStart);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (startDate < today) {
        newErrors.timeStart = 'Start date cannot be in the past';
      }
    }
    if (formData.timeStart && formData.timeEnd) {
      const startDate = new Date(formData.timeStart);
      const endDate = new Date(formData.timeEnd);
      if (endDate <= startDate) {
        newErrors.timeEnd = 'End date must be after start date';
      }
    }
    if (formData.timeStart && formData.timeEnd && formData.expiryDate) {
      const startDate = new Date(formData.timeStart);
      const endDate = new Date(formData.timeEnd);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate < startDate || expiryDate > endDate) {
        newErrors.expiryDate = 'Application deadline must be between start date and end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imageFile') {
      const file = e.target.files[0];
      setSelectedImage(file);
      if (file) {
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        setImagePreviewUrl(null);
      }
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: [
        "industryId",
        "levelId",
        "jobTypeId",
        "experienceLevelId"
      ].includes(name)
        ? Number(value)
        : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value,
    }));
    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked", formData, user);
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      setError("Please fill in all information!");
      return;
    }

    if (!user?.userId || user.role !== 'Company') {
      setError("You must login with a company account to post a job.");
      return;
    }

    try {
      const postFormData = new FormData();
      postFormData.append('Title', formData.title);
      postFormData.append('Description', formData.description);
      postFormData.append('CompanyId', user.userId);
      postFormData.append('Salary', formData.salary);
      postFormData.append('IndustryId', formData.industryId);
      postFormData.append('ExpiryDate', formData.expiryDate);
      postFormData.append('LevelId', formData.levelId);
      postFormData.append('JobTypeId', formData.jobTypeId);
      postFormData.append('ExperienceLevelId', formData.experienceLevelId);
      postFormData.append('TimeStart', formData.timeStart);
      postFormData.append('TimeEnd', formData.timeEnd);
      postFormData.append('ProvinceName', formData.provinceName);
      postFormData.append('AddressDetail', formData.addressDetail);

      if (selectedImage) {
        postFormData.append('ImageFile', selectedImage);
      }

      const result = await ApiService.createJob(postFormData);
      console.log("API gọi thành công", result);
      setSuccess(true);
      setShowSuccessModal(true);
      setFormData({
        jobId: 0,
        title: '',
        description: '',
        companyId: 0,
        salary: "",
        industryId: 0,
        expiryDate: '',
        levelId: 0,
        jobTypeId: 0,
        experienceLevelId: 0,
        timeStart: '',
        timeEnd: '',
        status: 0,
        provinceName: '',
        addressDetail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("API lỗi:", error);
      setError("Tạo job thất bại: " + error.message);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* Job Title */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter job title" 
            className={errors.title ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Job Description */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Description</label>
          {isClient ? (
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link', 'image'
              ]}
              className="job-description-quill"
            />
          ) : (
            <textarea
              name="description"
              placeholder="Job Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="8"
            ></textarea>
          )}
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Salary */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Salary</label>
          <input 
            type="number" 
            name="salary" 
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="Enter salary amount"
            className={errors.salary ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.salary && <span className="error-message">{errors.salary}</span>}
        </div>

        {/* Industry */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Industry</label>
          <select 
            name="industryId" 
            value={formData.industryId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.industryId ? 'error' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Industry</option>
            {industries.map(ind => (
              <option key={ind.industryId} value={ind.industryId}>{ind.industryName}</option>
            ))}
          </select>
          {errors.industryId && <span className="error-message">{errors.industryId}</span>}
        </div>

        {/* Job Level */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Job Level</label>
          <select 
            name="levelId" 
            value={formData.levelId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.levelId ? 'error' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Level</option>
            {levels.map((level, idx) => (
              <option key={level.id || idx} value={level.id}>{level.levelName}</option>
            ))}
          </select>
          {errors.levelId && <span className="error-message">{errors.levelId}</span>}
        </div>

        {/* Job Type */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Job Type</label>
          <select 
            name="jobTypeId" 
            value={formData.jobTypeId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.jobTypeId ? 'error' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Job Type</option>
            {jobTypes.map(type => (
              <option key={type.id} value={type.id}>{type.jobTypeName}</option>
            ))}
          </select>
          {errors.jobTypeId && <span className="error-message">{errors.jobTypeId}</span>}
        </div>

        {/* Experience Level */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Experience Level</label>
          <select 
            name="experienceLevelId" 
            value={formData.experienceLevelId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.experienceLevelId ? 'error' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Experience Level</option>
            {experienceLevels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
          {errors.experienceLevelId && <span className="error-message">{errors.experienceLevelId}</span>}
        </div>

        {/* Expiry Date */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Application Deadline</label>
          <input 
            type="date" 
            name="expiryDate" 
            value={formData.expiryDate}
            onChange={handleInputChange}
            className={`form-control ${errors.expiryDate ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
        </div>

        {/* Time Start */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Start Date</label>
          <input 
            type="date" 
            name="timeStart" 
            value={formData.timeStart}
            onChange={handleInputChange}
            className={`form-control ${errors.timeStart ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.timeStart && <span className="error-message">{errors.timeStart}</span>}
        </div>

        {/* Time End */}
        <div className="form-group col-lg-6 col-md-12">
          <label>End Date</label>
          <input 
            type="date" 
            name="timeEnd" 
            value={formData.timeEnd}
            onChange={handleInputChange}
            className={`form-control ${errors.timeEnd ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.timeEnd && <span className="error-message">{errors.timeEnd}</span>}
        </div>

        {/* Province Name */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Province</label>
          <select 
            name="provinceName" 
            value={formData.provinceName}
            onChange={handleInputChange}
            className={errors.provinceName ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="">Select Province</option>
            {provinces.map(p => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
          {errors.provinceName && <span className="error-message">{errors.provinceName}</span>}
        </div>

        {/* Address Detail */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Address Detail</label>
          <input 
            type="text" 
            name="addressDetail" 
            value={formData.addressDetail}
            onChange={handleInputChange}
            placeholder="Enter address detail"
            className={errors.addressDetail ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.addressDetail && <span className="error-message">{errors.addressDetail}</span>}
        </div>

        {/* Image File Input */}
        

        {/* Submit Button */}
        <div className="form-group col-lg-12 col-md-12 text-right">
          <button 
            type="submit" 
            className="theme-btn btn-style-one"
            disabled={isLoading}
          >
            {isLoading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Success!</h3>
            <p>Post job successfully!</p>
            <button
              className="theme-btn btn-style-one"
              onClick={(e) => {
                e.preventDefault();
                setShowSuccessModal(false);
                setErrors({});
                setFormData({
                  jobId: 0,
                  title: '',
                  description: '',
                  companyId: 0,
                  salary: "",
                  industryId: 0,
                  expiryDate: '',
                  levelId: 0,
                  jobTypeId: 0,
                  experienceLevelId: 0,
                  timeStart: '',
                  timeEnd: '',
                  status: 0,
                  provinceName: '',
                  addressDetail: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background-color: #fff;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-control:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
        select.form-select {
          padding: 10px;
          height: auto;
          background-position: right 10px center;
        }
        .error {
          border-color: #dc3545 !important;
        }
        .error-message {
          background: none !important;
          padding: 0 !important;
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
          display: block;
          border: none !important;
          box-shadow: none !important;
          text-align: left;
        }
        input[type="date"] {
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          padding: 5px;
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .theme-btn {
          position: relative;
        }
        .theme-btn:disabled {
          background-color: #ccc;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: #fff;
          border-radius: 8px;
          padding: 24px 16px;
          text-align: center;
          width: 100%;
          max-width: 350px;
          min-width: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          box-sizing: border-box;
        }
        @media (max-width: 400px) {
          .modal-content {
            max-width: 95vw;
            padding: 16px 4vw;
          }
        }
        .modal-content h3 {
          margin-bottom: 12px;
          color: #28a745;
        }
        .modal-content button {
          margin-top: 16px;
        }
        label {
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
          display: block;
        }
      `}</style>
    </form>
  );
};

export default PostBoxForm;