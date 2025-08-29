"use client";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ApiService from "@/services/api.service";
import API_CONFIG from "@/config/api.config";
import Cookies from "js-cookie";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { jobService } from "../../../../../services/jobService";
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import { companyService } from "@/services/companyService";

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
    quantity: 1, // Thêm quantity
    timeStart: '',
    timeEnd: '',
    provinceName: '',
    addressDetail: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    YourSkill: '',
    YourExperience: '',
    status: 0,
    descriptionWeight: 30,
    skillsWeight: 30,
    experienceWeight: 20,
    educationWeight: 20
  });
  const [levels, setLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState({});
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [userIndustry, setUserIndustry] = useState(null); // Lưu industry của công ty

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    ApiService.get(API_CONFIG.ENDPOINTS.LEVEL).then(setLevels);
    ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE).then(setJobTypes);
    ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY).then(setIndustries);
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(res => setProvinces(res.data))
      .catch(() => setProvinces([]));
    const userId = localStorage.getItem('userId') || Cookies.get('userId');
    const userRole = localStorage.getItem('role') || Cookies.get('role');
    setUser({ userId, role: userRole });
    // Lấy industry của công ty qua companyService
    if (userRole === 'Company' && userId) {
      companyService.getCompanyProfile(userId)
        .then((companyProfile) => {
          if (companyProfile && companyProfile.industryId && companyProfile.industryName) {
            setUserIndustry({
              industryId: companyProfile.industryId,
              industryName: companyProfile.industryName
            });
            setFormData(prev => ({ ...prev, industryId: companyProfile.industryId }));
          }
        })
        .catch(() => {});
    }
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        jobId: initialData.jobId || initialData.id,
        YourSkill: initialData.YourSkill || initialData.yourSkill || '',
        YourExperience: initialData.YourExperience || initialData.yourExperience || '',
        isSalaryNegotiable: initialData.isSalaryNegotiable || false,
        minSalary: initialData.minSalary || '',
        maxSalary: initialData.maxSalary || '',
        industryId: initialData.industryId || 0,
        levelId: initialData.levelId || 0,
        jobTypeId: initialData.jobTypeId || 0,
        quantity: initialData.quantity != null ? initialData.quantity : 1, // Sửa lại lấy đúng quantity
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        timeStart: initialData.timeStart ? initialData.timeStart.split('T')[0] : '',
        timeEnd: initialData.timeEnd ? initialData.timeEnd.split('T')[0] : '',
        status: typeof initialData.status === 'number' ? initialData.status : 0,
        deactivatedByAdmin: initialData.deactivatedByAdmin || false, // Đảm bảo deactivatedByAdmin được bao gồm
        descriptionWeight: !isNaN(Number(initialData.descriptionWeight)) ? Number(initialData.descriptionWeight) * 100 : 0,
        skillsWeight: !isNaN(Number(initialData.skillsWeight)) ? Number(initialData.skillsWeight) * 100 : 0,
        experienceWeight: !isNaN(Number(initialData.experienceWeight)) ? Number(initialData.experienceWeight) * 100 : 0,
        educationWeight: !isNaN(Number(initialData.educationWeight)) ? Number(initialData.educationWeight) * 100 : 0,
      });
    }
  }, [initialData, isEditing]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.education.trim()) newErrors.education = 'Education requirements are required';
    if (!formData.YourSkill.trim()) newErrors.YourSkill = 'Skills are required';
    if (!formData.YourExperience.trim()) newErrors.YourExperience = 'Experience is required';
    const isBlank = (value) => value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    if (!formData.isSalaryNegotiable) {
      const minSalaryValue = formData.minSalary;
      const maxSalaryValue = formData.maxSalary;

      if (isBlank(minSalaryValue) || isNaN(Number(minSalaryValue))) {
        newErrors.minSalary = 'Min Salary is required';
      }
      if (isBlank(maxSalaryValue) || isNaN(Number(maxSalaryValue))) {
        newErrors.maxSalary = 'Max Salary is required';
      }
      if (!isBlank(minSalaryValue) && !isBlank(maxSalaryValue) && Number(minSalaryValue) > Number(maxSalaryValue)) {
        newErrors.maxSalary = 'Max Salary must be greater than Min Salary';
      }
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'The number of positions to be filled must be greater than 0';
    }
    // BỎ validate industryId
    if (!formData.levelId) newErrors.levelId = 'Job level is required';
    if (!formData.jobTypeId) newErrors.jobTypeId = 'Job type is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Application deadline is required';
    if (!formData.timeStart) newErrors.timeStart = 'Start date is required';
    if (!formData.timeEnd) newErrors.timeEnd = 'End date is required';
    
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
      
      // Validate that the duration is not more than 30 days
      const timeDifferenceMs = endDate.getTime() - startDate.getTime();
      const daysDifference = Math.ceil(timeDifferenceMs / (1000 * 3600 * 24));
      if (daysDifference > 30) {
        newErrors.timeEnd = 'Job duration cannot exceed 30 days';
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
    
    if (!formData.provinceName) newErrors.provinceName = 'Province is required';
    if (!formData.addressDetail) newErrors.addressDetail = 'Address detail is required';
    const totalWeight =
      Number(formData.descriptionWeight || 0) +
      Number(formData.skillsWeight || 0) +
      Number(formData.experienceWeight || 0) +
      Number(formData.educationWeight || 0);
    if (
      isNaN(formData.descriptionWeight) ||
      isNaN(formData.skillsWeight) ||
      isNaN(formData.experienceWeight) ||
      isNaN(formData.educationWeight) ||
      formData.descriptionWeight < 0 || formData.descriptionWeight > 100 ||
      formData.skillsWeight < 0 || formData.skillsWeight > 100 ||
      formData.experienceWeight < 0 || formData.experienceWeight > 100 ||
      formData.educationWeight < 0 || formData.educationWeight > 100
    ) {
      newErrors.weight = 'Each weight must be a number from 0 to 100.';
    } else if (totalWeight > 100) {
      newErrors.weight = 'Total weight must not exceed 100%.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["descriptionWeight", "skillsWeight", "experienceWeight", "educationWeight"].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Math.max(0, Math.min(100, Number(value))) }));
      if (errors["weight"]) setErrors(prev => ({ ...prev, weight: '' }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: ["industryId", "levelId", "jobTypeId", "quantity"].includes(name) ? Number(value) : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const handleEducationChange = (value) => {
    setFormData(prev => ({ ...prev, education: value }));
    if (errors.education) setErrors(prev => ({ ...prev, education: '' }));
  };

  const isExpired = formData && formData.timeEnd && new Date(formData.timeEnd) < new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (isExpired) {
      setShowExpiredModal(true);
      return;
    }

    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // Đảm bảo rằng nếu job bị lock hoặc inactivebyadmin, status sẽ được giữ nguyên
        const updateData = { ...formData };
        if (initialData && (initialData.deactivatedByAdmin || initialData.status === 4)) {
          // Nếu job bị lock hoặc inactivebyadmin, giữ nguyên status gốc
          updateData.status = initialData.status;
        }
        await jobService.updateJob(formData.jobId, updateData);
        setSuccess(true);
        setError("");
        setTimeout(() => {
          router.push('/company-dashboard/manage-jobs');
        }, 2000);
      } else {
        // Logic for creating a job will be implemented here
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update job. Please check the details and try again.";
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.form className="default-form" onSubmit={handleSubmit} initial="hidden" animate="visible" variants={formVariants}>
      <div className="row">
        <AnimatePresence>
          {error && (
            <motion.div className="message-box error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>{error}</motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {success && (
            <motion.div className="message-box success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>Job updated successfully!</motion.div>
          )}
        </AnimatePresence>
        {/* Các trường nhập liệu */}
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Title</label>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <label>Job Description</label>
          {isClient ? (
            <ReactQuill key={formData.jobId + "-description"} theme="snow" value={formData.description} onChange={handleDescriptionChange} modules={{ toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['link', 'image'], ['clean']] }} formats={['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image']} className="job-description-quill" />
          ) : (
            <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} rows="8"></textarea>
          )}
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <label>Education Requirements</label>
          {isClient ? (
            <ReactQuill key={formData.jobId + "-education"} theme="snow" value={formData.education} onChange={handleEducationChange} modules={{ toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['link', 'image'], ['clean']] }} formats={['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image']} className={`job-description-quill ${errors.education ? 'is-invalid' : ''}`} />
          ) : (
            <textarea name="education" placeholder="Education Requirements" value={formData.education} onChange={handleInputChange} rows="8" className={errors.education ? 'form-control is-invalid' : 'form-control'}></textarea>
          )}
          {errors.education && <span className="error-message invalid-feedback d-block">{errors.education}</span>}
        </div>
        {/* Your Skills */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Skills</label>
          {isClient ? (
            <ReactQuill key={formData.jobId + "-your-skill"} theme="snow" value={formData.YourSkill} onChange={value => setFormData(prev => ({ ...prev, YourSkill: value }))} modules={{ toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['link', 'image'], ['clean']] }} formats={['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image']} className={`job-description-quill ${errors.YourSkill ? 'is-invalid' : ''}`} />
          ) : (
            <textarea name="YourSkill" placeholder="Describe your skills for this position..." value={formData.YourSkill} onChange={handleInputChange} rows="8" className={errors.YourSkill ? 'form-control is-invalid' : 'form-control'}></textarea>
          )}
          {errors.YourSkill && <div className="invalid-feedback">{errors.YourSkill}</div>}
        </motion.div>
        {/* Your Experience */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Experience</label>
          {isClient ? (
            <ReactQuill key={formData.jobId + "-your-experience"} theme="snow" value={formData.YourExperience} onChange={value => setFormData(prev => ({ ...prev, YourExperience: value }))} modules={{ toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['link', 'image'], ['clean']] }} formats={['header','bold', 'italic', 'underline', 'strike', 'blockquote','list', 'bullet', 'indent','link', 'image']} className={`job-description-quill ${errors.YourExperience ? 'is-invalid' : ''}`} />
          ) : (
            <textarea name="YourExperience" placeholder="Describe your experience for this position..." value={formData.YourExperience} onChange={handleInputChange} rows="8" className={errors.YourExperience ? 'form-control is-invalid' : 'form-control'}></textarea>
          )}
          {errors.YourExperience && <span className="invalid-feedback d-block">{errors.YourExperience}</span>}
        </motion.div>
        {/* Salary Section */}
        <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
          <label>Salary</label>
          <div className="d-flex flex-wrap mb-3" style={{ gap: '20px' }}>
            <div className="form-check">
              <input type="radio" className="form-check-input" id="salaryNegotiableRadio" name="salaryOption" value="negotiable" checked={formData.isSalaryNegotiable} onChange={() => setFormData(prev => ({ ...prev, isSalaryNegotiable: true, minSalary: '', maxSalary: '' }))} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <label className="form-check-label" htmlFor="salaryNegotiableRadio">Negotiable Salary</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" id="salarySpecificRadio" name="salaryOption" value="specific" checked={!formData.isSalaryNegotiable} onChange={() => setFormData(prev => ({ ...prev, isSalaryNegotiable: false }))} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <label className="form-check-label" htmlFor="salarySpecificRadio">Specific Salary</label>
            </div>
          </div>
        </motion.div>
        {formData.isSalaryNegotiable && (
          <motion.div className="form-group col-lg-12 col-md-12" variants={itemVariants}>
            <div className="alert alert-info" role="alert">You have selected wage agreement, specific salary cannot be entered.</div>
          </motion.div>
        )}
        {!formData.isSalaryNegotiable && (
          <>
            <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
              <label>Min Salary</label>
              <input type="number" name="minSalary" value={formData.minSalary || ''} onChange={handleInputChange} placeholder="Enter min salary" className={errors.minSalary ? 'form-control is-invalid' : 'form-control'} disabled={isLoading} />
              {errors.minSalary && <div className="invalid-feedback d-block">{errors.minSalary}</div>}
            </motion.div>
            <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
              <label>Max Salary</label>
              <input type="number" name="maxSalary" value={formData.maxSalary || ''} onChange={handleInputChange} placeholder="Enter Max salary" className={errors.maxSalary ? 'form-control is-invalid' : 'form-control'} disabled={isLoading} />
              {errors.maxSalary && <div className="invalid-feedback d-block">{errors.maxSalary}</div>}
            </motion.div>
          </>
        )}
        <div className="form-group col-lg-6 col-md-12">
          <label>Industry</label>
          <input
            type="text"
            name="industryName"
            value={userIndustry ? userIndustry.industryName : ''}
            className="form-control"
            disabled
            readOnly
            placeholder="Industry"
          />
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <label>Job Level</label>
          <select name="levelId" className="chosen-single form-select" value={formData.levelId} onChange={handleInputChange}>
            <option value="">Select Job Level</option>
            {levels.map(level => (
              <option key={level.levelId} value={level.levelId}>{level.levelName}</option>
            ))}
          </select>
          {errors.levelId && <span className="error-message">{errors.levelId}</span>}
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <label>Job Type</label>
          <select name="jobTypeId" className="chosen-single form-select" value={formData.jobTypeId} onChange={handleInputChange}>
            <option value="">Select Job Type</option>
            {jobTypes.map(type => (
              <option key={type.jobTypeId} value={type.jobTypeId}>{type.jobTypeName}</option>
            ))}
          </select>
          {errors.jobTypeId && <span className="error-message">{errors.jobTypeId}</span>}
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <label>Number of hires needed</label>
          <input
            type="number"
            name="quantity"
            min={1}
            value={formData.quantity}
            onChange={handleInputChange}
            className={`form-control${errors.quantity ? ' is-invalid' : ''}`}
            placeholder="Enter number of hires needed"
            disabled={isLoading}
          />
          {errors.quantity && <span className="error-message">{errors.quantity}</span>}
        </div>
        {/* Date Fields */}
        <div className="form-group col-lg-12 col-md-12">
          <div className="row">
            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>Start Date</label>
              <input type="date" name="timeStart" value={formData.timeStart} onChange={handleInputChange} className={`custom-date-input form-select ${errors.timeStart ? 'is-invalid' : ''}`} />
              {errors.timeStart && <span className="error-message invalid-feedback d-block">{errors.timeStart}</span>}
            </div>
            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>End Date</label>
              <input type="date" name="timeEnd" value={formData.timeEnd} onChange={handleInputChange} className={`custom-date-input form-select ${errors.timeEnd ? 'is-invalid' : ''}`} />
              {errors.timeEnd && <span className="error-message invalid-feedback d-block">{errors.timeEnd}</span>}
            </div>
            <div className="form-group col-lg-4 col-md-6 col-sm-12">
              <label>Application Deadline</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className={`custom-date-input form-select ${errors.expiryDate ? 'is-invalid' : ''}`} />
              {errors.expiryDate && <span className="error-message invalid-feedback d-block">{errors.expiryDate}</span>}
            </div>
          </div>
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <label>Province</label>
          <select name="provinceName" className="chosen-single form-select" value={formData.provinceName} onChange={handleInputChange}>
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province.code} value={province.name}>{province.name}</option>
            ))}
          </select>
          {errors.provinceName && <span className="error-message">{errors.provinceName}</span>}
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <label>Address Detail</label>
          <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleInputChange} />
          {errors.addressDetail && <span className="error-message">{errors.addressDetail}</span>}
        </div>
        {/* Status select box for editing jobs (company only, not pending) */}
        {isEditing && user && user.role === 'Company' && initialData && (initialData.status === 2 || initialData.status === 3) && !initialData.deactivatedByAdmin && initialData.status !== 4 && (
          <div className="form-group col-lg-6 col-md-12">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: Number(e.target.value) }))} disabled={isLoading} className="chosen-single form-select">
              <option value={2}>Active</option>
              <option value={3}>Inactive</option>
            </select>
            <small className="form-text text-muted">You can only switch between Active and Inactive. After editing content, job will be set to pending and you cannot change status until admin approves.</small>
          </div>
        )}
        {isEditing && user && user.role === 'Company' && initialData && (initialData.status === 2 || initialData.status === 3) && !initialData.deactivatedByAdmin && initialData.status !== 4 && (formData.status !== initialData.status) && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              After editing content, job will be set to <b>pending</b> and you cannot change status until admin approves. Please only update status if you are not editing content.
            </div>
          </div>
        )}
        {/* Warning for locked jobs */}
        {isEditing && user && user.role === 'Company' && initialData && initialData.deactivatedByAdmin && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-lock me-2"></i>
              <strong>Job Locked:</strong> This job has been locked by an administrator. You can edit the content, but the status will remain locked until an admin unlocks it.
            </div>
          </div>
        )}
        
        {/* Warning for jobs inactivated by admin */}
        {isEditing && user && user.role === 'Company' && initialData && initialData.status === 4 && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-ban me-2"></i>
              <strong>Job Inactivated by Admin:</strong> This job has been inactivated by an administrator. You can edit the content, but you cannot change the status. Only an admin can reactivate this job.
            </div>
          </div>
        )}
        
        {isEditing && initialData && new Date(initialData.timeEnd) < new Date() && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Job Expired:</strong> This job has already expired and cannot be edited. Please create a new job posting instead.
            </div>
          </div>
        )}
        {/* 4 ô input weight */}
        <div className="row">
          <div className="form-group col-12 col-md-6 col-lg-3">
            <label>Description Weight (%)</label>
            <input type="number" step="1" min="0" max="100" name="descriptionWeight" value={formData.descriptionWeight} className="form-control not-allowed-cursor" disabled readOnly />
          </div>
          <div className="form-group col-12 col-md-6 col-lg-3">
            <label>Skills Weight (%)</label>
            <input type="number" step="1" min="0" max="100" name="skillsWeight" value={formData.skillsWeight} className="form-control not-allowed-cursor" disabled readOnly />
          </div>
          <div className="form-group col-12 col-md-6 col-lg-3">
            <label>Experience Weight (%)</label>
            <input type="number" step="1" min="0" max="100" name="experienceWeight" value={formData.experienceWeight} className="form-control not-allowed-cursor" disabled readOnly />
          </div>
          <div className="form-group col-12 col-md-6 col-lg-3">
            <label>Education Weight (%)</label>
            <input type="number" step="1" min="0" max="100" name="educationWeight" value={formData.educationWeight} className="form-control not-allowed-cursor" disabled readOnly />
          </div>
        </div>
        {errors.weight && <div className="error-message col-12">{errors.weight}</div>}
        <div className="form-group col-lg-12 col-md-12 text-right">
        <div className="form-group col-lg-12 col-md-12">    
        {isEditing && (
          <div className="form-group col-lg-12 col-md-12">
            <div className="alert alert-info" role="alert">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Status Management:</strong> Job status will be automatically managed by the system. If your job is currently active or inactive, it will be set to pending for admin review after editing.
            </div>
          </div>
        )}    
            </div>
          <button type="submit" className="theme-btn btn-style-one" disabled={isLoading}>
            {isLoading ? (<><i className="fas fa-spinner fa-spin me-2"></i>{isEditing ? "Updating..." : "Posting..."}</>) : (isEditing ? "Update Job" : "Post Job")}
          </button>
        </div>
      </div>
      {/* Modal thông báo job đã hết hạn */}
      <Modal
        open={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        title="Cannot update job"
        footer={<button className="btn-confirm" onClick={() => setShowExpiredModal(false)}>Close</button>}
      >
        <p>This job has already expired and cannot be edited. Please create a new job posting instead.</p>
      </Modal>
    </motion.form>
  );
};

export default PostBoxForm; 