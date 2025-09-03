'use client'

import Map from "../../../Map";
import { useState, useEffect, useRef } from "react";
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
import locationService from "../../../../../services/locationService";
import { companyService } from "../../../../../services/companyService";

// Helper function to format remaining job posts
const formatRemainingJobs = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === Number.MAX_SAFE_INTEGER ||
    value >= 999999 ||
    value === -2147483647
  ) {
    return 'unlimited';
  }
  return value;
};
import Link from "next/link";
import DraftService from "../../../../../services/draftService";
import DraftModal from "../../DraftModal";
import { toast } from 'react-toastify';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const PostBoxForm = ({ cloneData, isClone }) => {
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
    quantity: 1, // Thêm quantity
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
  const [provinces, setProvinces] = useState([]);
  const [userIndustry, setUserIndustry] = useState(null); // Lưu industry của công ty

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
  const [mySubscription, setMySubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState("");
  const [trendingSuccess, setTrendingSuccess] = useState(false);
  const [showTrendingSuccessModal, setShowTrendingSuccessModal] = useState(false);
  
  // Draft related states
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [selectedDraftInfo, setSelectedDraftInfo] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Lưu giá trị mặc định ban đầu của form
  const defaultFormData = useRef({
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
    quantity: 1,
    timeStart: '',
    timeEnd: '',
    provinceName: '',
    addressDetail: '',
    createdAt: '',
    updatedAt: '',
    YourSkill: '',
    YourExperience: '',
    DescriptionWeight: '',
    SkillsWeight: '',
    ExperienceWeight: '',
    EducationWeight: '',
  });

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
    Promise.allSettled([
      ApiService.get(API_CONFIG.ENDPOINTS.LEVEL),
      ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE),
      ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY),
      locationService.getProvinces()
    ]).then((results) => {
      const [levelsRes, jobTypesRes, industriesRes, provincesRes] = results;
      setLevels(levelsRes.status === 'fulfilled' ? levelsRes.value : []);
      setJobTypes(jobTypesRes.status === 'fulfilled' ? jobTypesRes.value : []);
      setIndustries(industriesRes.status === 'fulfilled' ? industriesRes.value : []);
      setProvinces(provincesRes.status === 'fulfilled' ? (provincesRes.value || []) : []);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
    // Get userId from localStorage or cookies
    const userId = localStorage.getItem('userId') || Cookies.get('userId');
    const userRole = localStorage.getItem('role') || Cookies.get('role');
    setUser({ userId: userId ? parseInt(userId, 10) : 0, role: userRole });
    setIsClient(true);

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
    // Fetch employer subscription info
    ApiService.getMyCompanySubscription().then(setMySubscription).catch(() => setMySubscription(null));
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
    if (isClone) return; // Nếu là clone, không load draft
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        // Cập nhật defaultFormData để draft data trở thành "baseline"
        defaultFormData.current = { ...draftData };
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isClone]);

  // Check if form has actual changes
  const isFormDirty = () => {
    // Chỉ kiểm tra các trường quan trọng mà user có thể nhập
    const importantFields = ['title', 'description', 'education', 'YourSkill', 'YourExperience', 'provinceName', 'addressDetail'];
    
    for (const key of importantFields) {
      const currentValue = formData[key];
      const defaultValue = defaultFormData.current[key];
      
      // Kiểm tra string fields
      if (typeof currentValue === 'string') {
        if (currentValue.trim() !== (defaultValue || '').trim()) {
          
          return true;
        }
      }
    }
    
    // Kiểm tra các trường số quan trọng
    const numberFields = ['minSalary', 'maxSalary', 'quantity'];
    for (const key of numberFields) {
      const currentValue = formData[key];
      const defaultValue = defaultFormData.current[key];
      if (currentValue !== defaultValue) {
        console.log(`Field "${key}" is dirty: ${currentValue} !== ${defaultValue}`);
        return true;
      }
    }
    
    // Kiểm tra boolean fields
    if (formData.isSalaryNegotiable !== defaultFormData.current.isSalaryNegotiable) {
      console.log(`Field "isSalaryNegotiable" is dirty: ${formData.isSalaryNegotiable} !== ${defaultFormData.current.isSalaryNegotiable}`);
      return true;
    }
    
    // Kiểm tra date fields
    const dateFields = ['expiryDate', 'timeStart', 'timeEnd'];
    for (const key of dateFields) {
      const currentValue = formData[key];
      const defaultValue = defaultFormData.current[key];
      if (currentValue !== defaultValue) {
        console.log(`Field "${key}" is dirty: ${currentValue} !== ${defaultValue}`);
        return true;
      }
    }
    
    return false;
  };

  // Handle navigation away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.href.startsWith('javascript:') && isFormDirty()) {
        e.preventDefault();
        e.stopPropagation();
        setShowLeaveConfirmation(true);
        setIntendedPath(anchor.href);
        return false;
      }
    };

    // Bắt Next.js router navigation
    const handleRouteChange = (url) => {
      if (isFormDirty()) {
        setShowLeaveConfirmation(true);
        setIntendedPath(url);
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [formData]);

  const handleClearDraft = () => {
    setSelectedDraftInfo(null);
    setCurrentDraftId(null);
    setFormData({
      title: '',
      description: '',
      education: '',
      industryId: 1,
      expiryDate: '',
      levelId: 1,
      jobTypeId: 1,
      quantity: 1,
      timeStart: '',
      timeEnd: '',
      provinceName: '',
      addressDetail: '',
      isSalaryNegotiable: false,
      minSalary: '',
      maxSalary: '',
      YourSkill: '',
      YourExperience: '',
      DescriptionWeight: 0,
      SkillsWeight: 0,
      ExperienceWeight: 0,
      EducationWeight: 0,
      skillInputs: []
    });
    defaultFormData.current = {
      title: '',
      description: '',
      education: '',
      industryId: 1,
      expiryDate: '',
      levelId: 1,
      jobTypeId: 1,
      quantity: 1,
      timeStart: '',
      timeEnd: '',
      provinceName: '',
      addressDetail: '',
      isSalaryNegotiable: false,
      minSalary: '',
      maxSalary: '',
      YourSkill: '',
      YourExperience: '',
      DescriptionWeight: 0,
      SkillsWeight: 0,
      ExperienceWeight: 0,
      EducationWeight: 0,
      skillInputs: []
    };
    toast.info('Draft cleared. You can now create a new job.');
  };

  const handleConfirmClear = () => {
    localStorage.removeItem(DRAFT_KEY);
    // Reset defaultFormData về giá trị ban đầu
    defaultFormData.current = {
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
      quantity: 1,
      timeStart: '',
      timeEnd: '',
      provinceName: '',
      addressDetail: '',
      createdAt: '',
      updatedAt: '',
      YourSkill: '',
      YourExperience: '',
      DescriptionWeight: '',
      SkillsWeight: '',
      ExperienceWeight: '',
      EducationWeight: '',
    };
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
      quantity: 1, // Thêm quantity
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

  const handleSaveAndLeave = async () => {
    try {
      await handleSaveDraft();
      setShowLeaveConfirmation(false);
      setHasUnsavedChanges(false);
      if (intendedPath) {
        router.push(intendedPath);
      }
    } catch (error) {
      console.error('Error saving draft before leaving:', error);
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
    
    // Validate minimum salary - only check for negative values
    if (formData.minSalary && formData.minSalary < 0) {
      newErrors.minSalary = 'Minimum salary cannot be negative';
    }
    
    // Validate maximum salary - only check for negative values
    if (formData.maxSalary && formData.maxSalary < 0) {
      newErrors.maxSalary = 'Maximum salary cannot be negative';
    }
    
    if (formData.minSalary && formData.maxSalary && formData.minSalary > formData.maxSalary) {
      newErrors.minSalary = 'Min salary cannot be greater than Max salary';
      newErrors.maxSalary = 'Max salary cannot be less than Min salary';
    }
    if (!formData.levelId) {
      newErrors.levelId = 'Job level is required';
    }
    if (!formData.jobTypeId) {
      newErrors.jobTypeId = 'Job type is required';
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'The number of positions to be filled must be greater than 0';
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

    // Validate weights cannot be empty, not NaN
    if (formData.DescriptionWeight === '' || isNaN(Number(formData.DescriptionWeight))) {
      newErrors.DescriptionWeight = 'Please enter Description Weight';
    }
    if (formData.SkillsWeight === '' || isNaN(Number(formData.SkillsWeight))) {
      newErrors.SkillsWeight = 'Please enter Skills Weight';
    }
    if (formData.ExperienceWeight === '' || isNaN(Number(formData.ExperienceWeight))) {
      newErrors.ExperienceWeight = 'Please enter Experience Weight';
    }
    if (formData.EducationWeight === '' || isNaN(Number(formData.EducationWeight))) {
      newErrors.EducationWeight = 'Please enter Education Weight';
    }
    // Validate total weight = 100
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
      newErrors.DescriptionWeight = 'Total weights must equal 100%';
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
    
    // Handle salary validation in real-time
    if (name === 'minSalary' || name === 'maxSalary') {
      const numValue = Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : numValue
      }));
      
      // Clear existing error
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      
      // Real-time validation for salary - only check for negative values
      if (value !== '' && numValue < 0) {
        setErrors(prev => ({
          ...prev,
          [name]: `${name === 'minSalary' ? 'Minimum' : 'Maximum'} salary cannot be negative`
        }));
      }
      
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: [
        "industryId",
        "levelId",
        "jobTypeId",
        "quantity" // Thay experienceLevelId bằng quantity
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

    setError("");
    setSuccess(false);

    // Check job post limit
    if (mySubscription && typeof mySubscription.remainingJobPosts === 'number' && mySubscription.remainingJobPosts <= 0 && mySubscription.remainingJobPosts !== -2147483647) {
      setShowUpgradeModal(true);
      return;
    }

    if (!validateForm()) {
      setError("Please fill in all required fields!");
      return;
    }

    if (!user?.userId || user.role !== 'Company') {
      setError("You must log in with a company account to post a job.");
      return;
    }

    try {
      // Create job first
      const jobData = {
        title: formData.title,
        description: formData.description,
        education: formData.education,
        companyId: parseInt(user.userId, 10),
        isSalaryNegotiable: formData.isSalaryNegotiable,
        // Handle salary fields properly - only include if they have valid values (non-negative)
        ...(formData.minSalary && formData.minSalary >= 0 && { minSalary: Number(formData.minSalary) }),
        ...(formData.maxSalary && formData.maxSalary >= 0 && { maxSalary: Number(formData.maxSalary) }),
        // Ensure numeric fields are properly converted
        industryId: formData.industryId ? Number(formData.industryId) : undefined,
        expiryDate: formData.expiryDate,
        levelId: formData.levelId ? Number(formData.levelId) : undefined,
        jobTypeId: formData.jobTypeId ? Number(formData.jobTypeId) : undefined,
        quantity: formData.quantity ? Number(formData.quantity) : 1, // Thay experienceLevelId bằng quantity
        timeStart: formData.timeStart,
        timeEnd: formData.timeEnd,
        provinceName: formData.provinceName,
        addressDetail: formData.addressDetail,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
        YourSkill: formData.YourSkill,
        YourExperience: formData.YourExperience,
        // Ensure weight fields are properly converted to numbers
        DescriptionWeight: formData.DescriptionWeight ? Number(formData.DescriptionWeight) : 0,
        SkillsWeight: formData.SkillsWeight ? Number(formData.SkillsWeight) : 0,
        ExperienceWeight: formData.ExperienceWeight ? Number(formData.ExperienceWeight) : 0,
        EducationWeight: formData.EducationWeight ? Number(formData.EducationWeight) : 0,
      };

      const jobResult = await ApiService.createJob(jobData);
      
      // Delete draft if exists
      if (currentDraftId) {
        try {
          await DraftService.deleteDraft(currentDraftId);
          setCurrentDraftId(null);
        } catch (error) {
         
        }
      }
      
      setSuccess(true);
      setShowSuccessModal(true);
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
      
      // Refresh subscription data after successful job creation
      try {
        const updatedSubscription = await ApiService.getMyCompanySubscription();
        setMySubscription(updatedSubscription);
      } catch (error) {
        console.error('Error refreshing subscription data:', error);
      }
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
        quantity: 1, // Thêm quantity
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
      // Kiểm tra nếu lỗi là do giới hạn job post
      if (error.response?.data?.upgradeRequired) {
        setShowUpgradeModal(true);
        return;
      }
      
      // Handle validation errors specifically
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        console.error("Validation errors:", validationErrors);
        
        // Extract specific error messages
        let errorMessages = [];
        if (validationErrors.dto) {
          errorMessages.push(...validationErrors.dto);
        }
        if (validationErrors['$.minSalary']) {
          errorMessages.push(`Min Salary: ${validationErrors['$.minSalary'].join(', ')}`);
        }
        if (validationErrors['$.maxSalary']) {
          errorMessages.push(`Max Salary: ${validationErrors['$.maxSalary'].join(', ')}`);
        }
        
        // Add any other field-specific errors
        Object.keys(validationErrors).forEach(key => {
          if (key !== 'dto' && key !== '$.minSalary' && key !== '$.maxSalary') {
            errorMessages.push(`${key}: ${validationErrors[key].join(', ')}`);
          }
        });
        
        setError(errorMessages.join('. ') || "Validation failed. Please check your input.");
        return;
      }
      
      // Hiển thị thông báo lỗi cụ thể từ API
      const errorMessage = error.response?.data?.message || "Failed to create job. Please try again.";
      setError(errorMessage);
      
      // Log lỗi để debug
      console.error("Job creation error:", error);
    }
  };

  const handleTrendingSubmit = async (e) => {
    e.preventDefault();
    if (showLeaveConfirmation) return;
    setTrendingError("");
    setTrendingSuccess(false);
    setIsTrendingLoading(true);

    // Check trending job post limit
    if (
      !mySubscription ||
      !mySubscription.subscription ||
      mySubscription.subscription.trendingJobLimit <= 0 ||
      mySubscription.subscription.remainingTrendingJobPosts <= 0
    ) {
      setTrendingError("You do not have permission to post trending jobs. Please upgrade your package.");
      setIsTrendingLoading(false);
      return;
    }

    if (!validateForm()) {
      setTrendingError("Please fill in all required fields!");
      setIsTrendingLoading(false);
      return;
    }
    if (!user?.userId || user.role !== 'Company') {
      setTrendingError("You must log in with a company account to post a trending job.");
      setIsTrendingLoading(false);
      return;
    }
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        education: formData.education,
        companyId: parseInt(user.userId, 10),
        isSalaryNegotiable: formData.isSalaryNegotiable,
        // Handle salary fields properly - only include if they have valid values (non-negative)
        ...(formData.minSalary && formData.minSalary >= 0 && { minSalary: Number(formData.minSalary) }),
        ...(formData.maxSalary && formData.maxSalary >= 0 && { maxSalary: Number(formData.maxSalary) }),
        industryId: formData.industryId,
        expiryDate: formData.expiryDate,
        levelId: formData.levelId,
        jobTypeId: formData.jobTypeId,
        quantity: formData.quantity,
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
      const jobResult = await ApiService.createTrendingJob(jobData);
      
      // Delete draft if exists
      if (currentDraftId) {
        try {
          await DraftService.deleteDraft(currentDraftId);
          setCurrentDraftId(null);
        } catch (error) {
          console.error('Error deleting draft after publish:', error);
        }
      }
      
      setTrendingSuccess(true);
      setShowTrendingSuccessModal(true);
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
        quantity: 1,
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
      setTrendingError(error.response?.data?.message || "Failed to create trending job. Please try again.");
    } finally {
      setIsTrendingLoading(false);
    }
  };

  // Auto-save draft when form data changes
  useEffect(() => {
    if (isFormDirty()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setHasUnsavedChanges(true);
    } else {
      localStorage.removeItem(DRAFT_KEY);
      setHasUnsavedChanges(false);
    }
  }, [formData]);

  // Handle save draft to server
  const handleSaveDraft = async () => {
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Please enter a job title to save as draft');
      return;
    }

    // Validate CompanyId
    if (!user.userId || user.userId <= 0) {
      toast.error('Invalid company ID. Please log in again.');
      return;
    }

    try {
      setIsDraftLoading(true);
      
      // Format DateTime cho backend - sửa format
      const formatDateTime = (dateString) => {
        if (!dateString || dateString === '' || dateString === 'Invalid Date') return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null; // Kiểm tra date hợp lệ
        
        // Format: YYYY-MM-DDTHH:mm:ss.000Z (ISO format)
        return date.toISOString();
      };

      const jobData = {
        CompanyId: parseInt(user.userId, 10), // Sử dụng user.userId thay vì formData.companyId
        Title: formData.title,
        IndustryId: formData.industryId || 1,
        ExpiryDate: formatDateTime(formData.expiryDate),
        LevelId: formData.levelId || 1,
        JobTypeId: formData.jobTypeId || 1,
        Quantity: formData.quantity || 1,
        TimeStart: formatDateTime(formData.timeStart),
        TimeEnd: formatDateTime(formData.timeEnd),
        ProvinceName: formData.provinceName || '',
        AddressDetail: formData.addressDetail || '',
        YourSkill: formData.YourSkill || '',
        YourExperience: formData.YourExperience || '',
        DescriptionWeight: formData.DescriptionWeight || 0,
        SkillsWeight: formData.SkillsWeight || 0,
        ExperienceWeight: formData.ExperienceWeight || 0,
        EducationWeight: formData.EducationWeight || 0,
        Description: formData.description || '',
        Education: formData.education || '',
        IsSalaryNegotiable: formData.isSalaryNegotiable || false,
        MinSalary: formData.minSalary || null,
        MaxSalary: formData.maxSalary || null,
        skillInputs: formData.skillInputs || []
      };

      console.log('Saving draft with data:', jobData);
      console.log('Current draft ID:', currentDraftId);
      console.log('Original formData:', formData);
      console.log('Formatted dates:', {
        expiryDate: formData.expiryDate,
        formattedExpiryDate: formatDateTime(formData.expiryDate),
        timeStart: formData.timeStart,
        formattedTimeStart: formatDateTime(formData.timeStart),
        timeEnd: formData.timeEnd,
        formattedTimeEnd: formatDateTime(formData.timeEnd)
      });
      console.log('User ID:', user.userId);
      console.log('Company ID being sent:', parseInt(user.userId, 10));
      
      await DraftService.saveDraft(jobData);
      
      // Nếu đang edit draft hiện tại, cập nhật currentDraftId và thông báo
      if (currentDraftId) {
        toast.success('Draft updated successfully!');
        console.log('Draft updated with ID:', currentDraftId);
      } else {
        toast.success('Draft saved successfully!');
        console.log('New draft created');
      }
      
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsDraftLoading(false);
    }
  };
  // Handle load draft from server
  const handleLoadDraft = (draft) => {
    if (!draft) return;
    
    console.log('Loading draft:', draft);
    
    // API trả về camelCase, không cần convert
    const convertedDraft = {
      title: draft.title || '',
      description: draft.description || '',
      education: draft.education || '',
      industryId: draft.industryId || 1,
      expiryDate: draft.expiryDate ? new Date(draft.expiryDate).toISOString().split('T')[0] : '',
      levelId: draft.levelId || 1,
      jobTypeId: draft.jobTypeId || 1,
      quantity: draft.quantity || 1,
      timeStart: draft.timeStart ? new Date(draft.timeStart).toISOString().split('T')[0] : '',
      timeEnd: draft.timeEnd ? new Date(draft.timeEnd).toISOString().split('T')[0] : '',
      provinceName: draft.provinceName || '',
      addressDetail: draft.addressDetail || '',
      isSalaryNegotiable: draft.isSalaryNegotiable || false,
      minSalary: draft.minSalary || '',
      maxSalary: draft.maxSalary || '',
      YourSkill: draft.yourSkill || '',
      YourExperience: draft.yourExperience || '',
      DescriptionWeight: draft.descriptionWeight ? draft.descriptionWeight * 100 : 0,
      SkillsWeight: draft.skillsWeight ? draft.skillsWeight * 100 : 0,
      ExperienceWeight: draft.experienceWeight ? draft.experienceWeight * 100 : 0,
      EducationWeight: draft.educationWeight ? draft.educationWeight * 100 : 0,
      skillInputs: draft.Skills ? draft.Skills.map(skill => ({
        skillId: skill.skillId,
        skillName: skill.skillName
      })) : []
    };

    console.log('Converted draft data:', convertedDraft);

    setFormData(convertedDraft);
    setCurrentDraftId(draft.jobId);
    setSelectedDraftInfo(draft); // Store original draft info for display
    
    // Update defaultFormData to the loaded draft
    defaultFormData.current = convertedDraft;
    
    // Clear any existing errors
    setDraftError('');
    
    // Show success message
    toast.success('Draft loaded successfully!');
  };

  const handleDeleteDraft = async () => {
    if (!currentDraftId) return;
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteDraft = async () => {
    try {
      await DraftService.deleteDraft(currentDraftId);
      setSelectedDraftInfo(null);
      setCurrentDraftId(null);
      setShowDeleteConfirmModal(false);
      toast.success('Draft deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft. Please try again.');
    }
  };

  const handleOpenDraftModal = async () => {
    console.log('Opening draft modal...');
    console.log('Current showDraftModal state:', showDraftModal);
    setShowDraftModal(true);
    setIsLoadingDrafts(true);
    setDraftError('');
    
    try {
      console.log('Fetching drafts...');
      const response = await DraftService.getDrafts();
      console.log('Drafts response:', response);
      console.log('Drafts response type:', typeof response);
      console.log('Drafts response length:', response?.length);
      setDrafts(response || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setDraftError('Failed to load drafts. Please try again.');
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  useEffect(() => {
    if (isClone && cloneData) {
      setFormData(prev => ({
        ...prev,
        title: cloneData.title || "",
        description: cloneData.description || "",
        education: cloneData.education || "",
        companyId: cloneData.companyId || 0,
        isSalaryNegotiable: cloneData.isSalaryNegotiable || false,
        minSalary: cloneData.minSalary || null,
        maxSalary: cloneData.maxSalary || null,
        industryId: cloneData.industryId || 0,
        levelId: cloneData.levelId || 0,
        jobTypeId: cloneData.jobTypeId || 0,
        quantity: cloneData.quantity || 1, // Thêm quantity
        provinceName: cloneData.provinceName || "",
        addressDetail: cloneData.addressDetail || "",
        YourSkill: cloneData.yourSkill || "",
        YourExperience: cloneData.yourExperience || "",
        DescriptionWeight: cloneData.descriptionWeight ? cloneData.descriptionWeight * 100 : "",
        SkillsWeight: cloneData.skillsWeight ? cloneData.skillsWeight * 100 : "",
        ExperienceWeight: cloneData.experienceWeight ? cloneData.experienceWeight * 100 : "",
        EducationWeight: cloneData.educationWeight ? cloneData.educationWeight * 100 : "",
        expiryDate: '',
        timeStart: '',
        timeEnd: '',
      }));
    }
  }, [isClone, cloneData]);

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
      {/* Draft Information Display - ở đầu trang */}
      {selectedDraftInfo && (
        <div className="col-lg-12 mb-4">
          <div className="alert alert-warning border-0 shadow-sm" style={{ 
            borderRadius: '12px',
            maxWidth: '500px',
            margin: '0 auto',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '2px solid #ffc107',
            boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)'
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
                  }}>
                    <i className="fas fa-file-alt text-white" style={{ fontSize: '1rem' }}></i>
                  </div>
                </div>
                <div>
                  <h6 className="mb-1 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>
                    Currently Editing Draft
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                    {selectedDraftInfo.title || 'Untitled Job'}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isDraftLoading}
                  className="btn btn-warning btn-sm"
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    padding: '6px 12px',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
                    border: 'none'
                  }}
                >
                  {isDraftLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      Update Draft
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    padding: '6px 10px',
                    border: '1px solid #dee2e6'
                  }}
                  title="Clear draft from form"
                >
                  <i className="fas fa-times"></i>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDraft}
                  className="btn btn-outline-danger btn-sm"
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    padding: '6px 10px',
                    border: '1px solid #dc3545'
                  }}
                  title="Delete draft permanently"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Draft Button */}
      <div className="col-lg-12 mb-3">
        <button
          type="button"
          onClick={handleOpenDraftModal}
          className="btn btn-primary btn-sm"
          style={{ 
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            width: '180px'
          }}
        >
          <i className="fas fa-folder-open me-2"></i>
          {selectedDraftInfo ? 'Load Different Draft' : 'Load Draft'}
        </button>
      </div>

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
            {/* Trending Job Error Message */}
            <AnimatePresence>
              {trendingError && (
                <motion.div
                  className="message-box error"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {trendingError}
                </motion.div>
              )}
              {trendingSuccess && (
                <motion.div
                  className="message-box success"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  Trending job posted successfully!
                </motion.div>
              )}
            </AnimatePresence>
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
                rows="6"
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
                  min="0"
                  className={errors.minSalary ? 'form-control is-invalid' : 'form-control'}
                  disabled={isLoading}
                />
                {errors.minSalary && <div className="invalid-feedback">{errors.minSalary}</div>}
                <small className="form-text text-muted">Minimum salary cannot be negative</small>
              </motion.div>

              <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
                <label>Max Salary</label>
                <input 
                  type="number" 
                  name="maxSalary" 
                  value={formData.maxSalary || ''}
                  onChange={handleInputChange}
                  placeholder="Enter max salary"
                  min="0"
                  className={errors.maxSalary ? 'form-control is-invalid' : 'form-control'}
                  disabled={isLoading}
                />
                {errors.maxSalary && <div className="invalid-feedback">{errors.maxSalary}</div>}
                <small className="form-text text-muted">Maximum salary cannot be negative</small>
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
            <label htmlFor="industryId">Industry</label>
            <input
              type="text"
              name="industryName"
              value={userIndustry ? userIndustry.industryName : ''}
              className="form-control"
              disabled
              readOnly
              placeholder="Industry"
            />
          </motion.div>

          {/* Job Level */}
          <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
            <label htmlFor="levelId">Job Level</label>
            <select 
              id="levelId"
              name="levelId" 
              value={formData.levelId}
              onChange={handleInputChange}
              className={`chosen-single form-select ${errors.levelId ? 'is-invalid' : ''}`}
              disabled={isLoading}
            >
              <option value="">Select Level</option>
              {levels.map((level) => (
                <option key={level.levelId} value={level.levelId}>{level.levelName}</option>
              ))}
            </select>
            {errors.levelId && <div className="invalid-feedback">{errors.levelId}</div>}
          </motion.div>

          {/* Job Type */}
          <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
            <label htmlFor="jobTypeId">Job Type</label>
            <select 
              id="jobTypeId"
              name="jobTypeId" 
              value={formData.jobTypeId}
              onChange={handleInputChange}
              className={`chosen-single form-select ${errors.jobTypeId ? 'is-invalid' : ''}`}
              disabled={isLoading}
            >
              <option value="">Select Job Type</option>
              {jobTypes.map(type => (
                <option key={type.jobTypeId} value={type.jobTypeId}>{type.jobTypeName}</option>
              ))}
            </select>
            {errors.jobTypeId && <div className="invalid-feedback">{errors.jobTypeId}</div>}
          </motion.div>

          {/* Số lượng cần tuyển */}
          <motion.div className="form-group col-lg-6 col-md-12" variants={itemVariants}>
            <label htmlFor="quantity">Number of hires needed</label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min={1}
              value={formData.quantity}
              onChange={handleInputChange}
              className={`form-control${errors.quantity ? ' is-invalid' : ''}`}
              placeholder="Nhập số lượng cần tuyển"
              disabled={isLoading}
            />
            {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
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


            {/* Error message for draft */}
            {draftError && (
              <div className="alert alert-danger mb-3" role="alert">
                {draftError}
              </div>
            )}

            {/* Current draft indicator */}
            {currentDraftId && (
              <div className="alert alert-info mb-3" role="alert">
                <i className="fas fa-info-circle me-1"></i>
                Currently editing draft #{currentDraftId}
              </div>
            )}

            {/* Job post limit warning */}
            {mySubscription && typeof mySubscription.remainingJobPosts === 'number' && mySubscription.remainingJobPosts <= 2 && mySubscription.remainingJobPosts > 0 && mySubscription.remainingJobPosts !== -2147483647 && (
              <div className="alert alert-warning mb-3" role="alert">
                <i className="fas fa-exclamation-triangle me-1"></i>
                <strong>Warning:</strong> You have only {mySubscription.remainingJobPosts} job post{mySubscription.remainingJobPosts === 1 ? '' : 's'} remaining. 
                                 <Link href="/company-dashboard/packages" style={{ marginLeft: '8px', color: '#e60023', textDecoration: 'underline' }}>
                   Upgrade your package
                 </Link> to post more jobs.
              </div>
            )}

            {/* No job posts remaining */}
            {mySubscription && typeof mySubscription.remainingJobPosts === 'number' && mySubscription.remainingJobPosts <= 0 && mySubscription.remainingJobPosts !== -2147483647 && (
              <div className="alert alert-danger mb-3" role="alert">
                <i className="fas fa-ban me-1"></i>
                <strong>Job Post Limit Reached:</strong> You have used all your job posts for this package. 
                                 <Link href="/company-dashboard/packages" style={{ marginLeft: '8px', color: '#e60023', textDecoration: 'underline' }}>
                   Upgrade your package
                 </Link> to continue posting jobs.
              </div>
            )}

            <motion.button 
              type="submit" 
              className="theme-btn btn-style-one"
              disabled={isLoading || (mySubscription && typeof mySubscription.remainingJobPosts === 'number' && mySubscription.remainingJobPosts <= 0 && mySubscription.remainingJobPosts !== -2147483647)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={mySubscription && mySubscription.remainingJobPosts <= 0 ? 'No remaining job posts. Please upgrade your package.' : 'Post Job'}
            >
              {isLoading ? 'Posting...' : (
                <>
                  Post Job
                  {mySubscription && typeof mySubscription.remainingJobPosts === 'number' && (
                    <span className="remaining-count">
                      ({formatRemainingJobs(mySubscription.remainingJobPosts)} left)
                    </span>
                  )}
                </>
              )}
            </motion.button>
            {/* Trending Job Button */}
            {mySubscription && mySubscription.subscription && mySubscription.subscription.trendingJobLimit > 0 ? (
              <motion.button
                type="button"
                className="theme-btn btn-style-two ml-2"
                style={{ marginLeft: 12 }}
                disabled={isTrendingLoading || mySubscription.subscription.remainingTrendingJobPosts <= 0}
                onClick={handleTrendingSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={mySubscription.subscription.remainingTrendingJobPosts <= 0 ? 'No remaining trending job posts. Upgrade your package.' : 'Post as Trending Job'}
              >
                {isTrendingLoading ? 'Posting Trending...' : (
                  <>
                    Post as Trending Job
                    <span className="remaining-count">
                      ({mySubscription.subscription.remainingTrendingJobPosts} left)
                    </span>
                  </>
                )}
              </motion.button>
            ) : (
              <span style={{ marginLeft: 12, color: '#888', fontSize: 14 }}>
                Trending job posting is only available for Basic or Premium packages.
              </span>
            )}
          </motion.div>
        </div>
      </motion.form>
      
      {/* Draft Modal */}
      <DraftModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        onLoadDraft={handleLoadDraft}
        drafts={drafts}
        isLoading={isLoadingDrafts}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-confirm"
              onClick={handleConfirmDeleteDraft}
              style={{ marginLeft: 8 }}
            >
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this draft? This action cannot be undone.</p>
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
              setTimeout(() => {
                router.push("/company-dashboard/manage-jobs");
              }, 100);
            }}
          >
            Close
          </button>
        }
      >
        <p>Job posted successfully!</p>
      </Modal>

      {/* Success Modal for Trending Job */}
      <Modal
        open={showTrendingSuccessModal}
        onClose={() => setShowTrendingSuccessModal(false)}
        title="Success!"
        footer={
          <button
            className="btn-confirm"
            onClick={e => {
              e.preventDefault();
              setShowTrendingSuccessModal(false);
              setTimeout(() => {
                router.push("/company-dashboard/manage-jobs");
              }, 100);
            }}
          >
            Close
          </button>
        }
      >
        <p>Trending job posted successfully!</p>
      </Modal>

      {/* Upgrade Modal */}
      <Modal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Job Post Limit Reached"
        footer={
          <>
            <button className="btn-cancel" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
            <button className="btn-confirm" style={{ marginLeft: 8 }} onClick={() => { router.push('/company-dashboard/packages'); }}>Upgrade Package</button>
          </>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ marginBottom: '12px', color: '#e60023' }}>Job Post Limit Reached</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            You've reached the job posting limit for your <strong>{mySubscription?.subscription?.tier || 'Free'} tier</strong> ({mySubscription?.subscription?.jobPostLimit || 2} jobs).
          </p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '0', fontWeight: '600', color: '#495057' }}>
              Current Usage: {formatRemainingJobs(mySubscription?.remainingJobPosts) === 'unlimited' ? 'Unlimited' : `${mySubscription?.subscription?.jobPostLimit - (mySubscription?.remainingJobPosts || 0)} / ${mySubscription?.subscription?.jobPostLimit || 2}`} jobs
            </p>
          </div>
          <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
            Please upgrade your subscription to post more jobs and unlock additional features.
          </p>
        </div>
      </Modal>

      {/* Leave Confirmation Modal sử dụng đúng Modal component */}
      <Modal
        open={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        title="Do you want to leave this page?"
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
              onClick={handleSaveAndLeave}
              style={{ marginLeft: 8 }}
            >
              Save and Exit
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleLeave}
              style={{ marginLeft: 8 }}
            >
              Exit
            </button>
          </>
        }
      >
        <p>You have unsaved changes. What would you like to do</p>
      </Modal>

      <style jsx>{`
        .remaining-count {
          font-size: 12px;
          font-weight: 500;
          opacity: 0.8;
          margin-left: 6px;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 10px;
          white-space: nowrap;
        }
        
        .theme-btn.btn-style-two {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .theme-btn.btn-style-two:disabled .remaining-count {
          opacity: 0.5;
        }
      `}</style>
    </>
  );
};

export default PostBoxForm;