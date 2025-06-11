'use client'

import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormInfoBox from "./FormInfoBox";
import LogoCoverUploader from "./LogoCoverUploader";
import { useRouter } from 'next/navigation';
import { companyProfileService } from '@/services/companyProfileService';

const Index = () => {
    const router = useRouter();

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
                    teamSize: initialProfileData.teamSize || "50 - 100",
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
                console.log("Fetched company profile data:", data);
                setInitialProfileData(data);
                setCompanyProfileData(prevState => ({
                    ...prevState,
                    formData: {
                        companyName: data.companyName || "",
                        phone: data.contact || "",
                        website: data.website || "",
                        teamSize: data.teamSize || "50 - 100",
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

    // Effect to handle browser refresh/close (uses native browser confirmation)
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = ''; // Standard way to trigger browser confirmation dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // Effect to trap browser back/forward navigation when unsaved changes exist
    useEffect(() => {
        const handlePopState = (event) => {
            if (hasUnsavedChanges) {
                // Get the path the browser was trying to navigate to.
                // For a popstate event, this is the window.location.pathname *after* the pop.
                const pathAttempted = window.location.pathname;

                // Push the current component's path back onto the history stack.
                // This effectively "cancels" the browser's automatic navigation from popstate.
                window.history.pushState(null, '', router.asPath);

                setShowCustomConfirmationModal(true);
                setIntendedPath(pathAttempted);
            }
        };

        // This ensures a history entry is added *once* when unsaved changes become true.
        // This is the "trap" entry. When the user clicks back, this entry is popped,
        // and if they still have unsaved changes, `handlePopState` will then run.
        if (hasUnsavedChanges) {
            window.history.pushState(null, '', router.asPath);
        }

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges, router.asPath]);

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
            alert("Không tìm thấy User ID trong Local Storage. Vui lòng đăng nhập lại.");
            console.error("User ID not found in localStorage.");
            return false;
        }

        const apiFormData = new FormData();

        apiFormData.append('UserId', userId);
        apiFormData.append('CompanyName', companyProfileData.formData.companyName || '');
        apiFormData.append('CompanyProfileDescription', companyProfileData.formData.aboutCompany || '');
        apiFormData.append('Location', companyProfileData.formData.location || '');
        apiFormData.append('TeamSize', companyProfileData.formData.teamSize || '');
        apiFormData.append('Website', companyProfileData.formData.website || '');
        apiFormData.append('Contact', companyProfileData.formData.phone || '');
        apiFormData.append('IndustryId', parseInt(companyProfileData.formData.industryId) || 0);

        if (companyProfileData.logoFile) {
            apiFormData.append('logoFile', companyProfileData.logoFile);
        }
        if (companyProfileData.coverFile) {
            apiFormData.append('logoLgrFile', companyProfileData.coverFile);
        }

        try {
            const payload = {
                CompanyName: formData.companyName,
                Contact: formData.phone,
                Website: formData.website,
                Location: formData.location,
                TeamSize: formData.teamSize,
                IndustryId: parseInt(formData.industryId),
                CompanyProfileDescription: formData.aboutCompany,
            };

            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast.error("User ID not found.");
                return;
            }

            setIsSaving(true);
            setConfirmLoading(true);

            const response = await companyProfileService.updateCompanyProfile(userId, payload);

            console.log('Profile update response:', response);
            toast.success("Profile updated successfully!");
            setShowSuccessModal(true);
            setIsEditing(false);
            setHasUnsavedChanges(false);
            setInitialProfileData(response); // Update initial data with saved data
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
            router.push(intendedPath);
        }
    };

    const handleDiscardAndLeave = () => {
        setShowCustomConfirmationModal(false);
        setHasUnsavedChanges(false);
        if (initialProfileData) {
            setCompanyProfileData(prevState => ({
                ...prevState,
                formData: {
                    companyName: initialProfileData.companyName || "",
                    phone: initialProfileData.contact || "",
                    website: initialProfileData.website || "",
                    teamSize: initialProfileData.teamSize || "50 - 100",
                    location: initialProfileData.location || "",
                    industryId: initialProfileData.industryId || 0,
                    aboutCompany: initialProfileData.companyProfileDescription || "",
                },
                logoFile: null,
                coverFile: null,
            }));
            setLogoPreviewUrl(initialProfileData.urlCompanyLogo || null);
            setCoverPreviewUrl(initialProfileData.imageLogoLgr || null);
        } else {
            setCompanyProfileData({
                formData: {
                    companyName: "", phone: "", website: "", teamSize: "50 - 100", location: "", industryId: 0, aboutCompany: "",
                },
                logoFile: null,
                coverFile: null,
            });
            setLogoPreviewUrl(null);
            setCoverPreviewUrl(null);
        }
        if (intendedPath) {
            router.push(intendedPath);
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

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="widget-content">
                {isLoading ? (
                    <div>Loading profile...</div>
                ) : (
                    <>
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

                        <div className="form-group col-lg-12 col-md-12">
                            {!isEditing && initialProfileData && (
                               <button className="theme-btn btn-style-one" onClick={() => setIsEditing(true)}>
                                   Edit Profile
                               </button>
                            )}
                            {isEditing && (
                               <>
                                   <button className="theme-btn btn-style-one me-2" onClick={handleSave}>
                                       Save Profile
                                   </button>
                                   <button className="theme-btn btn-style-three" onClick={() => {
                                        if (hasUnsavedChanges) {
                                            setShowCustomConfirmationModal(true);
                                            setIntendedPath(null);
                                        } else {
                                            setIsEditing(false);
                                        }
                                   }}>
                                       Cancel
                                   </button>
                               </>
                            )}
                            {!initialProfileData && !isEditing && (
                                <button className="theme-btn btn-style-one" onClick={() => setIsEditing(true)}>
                                    Create Profile
                                </button>
                            )}
                        </div>

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

                        {/* Success Modal */}
                        {showSuccessModal && (
                            <div className="modal-overlay">
                                <div className="modal-content" style={{ textAlign: 'center', padding: 32, width: '100%', maxWidth: '350px', minWidth: '0' }}>
                                    <h2 style={{ color: 'green' }}>Success!</h2>
                                    <p>Company profile updated successfully!</p>
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

                        {/* Custom Confirmation Modal */}
                        {showCustomConfirmationModal && (
                            <div className="modal-overlay" style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 1000
                            }}>
                                <div className="modal-content" style={{
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                                    maxWidth: '450px',
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                                    <h2 style={{ color: '#ffc107', marginBottom: '15px' }}>Unsaved Changes!</h2>
                                    <p style={{ marginBottom: '25px' }}>You have unsaved changes. Do you want to save them before leaving?</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
                                        <button
                                            style={{
                                                background: '#0d47a1',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 20px',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                            onClick={handleSaveAndLeave}
                                        >
                                            Save & Leave
                                        </button>
                                        <button
                                            style={{
                                                background: '#dc3545',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 20px',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                            onClick={handleDiscardAndLeave}
                                        >
                                            Discard & Leave
                                        </button>
                                        <button
                                            style={{
                                                background: '#6c757d',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '10px 20px',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                            onClick={handleCancelConfirmation}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Index;
