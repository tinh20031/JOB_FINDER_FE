import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const years = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const CertificateModal = ({ open, onClose, onSubmit, certificate }) => {
  const [form, setForm] = useState({
    certificateId: certificate?.certificateId || 0,
    candidateProfileId: certificate?.candidateProfileId || 0,
    certificateName: certificate?.certificateName || "",
    organization: certificate?.organization || "",
    month: certificate?.month ? certificate.month.slice(5, 7) : "",
    year: certificate?.year ? certificate.year.slice(0, 4) : "",
    certificateUrl: certificate?.certificateUrl || "",
    certificateDescription: certificate?.certificateDescription || "",
    createdAt: certificate?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  };

  useEffect(() => {
    setForm({
      certificateId: certificate?.certificateId || 0,
      candidateProfileId: certificate?.candidateProfileId || 0,
      certificateName: certificate?.certificateName || "",
      organization: certificate?.organization || "",
      month: certificate?.month ? certificate.month.slice(5, 7) : "",
      year: certificate?.year ? certificate.year.slice(0, 4) : "",
      certificateUrl: certificate?.certificateUrl || "",
      certificateDescription: certificate?.certificateDescription || "",
      createdAt: certificate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors({});
    setTouched({});
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [certificate, open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!open && !show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      certificateName: true,
      organization: true,
      month: true,
      year: true,
    });
    if (Object.keys(validationErrors).length > 0) return;

    // Chuyển tháng/năm về ISO string cho API
    const toISO = (y, m) => (y && m ? `${y}-${m}-01T00:00:00.000Z` : null);
    const data = {
      ...form,
      month: toISO(form.year, form.month),
      year: toISO(form.year, form.month),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuillChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.certificateName.trim())
      newErrors.certificateName = "Certificate Name is required.";

    if (!form.month) newErrors.month = "Month is required.";
    if (!form.year) newErrors.year = "Year is required.";
    return newErrors;
  };

  return (
    <>
      <style>{`
        .cer-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.4); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
          opacity: ${show ? 1 : 0};
          pointer-events: ${show ? "auto" : "none"};
        }
        .cer-modal-content {
          background: #fff; border-radius: 12px;
          width: 95vw; max-width: 800px; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px; position: relative; overflow-y: auto;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .cer-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
        .cer-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .form-group { margin-bottom: 24px; }
        .cer-label { font-size: 15px; font-weight: 600; color: #222; margin-bottom: 6px; display: block; }
        .cer-required { color: #e60023; margin-left: 2px; }
        .cer-input, .cer-select {
          width: 100%; border-radius: 8px; border: 1.5px solid #ddd; padding: 12px 14px; font-size: 16px;
          background: #fff; transition: border 0.2s;
        }
        .cer-input:focus, .cer-select:focus { border-color: #1967d2; outline: none; }
        .cer-input.error, .cer-select.error { border: 2px solid #e60023 !important; }
        .cer-input.valid, .cer-select.valid { border: 2px solid #28a745 !important; }
        .cer-error { color: #e60023; font-size: 13px; margin-top: 4px; min-height: 18px; }
        .cer-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          border-top: 1px solid #eee; padding-top: 24px; margin-top: 16px;
        }
        .cer-btn-cancel, .cer-btn-save { padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; }
        .cer-btn-cancel { background: #fff; border: 1.5px solid #e60023; color: #e60023; }
        .cer-btn-save { background: #e60023; color: #fff; border: none; }
        /* Quill editor styles */
        .quill { border-radius: 8px; }
        .ql-toolbar.ql-snow { border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1.5px solid #ddd; border-bottom: none}
        .ql-container.ql-snow { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border: 1.5px solid #ddd; }
        .ql-editor { min-height: 120px; }
        .ql-editor p { margin: 0; line-height: 1.5; }
      `}</style>
      <div className="cer-modal-overlay">
        <div className="cer-modal-content">
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 16,
              right: 24,
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ×
          </button>
          <div className="cer-modal-title">Certificate</div>
          <form className="cer-modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="cer-label">
                Certificate Name <span className="cer-required">*</span>
              </label>
              <input
                name="certificateName"
                className={`cer-input${
                  errors.certificateName ||
                  (touched.certificateName && !form.certificateName.trim())
                    ? " error"
                    : form.certificateName.trim()
                    ? " valid"
                    : ""
                }`}
                value={form.certificateName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="cer-error">
                {(errors.certificateName ||
                  (touched.certificateName && !form.certificateName.trim())) &&
                  "Certificate Name is required."}
              </div>
            </div>
            <div className="form-group">
              <label className="cer-label">Organization (Optional)</label>
              <input
                name="organization"
                className="cer-input"
                value={form.organization}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="cer-label">
                Issue date <span className="cer-required">*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <select
                  name="month"
                  className={`cer-select${
                    errors.month ? " error" : form.month ? " valid" : ""
                  }`}
                  value={form.month}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  name="year"
                  className={`cer-select${
                    errors.year ? " error" : form.year ? " valid" : ""
                  }`}
                  value={form.year}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cer-error">
                {(errors.month || (touched.month && !form.month)) &&
                  "Month is required. "}
                {(errors.year || (touched.year && !form.year)) &&
                  "Year is required."}
              </div>
            </div>

            <div className="form-group">
              <label className="cer-label">Certificate URL (Optional)</label>
              <input
                name="certificateUrl"
                type="url"
                className="cer-input"
                value={form.certificateUrl}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="cer-label">Description (Optional)</label>
              <ReactQuill
                theme="snow"
                value={form.certificateDescription}
                onChange={(value) =>
                  handleQuillChange("certificateDescription", value)
                }
                modules={quillModules}
              />
            </div>
            <div className="cer-modal-actions">
              <button
                type="button"
                className="cer-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="cer-btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CertificateModal;
