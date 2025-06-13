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
import { motion, AnimatePresence } from "framer-motion";

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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [intendedPath, setIntendedPath] = useState(null);
  const DRAFT_KEY = 'job_post_draft';

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const [clearSuccess, setClearSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  // Load draft data on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Check if form has actual changes
  const hasActualChanges = () => {
    return formData.title || 
           formData.description || 
           formData.salary || 
           formData.industryId || 
           formData.levelId || 
           formData.jobTypeId || 
           formData.experienceLevelId || 
           formData.expiryDate || 
           formData.timeStart || 
           formData.timeEnd || 
           formData.provinceName || 
           formData.addressDetail;
  };

  // Handle navigation away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && hasActualChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.href.startsWith('javascript:') && hasUnsavedChanges && hasActualChanges()) {
        e.preventDefault();
        e.stopPropagation();
        setShowLeaveConfirmation(true);
        setIntendedPath(anchor.href);
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleClearDraft = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    localStorage.removeItem(DRAFT_KEY);
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
    setHasUnsavedChanges(false);
    setErrors({});
    setError("");
    setSuccess(false);
    setShowClearConfirm(false);
    
    // Show temporary success message
    setClearSuccess(true);
    setTimeout(() => {
      setClearSuccess(false);
    }, 2000);
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  const handleLeave = () => {
    setShowLeaveConfirmation(false);
    if (intendedPath) {
      window.location.href = intendedPath;
    }
  };

  const handleStay = (e) => {
    // Prevent form submission
    e.preventDefault();
    setShowLeaveConfirmation(false);
    setIntendedPath(null);
    setErrors({});
  };

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
    
    // Don't proceed with submission if showing leave confirmation
    if (showLeaveConfirmation) {
      return;
    }

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
      // Clear draft after successful submission
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
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
      console.error("API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to create job. Please try again.");
    }
  };

  // Auto-save draft when form data changes
  useEffect(() => {
    if (hasActualChanges()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  return (
    <motion.form 
      className="default-form" 
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="row">
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
          {success && (
            <motion.div 
              className="message-box success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              Job posted successfully!
            </motion.div>
          )}
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

        {/* Job Title */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Job Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter job title" 
            className={errors.title ? 'form-control is-invalid' : 'form-control'}
            disabled={isLoading}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </motion.div>

        {/* Job Description */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
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
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </motion.div>

        {/* Salary */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Salary</label>
          <input 
            type="number" 
            name="salary" 
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="Enter salary amount"
            className={errors.salary ? 'form-control is-invalid' : 'form-control'}
            disabled={isLoading}
          />
          {errors.salary && <div className="invalid-feedback">{errors.salary}</div>}
        </motion.div>

        {/* Industry */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Industry</label>
          <select 
            name="industryId" 
            value={formData.industryId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.industryId ? 'is-invalid' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Industry</option>
            {industries.map(ind => (
              <option key={ind.industryId} value={ind.industryId}>{ind.industryName}</option>
            ))}
          </select>
          {errors.industryId && <div className="invalid-feedback">{errors.industryId}</div>}
        </motion.div>

        {/* Job Level */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Job Level</label>
          <select 
            name="levelId" 
            value={formData.levelId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.levelId ? 'is-invalid' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Level</option>
            {levels.map((level, idx) => (
              <option key={level.id || idx} value={level.id}>{level.levelName}</option>
            ))}
          </select>
          {errors.levelId && <div className="invalid-feedback">{errors.levelId}</div>}
        </motion.div>

        {/* Job Type */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Job Type</label>
          <select 
            name="jobTypeId" 
            value={formData.jobTypeId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.jobTypeId ? 'is-invalid' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Job Type</option>
            {jobTypes.map(type => (
              <option key={type.id} value={type.id}>{type.jobTypeName}</option>
            ))}
          </select>
          {errors.jobTypeId && <div className="invalid-feedback">{errors.jobTypeId}</div>}
        </motion.div>

        {/* Experience Level */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Experience Level</label>
          <select 
            name="experienceLevelId" 
            value={formData.experienceLevelId}
            onChange={handleInputChange}
            className={`chosen-single form-select ${errors.experienceLevelId ? 'is-invalid' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Experience Level</option>
            {experienceLevels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
          {errors.experienceLevelId && <div className="invalid-feedback">{errors.experienceLevelId}</div>}
        </motion.div>

        {/* Expiry Date */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Application Deadline</label>
          <input 
            type="date" 
            name="expiryDate" 
            value={formData.expiryDate}
            onChange={handleInputChange}
            className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
            disabled={isLoading}
          />
          {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
        </motion.div>

        {/* Time Start */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Start Date</label>
          <input 
            type="date" 
            name="timeStart" 
            value={formData.timeStart}
            onChange={handleInputChange}
            className={`form-control ${errors.timeStart ? 'is-invalid' : ''}`}
            disabled={isLoading}
          />
          {errors.timeStart && <div className="invalid-feedback">{errors.timeStart}</div>}
        </motion.div>

        {/* Time End */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>End Date</label>
          <input 
            type="date" 
            name="timeEnd" 
            value={formData.timeEnd}
            onChange={handleInputChange}
            className={`form-control ${errors.timeEnd ? 'is-invalid' : ''}`}
            disabled={isLoading}
          />
          {errors.timeEnd && <div className="invalid-feedback">{errors.timeEnd}</div>}
        </motion.div>

        {/* Province Name */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Province</label>
          <select 
            name="provinceName" 
            value={formData.provinceName}
            onChange={handleInputChange}
            className={`form-select ${errors.provinceName ? 'is-invalid' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select Province</option>
            {provinces.map(p => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
          {errors.provinceName && <div className="invalid-feedback">{errors.provinceName}</div>}
        </motion.div>

        {/* Address Detail */}
        <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
          <label>Address Detail</label>
          <input 
            type="text" 
            name="addressDetail" 
            value={formData.addressDetail}
            onChange={handleInputChange}
            placeholder="Enter address detail"
            className={`form-control ${errors.addressDetail ? 'is-invalid' : ''}`}
            disabled={isLoading}
          />
          {errors.addressDetail && <div className="invalid-feedback">{errors.addressDetail}</div>}
        </motion.div>

        {/* Image File Input */}
        

        {/* Submit Button */}
        <motion.div 
          className="form-group col-lg-12 col-md-12 text-right"
          variants={itemVariants}
        >
          <motion.button 
            type="submit" 
            className="theme-btn btn-style-one"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'Posting...' : 'Post Job'}
          </motion.button>
        </motion.div>
      </div>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirmation && (
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
        )}
      </AnimatePresence>

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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
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
              <h3>Success!</h3>
              <p>Your job has been posted successfully.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <motion.button
                  className="theme-btn btn-style-one"
                  onClick={() => setShowSuccessModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default PostBoxForm;