import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { industryService } from "@/services/industryService";
import { userService } from "@/services/userService";
import locationService from "@/services/locationService";
import { CheckCircleOutlined } from '@ant-design/icons';
import './styles/_becomeRecruiterModal.scss';

const BecomeRecruiterModal = ({ open, onCancel }) => {
  const { userId } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [requestSent, setRequestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    companyProfileDescription: '',
    location: '',
    teamSize: '',
    website: '',
    contact: '',
    industryId: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open) {
      locationService.getProvinces().then(data => {
        setProvinces(data);
      });
      fetchIndustries();
      setRequestSent(false);
      setForm({
        companyName: '',
        companyProfileDescription: '',
        location: '',
        teamSize: '',
        website: '',
        contact: '',
        industryId: '',
      });
      setFormErrors({});
      setStatusMessage('');
      setError(null);
    }
  }, [open]);

  const fetchIndustries = async () => {
    try {
      const data = await industryService.getAll();
      setIndustries(data);
    } catch (err) {
      setError("Failed to load industries");
    }
  };

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
    <div className={`modal fade${open ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: open ? 'rgba(0,0,0,0.5)' : 'none' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable">
        <div className="modal-content p-0" style={{ borderRadius: 20, overflow: 'hidden' }}>
          {/* Modal Header with Title */}
          <div className="modal-header bg-light" style={{ borderBottom: '1px solid #eee', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <h5 className="modal-title fw-bold" style={{ letterSpacing: 1 }}>Become Recruiter</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
          </div>
          <div className="modal-body" style={{ padding: '2rem' }}>
            <div id="become-recruiter-modal">
              <div className="login-form default-form">
                {requestSent ? (
                  <div className="success-message text-center p-4">
                    <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 20, color: '#52c41a' }} />
                    <div>{statusMessage}</div>
                    <button className="btn btn-primary mt-3" onClick={onCancel}>Close</button>
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
                        <option value="50 - 100">50 - 100</option>
                        <option value="100 - 150">100 - 150</option>
                        <option value="200 - 250">200 - 250</option>
                        <option value="300 - 350">300 - 350</option>
                        <option value="500 - 1000">500 - 1000</option>
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
                      <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCancel} disabled={loading}>Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
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
    </div>
  );
};

export default BecomeRecruiterModal; 