'use client'

import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormInfoBox from "./FormInfoBox";
import LogoCoverUploader from "./LogoCoverUploader";
import { useRouter } from 'next/navigation';
import { companyProfileService } from '@/services/companyProfileService';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from "react-redux";
import { setProfileUpdated } from "@/features/auth/authSlice";
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import { authService } from '@/services/authService';

const Index = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [companyProfileData, setCompanyProfileData] = useState({
        formData: {},
        logoFile: null,
        coverFile: null,
    });

    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [initialProfileData, setInitialProfileData] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // New states for unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCustomConfirmationModal, setShowCustomConfirmationModal] = useState(false);
    const [intendedPath, setIntendedPath] = useState(null);

    // New state for save confirmation
    const [showSaveConfirmationModal, setShowSaveConfirmationModal] = useState(false);

    const modalVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.8,
            y: -20
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -20,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    // Helper to compare form data (ignoring file objects for now as they are handled separately)
    const areFormDataEqual = (data1, data2) => {
        if (!data1 || !data2) return false;
        const keys1 = Object.keys(data1);
        const keys2 = Object.keys(data2);
        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (String(data1[key]) !== String(data2[key])) {
                return false;
            }
        }
        return true;
    };

    // Effect to update hasUnsavedChanges state based on form and file changes
    useEffect(() => {
        if (!isLoading) {
            let formValuesChanged = false;
            if (initialProfileData) {
                const currentFormData = companyProfileData.formData;
                const initialFormDataForComparison = {
                    companyName: initialProfileData.companyName || "",
                    phone: initialProfileData.contact || "",
                    website: initialProfileData.website || "",
                    teamSize: initialProfileData.teamSize || "51 - 100",
                    location: initialProfileData.location || "",
                    industryId: initialProfileData.industryId || 0,
                    aboutCompany: initialProfileData.companyProfileDescription || "",
                };
                formValuesChanged = !areFormDataEqual(currentFormData, initialFormDataForComparison);
            } else {
                const currentFormData = companyProfileData.formData;
                formValuesChanged = Object.values(currentFormData).some(value => {
                    if (typeof value === 'string') return value.trim() !== "";
                    if (typeof value === 'number') return value !== 0;
                    return false;
                });
            }

            const logoFileSelected = companyProfileData.logoFile !== null;
            const coverFileSelected = companyProfileData.coverFile !== null;

            setHasUnsavedChanges(formValuesChanged || logoFileSelected || coverFileSelected);
        }
    }, [companyProfileData, initialProfileData, isLoading]);

    // Fetch company profile data on component mount
    useEffect(() => {
        const fetchCompanyProfile = async () => {
            setIsLoading(true);
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error("User ID not found in localStorage.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await companyProfileService.getCompanyProfile(userId);
              
                setInitialProfileData(data);
                setCompanyProfileData(prevState => ({
                    ...prevState,
                    formData: {
                        companyName: data.companyName || "",
                        phone: data.contact || "",
                        website: data.website || "",
                        teamSize: data.teamSize || "51 - 100",
                        location: data.location || "",
                        industryId: data.industryId || "",
                        aboutCompany: data.companyProfileDescription || "",
                    },
                }));
                if (data.urlCompanyLogo) setLogoPreviewUrl(data.urlCompanyLogo);
                if (data.imageLogoLgr) setCoverPreviewUrl(data.imageLogoLgr);

                setHasUnsavedChanges(false);

            } catch (error) {
                console.error('Error fetching company profile:', error);
                // Check for 404 specifically for initial load scenarios
                if (error.response && error.response.status === 404) {
                    console.log("No existing company profile found.");
                } else {
                    console.error('Failed to fetch company profile:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyProfile();
    }, []);

    // Đưa handleBeforeUnload ra ngoài useEffect để có thể remove đúng instance
    // const handleBeforeUnload = (event) => {
    //     if (window.hasUnsavedChangesGlobal) {
    //         event.preventDefault();
    //         event.returnValue = '';
    //     }
    // };

    // Effect to handle browser refresh/close (uses native browser confirmation)
    // useEffect(() => {
    //     window.hasUnsavedChangesGlobal = hasUnsavedChanges;
    //     window.addEventListener('beforeunload', handleBeforeUnload);

    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    // }, [hasUnsavedChanges]);

    // Effect to handle in-app navigation
    useEffect(() => {
        const handleClick = (e) => {
            // Find the closest anchor tag
            const anchor = e.target.closest('a');
            if (anchor && anchor.href && !anchor.href.startsWith('javascript:') && hasUnsavedChanges) {
                e.preventDefault();
                e.stopPropagation();
                setShowCustomConfirmationModal(true);
                setIntendedPath(anchor.href);
                return false;
            }
        };

        // Handle programmatic navigation
        const handlePopState = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                setShowCustomConfirmationModal(true);
                setIntendedPath(window.location.href);
            }
        };

        document.addEventListener('click', handleClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleClick, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges]);

    const handleFormChange = (data) => {
        setCompanyProfileData(prevState => ({
            ...prevState,
            formData: data,
        }));
        if (validationErrors[Object.keys(data)[0]]) {
             setValidationErrors(prevErrors => {
                 const newErrors = { ...prevErrors };
                 delete newErrors[Object.keys(data)[0]];
                 return newErrors;
             });
         }
    };

    const handleLogoChange = (file) => {
        setCompanyProfileData(prevState => ({
            ...prevState,
            logoFile: file,
        }));
        if (file) {
            setLogoPreviewUrl(URL.createObjectURL(file));
             if (validationErrors.logoFile) {
                 setValidationErrors(prevErrors => {
                     const newErrors = { ...prevErrors };
                     delete newErrors.logoFile;
                     return newErrors;
                 });
             }
        } else {
            setLogoPreviewUrl(null);
        }
    };

    const handleCoverChange = (file) => {
        setCompanyProfileData(prevState => ({
            ...prevState,
            coverFile: file,
        }));
        if (file) {
            setCoverPreviewUrl(URL.createObjectURL(file));
             if (validationErrors.coverFile) {
                 setValidationErrors(prevErrors => {
                     const newErrors = { ...prevErrors };
                     delete newErrors.coverFile;
                     return newErrors;
                 });
             }
        } else {
            setCoverPreviewUrl(null);
        }
    };

    const validateForm = () => {
        const errors = {};
        const { formData, logoFile, coverFile } = companyProfileData;

        if (!formData.companyName || formData.companyName.trim() === '') {
            errors.companyName = 'Company name is required.';
        }
        if (!formData.phone || formData.phone.trim() === '') {
             errors.phone = 'Phone is required.';
         }
        if (!formData.website || formData.website.trim() === '') {
            errors.website = 'Website is required.';
        }
        if (!formData.location || formData.location.trim() === '') {
             errors.location = 'Location is required.';
         }
        if (!formData.teamSize || formData.teamSize.trim() === '') {
             errors.teamSize = 'Team Size is required.';
         }
        if (!formData.industryId) {
             errors.industryId = 'Industry is required.';
         }
        if (!formData.aboutCompany || formData.aboutCompany.trim() === '') {
            errors.aboutCompany = 'About Company is required.';
        }
        if (!logoFile && !logoPreviewUrl && !initialProfileData?.urlCompanyLogo) {
             errors.logoFile = 'Company logo is required.';
         }
         if (!coverFile && !coverPreviewUrl && !initialProfileData?.imageLogoLgr) {
             errors.coverFile = 'Company cover image is required.';
         }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        console.log("Attempting to save data:", companyProfileData);

        if (!validateForm()) {
            console.log("Form validation failed.", validationErrors);
            return false;
        }

        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("User ID not found in Local Storage. Please login again.");
            console.error("User ID not found in localStorage.");
            return false;
        }

        try {
            // Sử dụng FormData để gửi cả file và dữ liệu text
            const formData = new FormData();
            formData.append('CompanyName', companyProfileData.formData.companyName);
            formData.append('Contact', companyProfileData.formData.phone);
            formData.append('Website', companyProfileData.formData.website);
            formData.append('Location', companyProfileData.formData.location);
            formData.append('TeamSize', companyProfileData.formData.teamSize);
            formData.append('IndustryId', parseInt(companyProfileData.formData.industryId));
            formData.append('CompanyProfileDescription', companyProfileData.formData.aboutCompany);
            if (companyProfileData.logoFile) {
                formData.append('LogoFile', companyProfileData.logoFile);
            }
            if (companyProfileData.coverFile) {
                formData.append('LogoLgrFile', companyProfileData.coverFile);
            }

            setIsSaving(true);
            setConfirmLoading(true);

            // Gọi API với FormData
            const response = await companyProfileService.updateCompanyProfile(userId, formData);

            console.log('Profile update response:', response);
            
            // Store company ID if it's in the response
            if (response && response.id) {
                localStorage.setItem('CompanyProfileId', response.id);
                
            }
            
            toast.success("Profile updated successfully!");
            setShowSuccessModal(true);
            setIsEditing(false);
            setHasUnsavedChanges(false);
            setInitialProfileData(response); // Update initial data with saved data
            setCompanyProfileData(prev => ({
                ...prev,
                logoFile: null,
                coverFile: null,
            }));
            dispatch(setProfileUpdated(Date.now()));
        } catch (error) {
            console.error('Error saving profile:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const apiErrors = error.response.data.errors;
                const newValidationErrors = {};
                for (const key in apiErrors) {
                    newValidationErrors[key.toLowerCase()] = apiErrors[key][0];
                }
                setValidationErrors(newValidationErrors);
                toast.error("Validation errors occurred.");
            } else {
                toast.error("Failed to save profile.");
            }
        } finally {
            setIsSaving(false);
            setConfirmLoading(false);
        }
    };

    // Modal action handlers
    const handleSaveAndLeave = async () => {
        setShowCustomConfirmationModal(false);
        const saved = await handleSave();
        if (saved && intendedPath) {
            window.location.href = intendedPath;
        }
    };

    const handleDiscardAndLeave = () => {
        setShowCustomConfirmationModal(false);
        setHasUnsavedChanges(false);
        // window.removeEventListener('beforeunload', handleBeforeUnload);
        if (intendedPath) {
            window.location.href = intendedPath;
        }
    };

    const handleCancelConfirmation = () => {
        setShowCustomConfirmationModal(false);
        setIntendedPath(null);
    };

    // Clean up object URLs when component unmounts or files change
    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
            if (coverPreviewUrl) {
                URL.revokeObjectURL(coverPreviewUrl);
            }
        };
    }, [logoPreviewUrl, coverPreviewUrl]);

    // Effect to auto-hide notification
    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    const handleSaveClick = () => {
        setShowSaveConfirmationModal(true);
    };

    const handleConfirmSave = async () => {
        setShowSaveConfirmationModal(false);
        const success = await handleSave();
        if (success) {
            setShowSuccessModal(true);
        }
    };

    const handleCancelSave = () => {
        setShowSaveConfirmationModal(false);
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const PreviewProfileButton = () => {
        const [companyId, setCompanyId] = useState(null);
        const [userId, setUserId] = useState(null);
        
        const refreshIds = () => {
            const id = authService.getCompanyId();
            const currentUserId = localStorage.getItem('userId') || localStorage.getItem('UserId');
            
            setCompanyId(id);
            setUserId(currentUserId);
        };
        
        useEffect(() => {
            refreshIds();
        }, []);
        
        // Listen for profile updates
        useEffect(() => {
            if (initialProfileData && initialProfileData.id) {
                refreshIds();
            }
        }, [initialProfileData]);
        
        const handlePreview = async () => {
            const idToUse = companyId || userId;
            if (idToUse) {
                try {
                    // First try with company profile ID
                    if (companyId) {
                        window.open(`/company-detail/${companyId}`, '_blank');
                        return;
                    }
                    
                    // If no company profile ID, try to get company profile by user ID
                    if (userId) {
                        try {
                            // Try to fetch company profile by user ID first
                            const profileData = await companyProfileService.getCompanyProfile(userId);
                            if (profileData && profileData.id) {
                                // Store the company profile ID for future use
                                localStorage.setItem('CompanyProfileId', profileData.id);
                                window.open(`/company-detail/${profileData.id}`, '_blank');
                                return;
                            }
                        } catch (error) {
                            console.log('Could not fetch company profile by user ID:', error);
                        }
                        
                        // Fallback: try with user ID directly
                        window.open(`/company-detail/${userId}`, '_blank');
                    }
                } catch (error) {
                    console.error('Error previewing profile:', error);
                    toast.error('Error previewing profile. Please try again.');
                }
            } else {
                console.log('Cannot preview: no ID available');
                toast.error('Cannot preview profile. Please save your profile first.');
            }
        };
        
        const isDisabled = !companyId && !userId;
        
        return (
            <button
                className="btn-confirm"
                onClick={handlePreview}
                disabled={isDisabled}
                title={isDisabled ? "No ID found. Please save your profile first." : "Preview your company profile"}
            >
                Preview Profile
            </button>
        );
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="widget-content">
                {isLoading ? (
                    <div>Loading profile...</div>
                ) : (
                    <>
                        <div className="profile-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ margin: 0 }}>My Profile</h2>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {isEditing ? (
                                    <>
                                        <button className="btn-confirm" onClick={handleSaveClick}>Save</button>
                                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-confirm" onClick={handleEditProfile}>
                                            Edit Profile
                                        </button>
                                        <PreviewProfileButton key={initialProfileData?.id || 'no-profile'} />
                                    </>
                                )}
                            </div>
                        </div>
                        <LogoCoverUploader
                            onLogoChange={handleLogoChange}
                            onCoverChange={handleCoverChange}
                            logoPreviewUrl={logoPreviewUrl}
                            coverPreviewUrl={coverPreviewUrl}
                            validationErrors={validationErrors}
                            initialLogoUrl={initialProfileData?.urlCompanyLogo || null}
                            initialCoverUrl={initialProfileData?.imageLogoLgr || null}
                            isEditing={isEditing}
                        />

                        <FormInfoBox
                            onFormChange={handleFormChange}
                            validationErrors={validationErrors}
                            initialData={companyProfileData.formData}
                            isEditing={isEditing}
                        />

                        {/* Temporary Notification */}
                        {showNotification && (
                            <div
                                className="alert alert-success"
                                role="alert"
                                style={{
                                    position: 'fixed',
                                    bottom: '20px',
                                    right: '20px',
                                    zIndex: 1050,
                                    minWidth: '250px'
                                }}
                            >
                                {notificationMessage}
                            </div>
                        )}

                        {/* Save Confirmation Modal */}
                        <Modal
                            open={showSaveConfirmationModal}
                            onClose={handleCancelSave}
                            title="Confirm storage"
                            footer={
                                <>
                                    <button className="btn-cancel" onClick={handleCancelSave}>No</button>
                                    <button className="btn-confirm" onClick={handleConfirmSave}>Yes</button>
                                </>
                            }
                        >
                            <p>Are you sure you want to save this profile information?</p>
                        </Modal>

                        {/* Success Modal */}
                        <Modal
                            open={showSuccessModal}
                            onClose={handleCloseSuccessModal}
                            title="Success"
                            footer={
                                <button className="btn-confirm" onClick={handleCloseSuccessModal}>Close</button>
                            }
                        >
                            <div className="text-center">
                                <span style={{color: '#28a745', fontSize: '48px', marginBottom: '15px', display: 'inline-block'}}>
                                    <i className="fas fa-check-circle"></i>
                                </span>
                                <p>Profile saved successfully!</p>
                            </div>
                        </Modal>

                        {/* Custom Confirmation Modal */}
                        <Modal
                            open={showCustomConfirmationModal}
                            onClose={handleCancelConfirmation}
                            title="Unsaved Changes"
                            footer={
                                <>
                                    <button className="btn-cancel" onClick={handleDiscardAndLeave}>Discard Changes</button>
                                    <button className="btn-confirm" onClick={handleSaveAndLeave}>Save</button>
                                </>
                            }
                        >
                            <p>You have unsaved changes. Would you like to save them before leaving?</p>
                        </Modal>

                        {/* Progress Bar */}
                        <AnimatePresence>
                            {isSaving && (
                                <motion.div 
                                    className="progress-overlay"
                                    style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        backgroundColor: '#f0f0f0',
                                        zIndex: 9999
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div 
                                        className="progress-bar"
                                        style={{
                                            height: '100%',
                                            backgroundColor: '#0d47a1',
                                            width: '100%'
                                        }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{
                                            duration: 2,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </>
    );
};

export default Index;
