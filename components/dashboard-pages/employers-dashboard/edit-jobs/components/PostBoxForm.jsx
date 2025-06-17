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
import { motion, AnimatePresence } from 'framer-motion';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const PostBoxForm = ({ initialData, isEditing }) => {
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
    education: '',
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [intendedPath, setIntendedPath] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  // Draft key for localStorage
  const DRAFT_KEY = `job_edit_draft_${initialData?.jobId || 'new'}`;

  useEffect(() => {
    setIsClient(true);
  }, []);

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

    if (isEditing && initialData) {
      const initialStatusForForm = initialData.status === 0 ? "Pending" : initialData.status === 1 ? "Active" : initialData.status === 2 ? "Inactive" : "Pending";
      
      console.log("initialData.salary BEFORE cleanup:", initialData.salary);
      const cleanedSalary = initialData.salary != null ? String(initialData.salary).replace(/[^0-9.]/g, '') : "";
      console.log("initialData.salary AFTER cleanup:", cleanedSalary);

      setFormData({
        ...initialData,
        salary: cleanedSalary,
        industryId: initialData.industryId || 0,
        levelId: initialData.levelId || 0,
        jobTypeId: initialData.jobTypeId || 0,
        experienceLevelId: initialData.experienceLevelId || 0,
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        timeStart: initialData.timeStart ? initialData.timeStart.split('T')[0] : '',
        timeEnd: initialData.timeEnd ? initialData.timeEnd.split('T')[0] : '',
        status: initialStatusForForm,
     
      });
    }

  }, [initialData, isEditing]);

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
    if (!formData.education.trim()) {
      newErrors.education = 'Education requirements are required';
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

  const handleEducationChange = (value) => {
    setFormData(prev => ({
      ...prev,
      education: value,
    }));
    // Clear error when user starts typing
    if (errors.education) {
      setErrors(prev => ({
        ...prev,
        education: ''
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
      setError("Bạn phải đăng nhập bằng tài khoản công ty để đăng tin tuyển dụng.");
      return;
    }

    let statusToSendToBackend;
    if (formData.status === "Pending") {
      statusToSendToBackend = 0;
    } else if (formData.status === "Active") {
      statusToSendToBackend = 1;
    } else if (formData.status === "Inactive") {
      statusToSendToBackend = 2;
    } else {
      console.error("Trạng thái không hợp lệ:", formData.status);
      setError("Trạng thái công việc không hợp lệ.");
      return;
    }

    try {
      const commonData = {
        title: formData.title,
        description: formData.description,
        education: formData.education,
        salary: parseFloat(formData.salary),
        industryId: formData.industryId,
        levelId: formData.levelId,
        jobTypeId: formData.jobTypeId,
        experienceLevelId: formData.experienceLevelId,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : '',
        timeStart: new Date(formData.timeStart).toISOString(),
        timeEnd: new Date(formData.timeEnd).toISOString(),
        provinceName: formData.provinceName,
        addressDetail: formData.addressDetail,
        status: statusToSendToBackend,
      };

      if (isEditing) {
        // Cập nhật job
        const updatedFormData = new FormData();
        for (const key in commonData) {
          if (commonData[key] !== undefined) {
            if (key === 'status') {
              updatedFormData.append('Status', statusToSendToBackend);
            } else if (['salary', 'industryId', 'levelId', 'jobTypeId', 'experienceLevelId'].includes(key)) {
              updatedFormData.append(key.charAt(0).toUpperCase() + key.slice(1), Number(commonData[key]));
            } else if (['timeStart', 'timeEnd', 'expiryDate'].includes(key)) {
              // Ensure dates are in ISO string format if they are date objects
              const dateValue = commonData[key] instanceof Date ? commonData[key].toISOString() : commonData[key];
              updatedFormData.append(key.charAt(0).toUpperCase() + key.slice(1), dateValue);
            } else {
              updatedFormData.append(key.charAt(0).toUpperCase() + key.slice(1), commonData[key]);
            }
          }
        }
        // Thêm các trường khác cần thiết cho PUT nếu có (ví dụ: jobId, CompanyId)
        updatedFormData.append('Id', formData.jobId);
        updatedFormData.append('CompanyId', formData.companyId); // Đảm bảo companyId được truyền cho cập nhật

        // Nếu có ảnh mới được chọn để cập nhật
        if (selectedImage) {
          updatedFormData.append('ImageFile', selectedImage);
        }

        await ApiService.request(`Job/${formData.jobId}`, 'PUT', updatedFormData);
        console.log("Job updated successfully");
      } else {
        // Tạo job mới
        const postFormData = new FormData();
        for (const key in commonData) {
          if (commonData[key] !== undefined) {
            if (key === 'status') {
              postFormData.append('Status', statusToSendToBackend);
            } else if (key === 'salary' || key === 'industryId' || key === 'levelId' || key === 'jobTypeId' || key === 'experienceLevelId') {
              postFormData.append(key.charAt(0).toUpperCase() + key.slice(1), Number(commonData[key]));
            } else if (key === 'timeStart' || key === 'timeEnd') {
              postFormData.append(key.charAt(0).toUpperCase() + key.slice(1), commonData[key]);
            } else {
              postFormData.append(key.charAt(0).toUpperCase() + key.slice(1), commonData[key]);
            }
          }
        }
        postFormData.append('CompanyId', Number(user.userId));
        if (selectedImage) {
          postFormData.append('ImageFile', selectedImage);
        }
        await ApiService.createJob(postFormData);
        console.log("Job created successfully");
      }

      setSuccess(true);
      setShowSuccessModal(true);
      // Optionally reset form if creating a new job
      if (!isEditing) {
        setFormData({
          jobId: 0,
          title: '',
          description: '',
          education: '',
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
        setSelectedImage(null);
        setImagePreviewUrl(null);
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job. Please try again.`);
    }
  };

  // Determine if status select should be disabled
  const isStatusSelectDisabled = isEditing && formData.status === 0; // Disable if editing and status is Pending (0)

  // Load draft data on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Auto-save draft when form data changes
  useEffect(() => {
    if (hasActualChanges()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  // Check if there are actual changes in the form
  const hasActualChanges = () => {
    return formData.title.trim() !== '' || 
           formData.description.trim() !== '' ||
           formData.education.trim() !== '' ||
           formData.salary !== '' ||
           formData.industryId !== 0 ||
           formData.levelId !== 0 ||
           formData.jobTypeId !== 0 ||
           formData.experienceLevelId !== 0 ||
           formData.expiryDate !== '' ||
           formData.timeStart !== '' ||
           formData.timeEnd !== '' ||
           formData.provinceName !== '' ||
           formData.addressDetail !== '';
  };

  // Handle navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && hasActualChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && hasUnsavedChanges && hasActualChanges()) {
        e.preventDefault();
        e.stopPropagation();
        const href = anchor.getAttribute('href');
        if (href) {
          setIntendedPath(href);
          setShowLeaveConfirmation(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleLeave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLeaveConfirmation(false);
    if (intendedPath) {
      try {
        await router.push(intendedPath);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const handleStay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLeaveConfirmation(false);
    setIntendedPath(null);
    setErrors({});
  };

  const handleClearDraft = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({
      jobId: initialData?.jobId || 0,
      title: '',
      description: '',
      education: '',
      companyId: initialData?.companyId || 0,
      salary: "",
      industryId: 0,
      expiryDate: '',
      levelId: 0,
      jobTypeId: 0,
      experienceLevelId: 0,
      timeStart: '',
      timeEnd: '',
      status: initialData?.status || 0,
      provinceName: '',
      addressDetail: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setHasUnsavedChanges(false);
    setErrors({});
    setError("");
    setSuccess(false);
    setShowClearConfirm(false);
    
    setClearSuccess(true);
    setTimeout(() => {
      setClearSuccess(false);
    }, 2000);
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  return (
    <motion.form 
      className="default-form" 
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="row">
        {/* Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="message-box error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div 
              className="message-box success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              Job updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {clearSuccess && (
            <motion.div 
              className="message-box success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              Draft cleared successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draft Controls */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              className="form-group col-lg-12 col-md-12"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="draft-controls" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <motion.span 
                  style={{ color: '#666' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
                  You have unsaved changes
                </motion.span>
                <motion.button
                  type="button"
                  className="theme-btn btn-style-two"
                  onClick={handleClearDraft}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Draft
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* <!-- Input Fields --> */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleInputChange}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

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

        <div className="form-group col-lg-12 col-md-12">
          <label>Education Requirements</label>
          {isClient ? (
            <ReactQuill
              theme="snow"
              value={formData.education}
              onChange={handleEducationChange}
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
              name="education"
              placeholder="Education Requirements"
              value={formData.education}
              onChange={handleInputChange}
              rows="8"
            ></textarea>
          )}
          {errors.education && <span className="error-message">{errors.education}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Salary (USD)</label>
          <input
            type="number"
            name="salary"
            
            value={formData.salary}
            onChange={handleInputChange}
          />
          {errors.salary && <span className="error-message">{errors.salary}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Application Deadline</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Start Date</label>
          <input
            type="date"
            name="timeStart"
            value={formData.timeStart}
            onChange={handleInputChange}
          />
          {errors.timeStart && <span className="error-message">{errors.timeStart}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>End Date</label>
          <input
            type="date"
            name="timeEnd"
            value={formData.timeEnd}
            onChange={handleInputChange}
          />
          {errors.timeEnd && <span className="error-message">{errors.timeEnd}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Industry</label>
          <select
            name="industryId"
            className="chosen-single form-select"
            value={formData.industryId}
            onChange={handleInputChange}
          >
            <option value="">Select Industry</option>
            {industries.map(industry => (
              <option key={industry.industryId} value={industry.industryId}>
                {industry.industryName}
              </option>
            ))}
          </select>
          {errors.industryId && <span className="error-message">{errors.industryId}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Job Level</label>
          <select
            name="levelId"
            className="chosen-single form-select"
            value={formData.levelId}
            onChange={handleInputChange}
          >
            <option value="">Select Job Level</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.levelName}
              </option>
            ))}
          </select>
          {errors.levelId && <span className="error-message">{errors.levelId}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Job Type</label>
          <select
            name="jobTypeId"
            className="chosen-single form-select"
            value={formData.jobTypeId}
            onChange={handleInputChange}
          >
            <option value="">Select Job Type</option>
            {jobTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.jobTypeName}
              </option>
            ))}
          </select>
          {errors.jobTypeId && <span className="error-message">{errors.jobTypeId}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Experience Level</label>
          <select
            name="experienceLevelId"
            className="chosen-single form-select"
            value={formData.experienceLevelId}
            onChange={handleInputChange}
          >
            <option value="">Select Experience Level</option>
            {experienceLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          {errors.experienceLevelId && <span className="error-message">{errors.experienceLevelId}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Province</label>
          <select
            name="provinceName"
            className="chosen-single form-select"
            value={formData.provinceName}
            onChange={handleInputChange}
          >
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province.code} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.provinceName && <span className="error-message">{errors.provinceName}</span>}
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Address Detail</label>
          <input
            type="text"
            name="addressDetail"
            value={formData.addressDetail}
            onChange={handleInputChange}
          />
          {errors.addressDetail && <span className="error-message">{errors.addressDetail}</span>}
        </div>

        {isEditing && (
          <div className="form-group col-lg-6 col-md-12">
            <label>Status</label>
            <select
              name="status"
              className="chosen-single form-select"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isStatusSelectDisabled}
            >
              {formData.status === "Pending" && <option value="Pending">Pending</option>}
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {isStatusSelectDisabled && (
              <small className="form-text text-danger">You do not have permission to change when the job is in Pending status.</small>
            )}
          </div>
        )}

        <div className="form-group col-lg-12 col-md-12 text-right">
          <button type="submit" className="theme-btn btn-style-one">
            {isEditing ? "Update Job" : "Post Job"}
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
          >
            <motion.div 
              className="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '100%'
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Clear Draft</h3>
                <p>Are you sure you want to clear all information? This action cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="theme-btn btn-style-two"
                    onClick={handleCancelClear}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={handleConfirmClear}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirmation && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
          >
            <motion.div 
              className="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '100%'
              }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Unsaved Changes</h3>
                <p>You have unsaved changes. Are you sure you want to leave?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="theme-btn btn-style-two"
                    onClick={handleStay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Stay
                  </motion.button>
                  <motion.button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={handleLeave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Leave
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', padding: 32, width: '100%', maxWidth: '350px', minWidth: '0' }}>
            <h2 style={{ color: 'green' }}>Success!</h2>
            <p>Job {isEditing ? 'updated' : 'posted'} successfully!</p>
            <button
              style={{
                background: '#0d47a1',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 32px',
                fontSize: 18,
                marginTop: 16,
                cursor: 'pointer'
              }}
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.form>
  );
};

export default PostBoxForm;