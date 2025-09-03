'use client'

import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { industryService } from '@/services/industryService';
import locationService from '@/services/locationService';
import teamSizeService from '@/services/teamSizeService';
import { userService } from '@/services/userService';
import { CheckCircleOutlined } from '@ant-design/icons';
import './styles/_becomeRecruiterModal.scss';

const BecomeRecruiterModal = ({ isOpen, onClose, onSuccess }) => {
  const { userId } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    companyName: '',
    companyProfileDescription: '',
    location: '',
    teamSize: '',
    website: '',
    contact: '',
    industryId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [teamSizes, setTeamSizes] = useState([]);
  const [requestSent, setRequestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        companyName: '',
        companyProfileDescription: '',
        location: '',
        teamSize: '',
        website: '',
        contact: '',
        industryId: ''
      });
      setFormErrors({});
      setSuccess(false);
      setRequestSent(false);
      setStatusMessage('');
      setError(null);
    }
  }, [isOpen]);

  // Fetch provinces and industries on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data with individual error handling for better resilience
        const [provincesData, industriesData, teamSizesData] = await Promise.allSettled([
          locationService.getProvinces(),
          industryService.getAll(),
          teamSizeService.getAllTeamSizes()
        ]);
        
        // Handle provinces
        if (provincesData.status === 'fulfilled') {
          setProvinces(provincesData.value.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          setProvinces([]); // Set empty array as fallback
        }
        
        // Handle industries
        if (industriesData.status === 'fulfilled') {
          setIndustries(industriesData.value.sort((a, b) => a.industryName.localeCompare(b.industryName)));
        } else {
          setIndustries([]); // Set empty array as fallback
        }
        
        // Handle team sizes
        if (teamSizesData.status === 'fulfilled') {
          setTeamSizes(teamSizesData.value);
        } else {
          setTeamSizes(teamSizeService.getStaticTeamSizeOptions());
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Set fallback values for all data
        setProvinces([]);
        setIndustries([]);
        setTeamSizes(teamSizeService.getStaticTeamSizeOptions());
      }
    };
    fetchData();
  }, []);

  // Lock body scroll when modal is open to prevent background layout from scrolling/shifting
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  const validate = () => {
    const errors = {};
    if (!form.companyName) errors.companyName = 'Please enter company name';
    if (!form.companyProfileDescription) errors.companyProfileDescription = 'Please enter description';
    if (!form.location) errors.location = 'Please select location';
    if (!form.teamSize) errors.teamSize = 'Please enter team size';
    if (!form.contact) errors.contact = 'Please enter contact';
    if (!form.industryId) errors.industryId = 'Please select industry';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOk = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      if (!userId) {
        setFormErrors({ general: "You must be logged in to submit this request." });
        setLoading(false);
        return;
      }
      const payload = {
        userId: Number(userId),
        companyName: form.companyName,
        companyProfileDescription: form.companyProfileDescription,
        location: form.location,
        teamSize: form.teamSize,
        website: form.website,
        contact: form.contact,
        industryId: Number(form.industryId),
      };
      await userService.requestBecomeRecruiter(payload);
      setRequestSent(true);
      setStatusMessage("We have received your request, please wait...");
      if (userId) localStorage.setItem('recruiterRequestSent_' + userId, '1');
    } catch (err) {
      if (err.response && typeof err.response.data === 'string' && err.response.data.includes("You have submitted a request before please wait")) {
        setRequestSent(true);
        setStatusMessage(err.response.data);
        if (userId) {
          localStorage.setItem('recruiterRequestSent_' + userId, '1');
        }
      } else {
        setFormErrors({ general: "Failed to submit request" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div
      id="become-recruiter-modal-root"
      className={`modal fade brm-overlay${isOpen ? ' show d-block brm-open' : ''}`}
      tabIndex="-1"
      style={{
        background: isOpen ? 'rgba(0,0,0,0.5)' : 'none',
        ...(isOpen ? { position: 'fixed', inset: 0, overflowY: 'auto' } : {}),
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable brm-dialog"
           onWheel={(e) => e.stopPropagation()}>
        <div className="modal-content p-0 brm-content" style={{ borderRadius: 20, overflow: 'hidden' }} onWheel={(e) => e.stopPropagation()}>
          {/* Modal Header with Title */}
          <div className="modal-header bg-light brm-header" style={{ borderBottom: '1px solid #eee', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <h5 className="modal-title fw-bold" style={{ letterSpacing: 1 }}>
              Become Recruiter
              <span className="brm-subtitle">Fill in company details to request recruiter access</span>
            </h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }} onWheel={(e) => e.stopPropagation()}>
            <div id="become-recruiter-modal">
              <div className="login-form default-form">
                {requestSent ? (
                  <div className="success-message text-center p-4">
                    <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 20, color: '#52c41a' }} />
                    <div>{statusMessage}</div>
                    <button className="btn btn-primary mt-3" onClick={onClose}>Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleOk} className="become-recruiter-form">
                    {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Company Name<span className="text-danger">*</span></label>
                      <input type="text" className={`form-control rounded-pill py-2${formErrors.companyName ? ' is-invalid' : ''}`} name="companyName" value={form.companyName} onChange={handleChange} style={{ minHeight: 40 }} />
                      {formErrors.companyName && <div className="invalid-feedback">{formErrors.companyName}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description<span className="text-danger">*</span></label>
                      <textarea className={`form-control rounded-4 py-2${formErrors.companyProfileDescription ? ' is-invalid' : ''}`} name="companyProfileDescription" rows={4} value={form.companyProfileDescription} onChange={handleChange} style={{ minHeight: 80, resize: 'vertical' }}></textarea>
                      {formErrors.companyProfileDescription && <div className="invalid-feedback">{formErrors.companyProfileDescription}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Location<span className="text-danger">*</span></label>
                      <select className={`form-select rounded-pill py-2${formErrors.location ? ' is-invalid' : ''}`} name="location" value={form.location} onChange={handleSelectChange} style={{ minHeight: 40 }}>
                        <option value="">Select a province/city</option>
                        {provinces.map((item) => (
                          <option key={item.code} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Team Size<span className="text-danger">*</span></label>
                      <select className={`form-select rounded-pill py-2${formErrors.teamSize ? ' is-invalid' : ''}`} name="teamSize" value={form.teamSize} onChange={handleSelectChange} style={{ minHeight: 40 }}>
                        <option value="">Select team size</option>
                        {teamSizes.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      {formErrors.teamSize && <div className="invalid-feedback">{formErrors.teamSize}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Website</label>
                      <input type="text" className="form-control rounded-pill py-2" name="website" value={form.website} onChange={handleChange} style={{ minHeight: 40 }} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Contact<span className="text-danger">*</span></label>
                      <input type="text" className={`form-control rounded-pill py-2${formErrors.contact ? ' is-invalid' : ''}`} name="contact" value={form.contact} onChange={handleChange} style={{ minHeight: 40 }} />
                      {formErrors.contact && <div className="invalid-feedback">{formErrors.contact}</div>}
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Industry<span className="text-danger">*</span></label>
                      <select className={`form-select rounded-pill py-2${formErrors.industryId ? ' is-invalid' : ''}`} name="industryId" value={form.industryId} onChange={handleSelectChange} style={{ minHeight: 40 }}>
                        <option value="">Select industry</option>
                        {industries.map((item) => (
                          <option key={item.industryId} value={item.industryId}>{item.industryName}</option>
                        ))}
                      </select>
                      {formErrors.industryId && <div className="invalid-feedback">{formErrors.industryId}</div>}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-outline-secondary rounded-pill px-4 brm-btn" onClick={onClose} disabled={loading}>Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-4 brm-btn-primary" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .brm-overlay { transition: background .25s ease; }
        .brm-open { animation: brmFadeIn .25s ease; }
        @keyframes brmFadeIn { from { background: rgba(0,0,0,0.0); } to { background: rgba(0,0,0,0.5); } }

        .brm-dialog { transform: translateY(10px) scale(.98); opacity: 0; animation: brmDialogIn .28s ease forwards; }
        @keyframes brmDialogIn { to { transform: translateY(0) scale(1); opacity: 1; } }

        .brm-content { box-shadow: 0 20px 50px rgba(2,6,23,0.18); border: 1px solid #eef2f7; }
        .brm-header { background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); }
        .brm-header .modal-title { display: flex; flex-direction: column; gap: 4px; }
        .brm-subtitle { display: block; font-weight: 500; font-size: 12px; color: #6b7280; letter-spacing: 0; }

        /* Inputs & selects focus style */
        #become-recruiter-modal .form-control,
        #become-recruiter-modal .form-select {
          transition: border-color .2s ease, box-shadow .2s ease, transform .05s ease;
          border-width: 2px;
        }
        #become-recruiter-modal .form-control:focus,
        #become-recruiter-modal .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99,102,241,.12);
        }
        #become-recruiter-modal .form-control:hover,
        #become-recruiter-modal .form-select:hover { border-color: #cbd5e1; }

        /* Buttons */
        .brm-btn { transition: transform .15s ease, box-shadow .15s ease; }
        .brm-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(2,6,23,0.08); }
        .brm-btn-primary { background: linear-gradient(135deg, #6366f1, #7c3aed); border: none; box-shadow: 0 8px 20px rgba(99,102,241,.35); }
        .brm-btn-primary:hover { filter: brightness(1.03); transform: translateY(-1px); }

        /* Success animation */
        .success-message { animation: brmPop .28s ease; }
        @keyframes brmPop { from { transform: scale(.96); opacity: .6; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default BecomeRecruiterModal; 