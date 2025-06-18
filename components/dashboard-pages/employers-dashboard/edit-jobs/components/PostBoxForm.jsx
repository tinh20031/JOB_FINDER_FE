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
    isSalaryNegotiable: false,
    minSalary: '',
    maxSalary: '',
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
    status: 0 // 0: Pending, 1: Active, 2: Inactive
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

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    ApiService.get(API_CONFIG.ENDPOINTS.LEVEL).then(setLevels);
    ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE).then(setJobTypes);
    ApiService.get(API_CONFIG.ENDPOINTS.EXPERIENCE_LEVEL).then(setExperienceLevels);
    ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY).then(setIndustries);
    ApiService.get(API_CONFIG.ENDPOINTS.SKILLS).then(setAvailableSkills);
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(res => setProvinces(res.data))
      .catch(() => setProvinces([]));
    // Lấy userId từ localStorage hoặc cookies
    const userId = localStorage.getItem('userId') || Cookies.get('userId');
    const userRole = localStorage.getItem('role') || Cookies.get('role');
    setUser({ userId, role: userRole });

    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        jobId: initialData.jobId || initialData.id,
        YourSkill: initialData.YourSkill || '',
        YourExperience: initialData.YourExperience || '',
        isSalaryNegotiable: initialData.isSalaryNegotiable || false,
        minSalary: initialData.minSalary || '',
        maxSalary: initialData.maxSalary || '',
        industryId: initialData.industryId || 0,
        levelId: initialData.levelId || 0,
        jobTypeId: initialData.jobTypeId || 0,
        experienceLevelId: initialData.experienceLevelId || 0,
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        timeStart: initialData.timeStart ? initialData.timeStart.split('T')[0] : '',
        timeEnd: initialData.timeEnd ? initialData.timeEnd.split('T')[0] : '',
        status: typeof initialData.status === 'number' ? initialData.status : 0
      });

      if (initialData.Skills && Array.isArray(initialData.Skills)) {
        setSelectedSkills(initialData.Skills.map(skill => ({
          skillId: skill.skillId,
          skillName: skill.skillName
        })));
      }
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
    if (!formData.YourSkill.trim()) {
      newErrors.YourSkill = 'Skills are required';
    }
    if (!formData.YourExperience.trim()) {
      newErrors.YourExperience = 'Experience is required';
    }
    if (selectedSkills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    // Validate salary based on negotiation status
    if (!formData.isSalaryNegotiable) {
      if (!formData.minSalary || formData.minSalary.trim() === '' || isNaN(formData.minSalary)) {
        newErrors.minSalary = 'Min Salary is required';
      }
      if (!formData.maxSalary || formData.maxSalary.trim() === '' || isNaN(formData.maxSalary)) {
        newErrors.maxSalary = 'Max Salary is required';
      }
      if (formData.minSalary && formData.maxSalary && parseFloat(formData.minSalary) > parseFloat(formData.maxSalary)) {
        newErrors.maxSalary = 'Max Salary must be greater than Min Salary';
      }
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
    setIsLoading(true);

    if (!validateForm()) {
      setError("Please fill in all information!");
      setIsLoading(false);
      return;
    }

    if (!user?.userId || user.role !== 'Company') {
      setError("Bạn phải đăng nhập bằng tài khoản công ty để đăng tin tuyển dụng.");
      setIsLoading(false);
      return;
    }

    // Check if job is expired (for editing mode)
    if (isEditing && initialData) {
      const timeEnd = new Date(initialData.timeEnd);
      const now = new Date();
      if (timeEnd < now) {
        setError("Cannot edit job that has already expired.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Chuẩn bị dữ liệu theo format backend mong đợi
      const jobData = {
        title: formData.title,
        description: formData.description,
        education: formData.education,
        yourSkill: formData.YourSkill,
        yourExperience: formData.YourExperience,
        isSalaryNegotiable: formData.isSalaryNegotiable,
        minSalary: formData.isSalaryNegotiable ? null : (formData.minSalary && formData.minSalary.trim() !== '' ? parseFloat(formData.minSalary) : null),
        maxSalary: formData.isSalaryNegotiable ? null : (formData.maxSalary && formData.maxSalary.trim() !== '' ? parseFloat(formData.maxSalary) : null),
        industryId: formData.industryId,
        levelId: formData.levelId,
        jobTypeId: formData.jobTypeId,
        experienceLevelId: formData.experienceLevelId,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : '',
        timeStart: new Date(formData.timeStart).toISOString(),
        timeEnd: new Date(formData.timeEnd).toISOString(),
        provinceName: formData.provinceName,
        addressDetail: formData.addressDetail,
        skillInputs: selectedSkills.map(skill => ({
          skillId: skill.skillId,
          skillName: skill.skillName
        }))
      };

      if (isEditing) {
        // Nếu user chỉ đổi status (không chỉnh nội dung), gọi API đổi status
        if ((formData.status !== initialData.status) && !hasActualChanges() && (initialData.status === 1 || initialData.status === 2)) {
          const statusStr = formData.status === 1 ? 'active' : 'inactive';
          await ApiService.request(
            `Job/${formData.jobId || formData.id}/status?newStatus=${statusStr}`,
            'PUT'
          );
          setSuccess(true);
          setShowSuccessModal(true);
        } else {
          // Cập nhật job - sử dụng JSON thay vì FormData
          await ApiService.request(`Job/${formData.jobId || formData.id}`, 'PUT', jobData);
          // Không gọi API đổi status sau khi update nội dung, vì job sẽ về pending
          setSuccess(true);
          setShowSuccessModal(true);
        }
      } else {
        // Tạo job mới
        jobData.companyId = Number(user.userId);
        await ApiService.createJob(jobData);
        setSuccess(true);
        setShowSuccessModal(true);
      }

      // Clear draft sau khi submit thành công
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
      
      // Optionally reset form if creating a new job
      if (!isEditing) {
        setFormData({
          jobId: 0,
          title: '',
          description: '',
          education: '',
          companyId: 0,
          isSalaryNegotiable: false,
          minSalary: '',
          maxSalary: '',
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
          status: 0
        });
        setSelectedSkills([]);
        setSelectedImage(null);
        setImagePreviewUrl(null);
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

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
    // Original initialData is needed to compare
    if (!initialData) {
      // If no initialData (i.e., new job post), then any non-empty field counts as a change
    return formData.title.trim() !== '' || 
           formData.description.trim() !== '' ||
           formData.education.trim() !== '' ||
             formData.YourSkill.trim() !== '' ||
             formData.YourExperience.trim() !== '' ||
             selectedSkills.length > 0 ||
             formData.minSalary.trim() !== '' ||
             formData.maxSalary.trim() !== '' ||
             formData.isSalaryNegotiable !== false ||
           formData.industryId !== 0 ||
           formData.levelId !== 0 ||
           formData.jobTypeId !== 0 ||
           formData.experienceLevelId !== 0 ||
           formData.expiryDate !== '' ||
           formData.timeStart !== '' ||
           formData.timeEnd !== '' ||
           formData.provinceName !== '' ||
           formData.addressDetail !== '';
    }

    // For editing existing job, compare with initialData
    const initialMinSalary = initialData.isSalaryNegotiable ? '' : (initialData.minSalary || '');
    const initialMaxSalary = initialData.isSalaryNegotiable ? '' : (initialData.maxSalary || '');
    const currentMinSalary = formData.isSalaryNegotiable ? '' : (formData.minSalary || '');
    const currentMaxSalary = formData.isSalaryNegotiable ? '' : (formData.maxSalary || '');

    const initialSkills = initialData.Skills ? initialData.Skills.map(s => s.skillName).sort().join('|') : '';
    const currentSkills = selectedSkills.map(s => s.skillName).sort().join('|');

    return formData.title !== (initialData.title || '') ||
           formData.description !== (initialData.description || '') ||
           formData.education !== (initialData.education || '') ||
           formData.YourSkill !== (initialData.YourSkill || '') ||
           formData.YourExperience !== (initialData.YourExperience || '') ||
           formData.isSalaryNegotiable !== (initialData.isSalaryNegotiable || false) ||
           currentMinSalary !== initialMinSalary ||
           currentMaxSalary !== initialMaxSalary ||
           currentSkills !== initialSkills ||
           formData.industryId !== (initialData.industryId || 0) ||
           formData.levelId !== (initialData.levelId || 0) ||
           formData.jobTypeId !== (initialData.jobTypeId || 0) ||
           formData.experienceLevelId !== (initialData.experienceLevelId || 0) ||
           (formData.expiryDate ? formData.expiryDate.split('T')[0] : '') !== (initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '') ||
           (formData.timeStart ? formData.timeStart.split('T')[0] : '') !== (initialData.timeStart ? initialData.timeStart.split('T')[0] : '') ||
           (formData.timeEnd ? formData.timeEnd.split('T')[0] : '') !== (initialData.timeEnd ? initialData.timeEnd.split('T')[0] : '') ||
           formData.provinceName !== (initialData.provinceName || '') ||
           formData.addressDetail !== (initialData.addressDetail || '');
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
      jobId: 0,
      title: '',
      description: '',
      education: '',
      companyId: 0,
      isSalaryNegotiable: false,
      minSalary: '',
      maxSalary: '',
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
      status: 0
    });
    setSelectedSkills([]);
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
              key={formData.jobId + "-description"}
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
              key={formData.jobId + "-education"}
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
              className={errors.education ? 'form-control is-invalid' : 'form-control'}
            ></textarea>
          )}
          {errors.education && <span className="error-message invalid-feedback d-block">{errors.education}</span>}
        </div>

        {/* Your Skills */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Skills</label>
          {isClient ? (
            <ReactQuill
              key={formData.jobId + "-your-skill"}
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
              placeholder="Describe your skills for this position..."
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
              key={formData.jobId + "-your-experience"}
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
                'header',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link', 'image'
              ]}
              className={`job-description-quill ${errors.YourExperience ? 'is-invalid' : ''}`}
            />
          ) : (
            <textarea
              name="YourExperience"
              placeholder="Describe your experience for this position..."
              value={formData.YourExperience}
            onChange={handleInputChange}
              rows="8"
              className={errors.YourExperience ? 'form-control is-invalid' : 'form-control'}
            ></textarea>
          )}
          {errors.YourExperience && <span className="invalid-feedback d-block">{errors.YourExperience}</span>}
        </motion.div>

        {/* Skills */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Required Skills (Tag)</label>
          {isClient ? (
            <CreatableSelect
              isMulti
              options={availableSkills.map(skill => ({
                value: skill.skillId,
                label: skill.skillName
              }))}
              value={selectedSkills.map(skill => ({
                value: skill.skillId,
                label: skill.skillName
              }))}
              onChange={(newValue) => {
                const skillsArray = newValue.map(option => ({
                  skillId: option.value ? parseInt(option.value, 10) : null,
                  skillName: option.label
                }));
                setSelectedSkills(skillsArray);
              }}
              onCreateOption={(inputValue) => {
                const newSkill = {
                  skillId: null,
                  skillName: inputValue
                };
                setSelectedSkills(prev => [...prev, newSkill]);
              }}
              placeholder="Select or enter skills..."
              className="basic-multi-select"
              classNamePrefix="select"
              isClearable
              isSearchable
              noOptionsMessage={() => "No skills found"}
              formatCreateLabel={(inputValue) => `Create skill "${inputValue}"`}
              menuPortalTarget={document.body}
              menuShouldScrollIntoView={true}
              maxMenuHeight={190}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '42px',
                  borderColor: errors.skills ? '#dc3545' : '#ced4da',
                  '&:hover': {
                    borderColor: errors.skills ? '#dc3545' : '#ced4da'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999 
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#e9ecef',
                  borderRadius: '0.25rem'
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#212529',
                  padding: '0.25rem 0.5rem'
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#212529',
                  ':hover': {
                    backgroundColor: '#dee2e6',
                    color: '#212529'
                  }
                })
              }}
            />
          ) : (
            <input
              type="text"
              placeholder="Required Skills (Loading...)"
              className="form-control"
              disabled
            />
          )}
          {errors.skills && <span className="error-message invalid-feedback d-block">{errors.skills}</span>}
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
                    minSalary: '',
                    maxSalary: ''
                  }));
                  setErrors(prev => ({ ...prev, minSalary: '', maxSalary: '' }));
                }}
                style={{ width: '16px', height: '16px', flexShrink: 0 }}
              />
              <label className="form-check-label" htmlFor="salaryNegotiableRadio">
                Wage Agreement
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
                style={{ width: '16px', height: '16px', flexShrink: 0 }}
              />
              <label className="form-check-label" htmlFor="salarySpecificRadio">
                Specific Salary
              </label>
            </div>
          </div>
        </motion.div>

        {formData.isSalaryNegotiable && (
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
            <div className="alert alert-info" role="alert">
              You have selected wage agreement, specific salary cannot be entered.
            </div>
          </motion.div>
        )}

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
              {errors.minSalary && <div className="invalid-feedback d-block">{errors.minSalary}</div>}
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
              {errors.maxSalary && <div className="invalid-feedback d-block">{errors.maxSalary}</div>}
            </motion.div>
          </>
        )}

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

        {/* Date Fields */}
        <div className="form-group col-lg-12 col-md-12">
          <div className="row">
            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>Start Date</label>
              <input
                type="date"
                name="timeStart"
                value={formData.timeStart}
                onChange={handleInputChange}
                className={`custom-date-input form-select ${errors.timeStart ? 'is-invalid' : ''}`}
              />
              {errors.timeStart && <span className="error-message invalid-feedback d-block">{errors.timeStart}</span>}
            </div>

            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>End Date</label>
              <input
                type="date"
                name="timeEnd"
                value={formData.timeEnd}
                onChange={handleInputChange}
                className={`custom-date-input form-select ${errors.timeEnd ? 'is-invalid' : ''}`}
              />
              {errors.timeEnd && <span className="error-message invalid-feedback d-block">{errors.timeEnd}</span>}
            </div>

            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>Application Deadline</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`custom-date-input form-select ${errors.expiryDate ? 'is-invalid' : ''}`}
              />
              {errors.expiryDate && <span className="error-message invalid-feedback d-block">{errors.expiryDate}</span>}
            </div>
          </div>
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

        {/* Status select box for editing jobs (company only, not pending) */}
        {isEditing && user && user.role === 'Company' && initialData && (initialData.status === 1 || initialData.status === 2) && (
          <div className="form-group col-lg-6 col-md-12">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: Number(e.target.value) }))}
              disabled={isLoading}
              className="chosen-single form-select"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
            </select>
            <small className="form-text text-muted">
              You can only switch between Active and Inactive. After editing content, job will be set to pending and you cannot change status until admin approves.
            </small>
          </div>
        )}
        {/* Cảnh báo nếu user vừa chỉnh nội dung vừa đổi status */}
        {isEditing && user && user.role === 'Company' && initialData && (initialData.status === 1 || initialData.status === 2) && (formData.status !== initialData.status) && hasActualChanges() && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              After editing content, job will be set to <b>pending</b> and you cannot change status until admin approves. Please only update status if you are not editing content.
            </div>
          </div>
        )}

        {isEditing && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-info" role="alert">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Status Management:</strong> Job status will be automatically managed by the system. 
              If your job is currently active or inactive, it will be set to pending for admin review after editing.
            </div>
          </div>
        )}

        {isEditing && initialData && new Date(initialData.timeEnd) < new Date() && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Job Expired:</strong> This job has already expired and cannot be edited. 
              Please create a new job posting instead.
            </div>
          </div>
        )}

        <div className="form-group col-lg-12 col-md-12 text-right">
          <button type="submit" className="theme-btn btn-style-one" disabled={isLoading || (isEditing && initialData && new Date(initialData.timeEnd) < new Date())}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                {isEditing ? "Updating..." : "Posting..."}
              </>
            ) : (
              isEditing ? "Update Job" : "Post Job"
            )}
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
            {isEditing && (
              <div style={{ 
                backgroundColor: '#e7f3ff', 
                padding: '12px', 
                borderRadius: '4px', 
                margin: '16px 0',
                fontSize: '14px',
                color: '#0066cc'
              }}>
                <i className="fas fa-info-circle me-2"></i>
                Your job has been updated and will be reviewed by admin if needed.
              </div>
            )}
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