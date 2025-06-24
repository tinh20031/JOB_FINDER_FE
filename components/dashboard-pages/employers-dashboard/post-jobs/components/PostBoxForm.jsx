'use client'

import Map from "../../../Map";
import { useState, useEffect } from "react";
// import Map from "../../../Map";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import { useRouter } from 'next/navigation';
import ApiService from "../../../../../services/api.service";
import { authService } from "../../../../../services/authService";
import API_CONFIG from "../../../../../config/api.config";
import Cookies from "js-cookie";
import axios from "axios";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";

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
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    education: '',
    companyId: 0,
    isSalaryNegotiable: false,
    minSalary: null,
    maxSalary: null,
    industryId: 0,
    expiryDate: '',
    levelId: 0,
    jobTypeId: 0,
    experienceLevelId: 0,
    timeStart: '',
    timeEnd: '',
    provinceName: '',
    addressDetail: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    YourSkill: '',
    YourExperience: '',
    DescriptionWeight: '',
    SkillsWeight: '',
    ExperienceWeight: '',
    EducationWeight: '',
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

  // Get user information from localStorage or cookies
  const [user, setUser] = useState(null);
  const [isFormBeingReset, setIsFormBeingReset] = useState(false);

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

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    Promise.all([
      ApiService.get(API_CONFIG.ENDPOINTS.LEVEL),
      ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE),
      ApiService.get(API_CONFIG.ENDPOINTS.EXPERIENCE_LEVEL),
      ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY),
      axios.get("https://provinces.open-api.vn/api/p/")
    ]).then(([levels, jobTypes, experienceLevels, industries, provinces]) => {
      setLevels(levels);
      setJobTypes(jobTypes);
      setExperienceLevels(experienceLevels);
      setIndustries(industries);
      setProvinces(provinces.data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
    // Get userId from localStorage or cookies
    const userId = localStorage.getItem('userId') || Cookies.get('userId');
    const userRole = localStorage.getItem('role') || Cookies.get('role');
    setUser({ userId: userId ? parseInt(userId, 10) : 0, role: userRole });
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
           formData.education ||
           formData.minSalary || 
           formData.maxSalary || 
           formData.industryId || 
           formData.levelId || 
           formData.jobTypeId || 
           formData.experienceLevelId || 
           formData.expiryDate || 
           formData.timeStart || 
           formData.timeEnd || 
           formData.provinceName || 
           formData.addressDetail ||
           formData.YourSkill ||
           formData.YourExperience ||
           formData.DescriptionWeight ||
           formData.SkillsWeight ||
           formData.ExperienceWeight ||
           formData.EducationWeight;
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
      title: '',
      description: '',
      education: '',
      companyId: 0,
      isSalaryNegotiable: false,
      minSalary: null,
      maxSalary: null,
      industryId: 0,
      expiryDate: '',
      levelId: 0,
      jobTypeId: 0,
      experienceLevelId: 0,
      timeStart: '',
      timeEnd: '',
      provinceName: '',
      addressDetail: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      YourSkill: '',
      YourExperience: '',
      DescriptionWeight: '',
      SkillsWeight: '',
      ExperienceWeight: '',
      EducationWeight: '',
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
    setHasUnsavedChanges(false);
    if (intendedPath) {
      router.push(intendedPath);
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
    if (!formData.education.trim()) {
      newErrors.education = 'Education requirements are required';
    }
    if (!formData.minSalary && !formData.maxSalary && !formData.isSalaryNegotiable) {
      newErrors.minSalary = 'Minimum salary is required if not negotiable';
      newErrors.maxSalary = 'Maximum salary is required if not negotiable';
    }
    if (formData.minSalary && formData.maxSalary && formData.minSalary > formData.maxSalary) {
      newErrors.minSalary = 'Min salary cannot be greater than Max salary';
      newErrors.maxSalary = 'Max salary cannot be less than Min salary';
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
    if (!formData.YourSkill.trim()) {
      newErrors.YourSkill = 'Skills are required';
    }
    if (!formData.YourExperience.trim()) {
      newErrors.YourExperience = 'Experience is required';
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

    // Validate trọng số không được rỗng, không NaN
    if (formData.DescriptionWeight === '' || isNaN(Number(formData.DescriptionWeight))) {
      newErrors.DescriptionWeight = 'Vui lòng nhập Description Weight';
    }
    if (formData.SkillsWeight === '' || isNaN(Number(formData.SkillsWeight))) {
      newErrors.SkillsWeight = 'Vui lòng nhập Skills Weight';
    }
    if (formData.ExperienceWeight === '' || isNaN(Number(formData.ExperienceWeight))) {
      newErrors.ExperienceWeight = 'Vui lòng nhập Experience Weight';
    }
    if (formData.EducationWeight === '' || isNaN(Number(formData.EducationWeight))) {
      newErrors.EducationWeight = 'Vui lòng nhập Education Weight';
    }
    // Validate tổng trọng số = 100
    const totalWeight =
      Number(formData.DescriptionWeight || 0) +
      Number(formData.SkillsWeight || 0) +
      Number(formData.ExperienceWeight || 0) +
      Number(formData.EducationWeight || 0);
    if (
      formData.DescriptionWeight !== '' &&
      formData.SkillsWeight !== '' &&
      formData.ExperienceWeight !== '' &&
      formData.EducationWeight !== '' &&
      totalWeight !== 100
    ) {
      newErrors.DescriptionWeight = 'Tổng các trọng số phải bằng 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ([
      'DescriptionWeight',
      'SkillsWeight',
      'ExperienceWeight',
      'EducationWeight',
    ].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }
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
    
    if (showLeaveConfirmation) {
      return;
    }

    console.log("Submit clicked", formData, user);
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      setError("Please fill in all required fields!");
      return;
    }

    if (!user?.userId || user.role !== 'Company') {
      setError("You must log in with a company account to post a job.");
      return;
    }

    console.log("Type of user.userId before jobData:", typeof user.userId, user.userId);

    try {
      // Create job first
      const jobData = {
        title: formData.title,
        description: formData.description,
        education: formData.education,
        companyId: parseInt(user.userId, 10), // Ensure companyId is an integer here
        isSalaryNegotiable: formData.isSalaryNegotiable,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        industryId: formData.industryId,
        expiryDate: formData.expiryDate,
        levelId: formData.levelId,
        jobTypeId: formData.jobTypeId,
        experienceLevelId: formData.experienceLevelId,
        timeStart: formData.timeStart,
        timeEnd: formData.timeEnd,
        provinceName: formData.provinceName,
        addressDetail: formData.addressDetail,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
        YourSkill: formData.YourSkill,
        YourExperience: formData.YourExperience,
        DescriptionWeight: Number(formData.DescriptionWeight),
        SkillsWeight: Number(formData.SkillsWeight),
        ExperienceWeight: Number(formData.ExperienceWeight),
        EducationWeight: Number(formData.EducationWeight),
      };

      console.log("Sending job data:", jobData);
      const jobResult = await ApiService.createJob(jobData);
      console.log("Job creation response:", jobResult);
      
      setSuccess(true);
      setShowSuccessModal(true);
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
      setFormData({
        title: '',
        description: '',
        education: '',
        companyId: 0,
        isSalaryNegotiable: false,
        minSalary: null,
        maxSalary: null,
        industryId: 0,
        expiryDate: '',
        levelId: 0,
        jobTypeId: 0,
        experienceLevelId: 0,
        timeStart: '',
        timeEnd: '',
        provinceName: '',
        addressDetail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        YourSkill: '',
        YourExperience: '',
        DescriptionWeight: '',
        SkillsWeight: '',
        ExperienceWeight: '',
        EducationWeight: '',
      });
      setErrors({});
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
    } else {
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
    }
  }, [formData]);

  if (isLoading) {
    return (
      <div className="skeleton-loader">
        <div className="skeleton-line long"></div>
        <div className="skeleton-line short"></div>
        <div className="skeleton-line large"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
      </div>
    );
  }

  return (
    <>
      {/* Leave Confirmation Modal */}
      <Modal
        open={showLeaveConfirmation}
        onClose={handleStay}
        title="Unsaved Changes"
        footer={
          <>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleStay}
            >
              Stay
            </button>
            <button
              type="button"
              className="btn-confirm"
              onClick={handleLeave}
              style={{ marginLeft: 8 }}
            >
              Leave
            </button>
          </>
        }
      >
        <p>You have unsaved changes. Are you sure you want to leave?</p>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        open={showClearConfirm}
        onClose={handleCancelClear}
        title="Clear Draft"
        footer={
          <>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancelClear}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-confirm"
              onClick={handleConfirmClear}
              style={{ marginLeft: 8 }}
            >
              Clear
            </button>
          </>
        }
      >
        <p>Are you sure you want to clear all information? This action cannot be undone.</p>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        footer={
          <button
            className="btn-confirm"
            onClick={e => {
              e.preventDefault();
              setShowSuccessModal(false);
              setFormData({
                title: '',
                description: '',
                education: '',
                companyId: 0,
                isSalaryNegotiable: false,
                minSalary: null,
                maxSalary: null,
                industryId: 0,
                expiryDate: '',
                levelId: 0,
                jobTypeId: 0,
                experienceLevelId: 0,
                timeStart: '',
                timeEnd: '',
                provinceName: '',
                addressDetail: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                YourSkill: '',
                YourExperience: '',
                DescriptionWeight: '',
                SkillsWeight: '',
                ExperienceWeight: '',
                EducationWeight: '',
              });
              setErrors({});
            }}
          >
            Close
          </button>
        }
      >
        <p>Job posted successfully!</p>
      </Modal>

      {/* Form chính */}
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
                className={`job-description-quill ${errors.description ? 'is-invalid' : ''}`}
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

          {/* Education Requirements */}
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
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
                className={`job-description-quill ${errors.education ? 'is-invalid' : ''}`}
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
            {errors.education && <div className="invalid-feedback">{errors.education}</div>}
          </motion.div>

          {/* Your Skills */}
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
            <label>Skills</label>
            {isClient ? (
              <ReactQuill
                theme="snow"
                value={formData.YourSkill}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    YourSkill: value,
                  }));
                  // Clear error when user starts typing
                  if (errors.YourSkill) {
                    setErrors(prev => ({
                      ...prev,
                      YourSkill: ''
                    }));
                  }
                }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet', 'indent',
                  'link', 'image'
                ]}
                className={`job-description-quill ${errors.YourSkill ? 'is-invalid' : ''}`}
              />
            ) : (
              <textarea
                name="YourSkill"
                placeholder="Describe the required skills for this position..."
                value={formData.YourSkill}
                onChange={handleInputChange}
                rows="8"
                className={errors.YourSkill ? 'form-control is-invalid' : 'form-control'}
              ></textarea>
            )}
            {errors.YourSkill && <div className="invalid-feedback">{errors.YourSkill}</div>}
          </motion.div>

          {/* Your Experience */}
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
            <label>Experience</label>
            {isClient ? (
              <ReactQuill
                theme="snow"
                value={formData.YourExperience}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    YourExperience: value,
                  }));
                  // Clear error when user starts typing
                  if (errors.YourExperience) {
                    setErrors(prev => ({
                      ...prev,
                      YourExperience: ''
                    }));
                  }
                }}
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
                  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet', 'indent',
                  'link', 'image'
                ]}
                className={`job-description-quill ${errors.YourExperience ? 'is-invalid' : ''}`}
              />
            ) : (
              <textarea
                name="YourExperience"
                placeholder="Describe the required skills and experience for this position..."
                value={formData.YourExperience}
                onChange={handleInputChange}
                rows="8"
                className={errors.YourExperience ? 'form-control is-invalid' : 'form-control'}
              ></textarea>
            )}
            {errors.YourExperience && <div className="invalid-feedback">{errors.YourExperience}</div>}
          </motion.div>

          {/* Salary Section */}
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
            <label>Salary</label>
            <div className="d-flex flex-wrap mb-3" style={{ gap: '20px' }}>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="salaryNegotiableRadio"
                  name="salaryOption"
                  value="negotiable"
                  checked={formData.isSalaryNegotiable}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isSalaryNegotiable: true,
                      minSalary: null,
                      maxSalary: null
                    }));
                    setErrors(prev => ({ ...prev, minSalary: '', maxSalary: '' }));
                  }}
                />
                <label className="form-check-label" htmlFor="salaryNegotiableRadio">
                  Negotiable Salary
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="salarySpecificRadio"
                  name="salaryOption"
                  value="specific"
                  checked={!formData.isSalaryNegotiable}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isSalaryNegotiable: false,
                    }));
                  }}
                />
                <label className="form-check-label" htmlFor="salarySpecificRadio">
                  Specific Salary
                </label>
              </div>
            </div>
          </motion.div>

          {!formData.isSalaryNegotiable && (
            <>
              <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
                <label>Min Salary</label>
                <input 
                  type="number" 
                  name="minSalary" 
                  value={formData.minSalary || ''}
                  onChange={handleInputChange}
                  placeholder="Enter min salary"
                  className={errors.minSalary ? 'form-control is-invalid' : 'form-control'}
                  disabled={isLoading}
                />
                {errors.minSalary && <div className="invalid-feedback">{errors.minSalary}</div>}
              </motion.div>

              <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
                <label>Max Salary</label>
                <input 
                  type="number" 
                  name="maxSalary" 
                  value={formData.maxSalary || ''}
                  onChange={handleInputChange}
                  placeholder="Enter Max salary"
                  className={errors.maxSalary ? 'form-control is-invalid' : 'form-control'}
                  disabled={isLoading}
                />
                {errors.maxSalary && <div className="invalid-feedback">{errors.maxSalary}</div>}
              </motion.div>
            </>
          )}

          {formData.isSalaryNegotiable && (
            <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
              <div className="alert alert-info" role="alert">
                You have selected wage agreement, specific salary cannot be entered.
              </div>
            </motion.div>
          )}

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

          {/* Time Start */}
          <motion.div className="form-group col-lg-4 col-md-6 col-sm-12" variants={itemVariants}>
            <label>Start Date</label>
            <input 
              type="date" 
              name="timeStart" 
              value={formData.timeStart}
              onChange={handleInputChange}
              className={`custom-date-input form-select ${errors.timeStart ? 'is-invalid' : ''}`}
              disabled={isLoading}
            />
            {errors.timeStart && <div className="invalid-feedback">{errors.timeStart}</div>}
          </motion.div>

          {/* Time End */}
          <motion.div className="form-group col-lg-4 col-md-6 col-sm-12" variants={itemVariants}>
            <label>End Date</label>
            <input 
              type="date" 
              name="timeEnd" 
              value={formData.timeEnd}
              onChange={handleInputChange}
              className={`custom-date-input form-select ${errors.timeEnd ? 'is-invalid' : ''}`}
              disabled={isLoading}
            />
            {errors.timeEnd && <div className="invalid-feedback">{errors.timeEnd}</div>}
          </motion.div>

          {/* Expiry Date */}
          <motion.div className="form-group col-lg-4 col-md-6 col-sm-12" variants={itemVariants}>
            <label>Application Deadline</label>
            <input 
              type="date" 
              name="expiryDate" 
              value={formData.expiryDate}
              onChange={handleInputChange}
              className={`custom-date-input form-select ${errors.expiryDate ? 'is-invalid' : ''}`}
              disabled={isLoading}
            />
            {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
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

          {/* Trọng số các trường */}
          <motion.div className="form-group col-lg-3 col-md-6" variants={itemVariants}>
            <label>Description Weight (%)</label>
            <input
              type="number"
              name="DescriptionWeight"
              value={formData.DescriptionWeight}
              min={0}
              max={100}
              onChange={handleInputChange}
              className={`form-control${errors.DescriptionWeight ? ' is-invalid' : ''}`}
              placeholder="Enter description weight (%)"
            />
            {errors.DescriptionWeight && <div className="invalid-feedback" style={{display:'block'}}>{errors.DescriptionWeight}</div>}
          </motion.div>
          <motion.div className="form-group col-lg-3 col-md-6" variants={itemVariants}>
            <label>Skills Weight (%)</label>
            <input
              type="number"
              name="SkillsWeight"
              value={formData.SkillsWeight}
              min={0}
              max={100}
              onChange={handleInputChange}
              className={`form-control${errors.SkillsWeight ? ' is-invalid' : ''}`}
              placeholder="Enter skills weight (%)"
            />
            {errors.SkillsWeight && <div className="invalid-feedback" style={{display:'block'}}>{errors.SkillsWeight}</div>}
          </motion.div>
          <motion.div className="form-group col-lg-3 col-md-6" variants={itemVariants}>
            <label>Experience Weight (%)</label>
            <input
              type="number"
              name="ExperienceWeight"
              value={formData.ExperienceWeight}
              min={0}
              max={100}
              onChange={handleInputChange}
              className={`form-control${errors.ExperienceWeight ? ' is-invalid' : ''}`}
              placeholder="Enter experience weight (%)"
            />
            {errors.ExperienceWeight && <div className="invalid-feedback" style={{display:'block'}}>{errors.ExperienceWeight}</div>}
          </motion.div>
          <motion.div className="form-group col-lg-3 col-md-6" variants={itemVariants}>
            <label>Education Weight (%)</label>
            <input
              type="number"
              name="EducationWeight"
              value={formData.EducationWeight}
              min={0}
              max={100}
              onChange={handleInputChange}
              className={`form-control${errors.EducationWeight ? ' is-invalid' : ''}`}
              placeholder="Enter education weight (%)"
            />
            {errors.EducationWeight && <div className="invalid-feedback" style={{display:'block'}}>{errors.EducationWeight}</div>}
          </motion.div>

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
      </motion.form>
    </>
  );
};

export default PostBoxForm;