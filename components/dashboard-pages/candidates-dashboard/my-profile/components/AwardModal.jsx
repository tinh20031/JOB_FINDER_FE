import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const years = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const AwardModal = ({ open, onClose, onSubmit, award }) => {
  const [form, setForm] = useState({
    awardId: award?.awardId || 0,
    candidateProfileId: award?.candidateProfileId || 0,
    awardName: award?.awardName || "",
    awardOrganization: award?.awardOrganization || "",
    month: award?.month ? award.month.slice(5, 7) : "",
    year: award?.year ? award.year.slice(0, 4) : "",
    awardDescription: award?.awardDescription || "",
    createdAt: award?.createdAt || new Date().toISOString(),
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
      awardId: award?.awardId || 0,
      candidateProfileId: award?.candidateProfileId || 0,
      awardName: award?.awardName || "",
      awardOrganization: award?.awardOrganization || "",
      month: award?.month ? award.month.slice(5, 7) : "",
      year: award?.year ? award.year.slice(0, 4) : "",
      awardDescription: award?.awardDescription || "",
      createdAt: award?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors({});
    setTouched({});
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [award, open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!open && !show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    if (!form.awardName.trim()) newErrors.awardName = "Award Name is required.";

    if (!form.month) newErrors.month = "Month is required.";
    if (!form.year) newErrors.year = "Year is required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      awardName: true,
      awardOrganization: true,
      month: true,
      year: true,
    });
    if (Object.keys(validationErrors).length > 0) return;

    const toISO = (y, m) => (y && m ? `${y}-${m}-01T00:00:00.000Z` : null);
    const data = {
      ...form,
      month: toISO(form.year, form.month),
      year: toISO(form.year, form.month),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(data);
  };

  return (
    <>
      <style>{`
        .pro-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.4); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
          opacity: ${show ? 1 : 0};
          pointer-events: ${show ? "auto" : "none"};
        }
        .pro-modal-content {
          background: #fff; border-radius: 12px;
          width: 95vw; max-width: 800px; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px; position: relative; overflow-y: auto;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .pro-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
        .pro-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .pro-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group { margin-bottom: 24px; }
        .pro-label { font-size: 15px; font-weight: 600; color: #222; margin-bottom: 6px; display: block; }
        .pro-required { color: #e60023; margin-left: 2px; }
        .pro-input, .pro-select {
          width: 100%; border-radius: 8px; border: 1.5px solid #ddd; padding: 12px 14px; font-size: 16px;
          background: #fff; transition: border 0.2s;
        }
        .pro-input:focus, .pro-select:focus { border-color: #1967d2; outline: none; }
        .pro-input.error, .pro-select.error { border: 2px solid #e60023 !important; }
        .pro-input.valid, .pro-select.valid { border: 2px solid #28a745 !important; }
        .pro-error { color: #e60023; font-size: 13px; margin-top: 4px; min-height: 18px; }
        .pro-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          border-top: 1px solid #eee; padding-top: 24px; margin-top: 16px;
        }
        .pro-btn-cancel, .pro-btn-save { padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; }
        .pro-btn-cancel { background: #fff; border: 1.5px solid #e60023; color: #e60023; }
        .pro-btn-save { background: #e60023; color: #fff; border: none; }
        .field-tip { background: #fff9e6; border-left: 3px solid #ffc107; padding: 12px; margin-bottom: 20px; font-size: 15px; }
        /* Quill editor styles */
        .quill { border-radius: 8px; }
        .ql-toolbar.ql-snow { border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1.5px solid #ddd; border-bottom: none}
        .ql-container.ql-snow { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border: 1.5px solid #ddd; }
        .ql-editor { min-height: 120px; }
        .ql-editor p { margin: 0; line-height: 1.5; }
        .char-counter { font-size: 12px; color: #888; text-align: right; margin-top: 4px; }
      `}</style>
      <div className="pro-modal-overlay">
        <div className="pro-modal-content">
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
          <div className="pro-modal-title">Award</div>
          <div className="field-tip">
            💡 <b>Tips:</b> Share your achievements and recognitions that
            demonstrate your skills and capabilities.
          </div>
          <form className="pro-modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="pro-label">
                Award Name <span className="pro-required">*</span>
              </label>
              <input
                name="awardName"
                className={`pro-input${
                  errors.awardName ||
                  (touched.awardName && !form.awardName.trim())
                    ? " error"
                    : form.awardName.trim()
                    ? " valid"
                    : ""
                }`}
                value={form.awardName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="pro-error">
                {(errors.awardName ||
                  (touched.awardName && !form.awardName.trim())) &&
                  "Please enter your award name"}
              </div>
            </div>
            <div className="form-group">
              <label className="pro-label">Award Organization (Optional)</label>
              <input
                name="award"
                className="pro-input"
                value={form.award}
                onChange={handleChange}
              />
            </div>

            <div className="pro-modal-grid">
              <div className="form-group">
                <label className="pro-label">
                  Issue Date <span className="pro-required">*</span>
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="month"
                    className={`pro-select${
                      errors.month || (touched.month && !form.month)
                        ? " error"
                        : form.month
                        ? " valid"
                        : ""
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
                    className={`pro-select${
                      errors.year || (touched.year && !form.year)
                        ? " error"
                        : form.year
                        ? " valid"
                        : ""
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
                <div className="pro-error">
                  {(errors.month || (touched.month && !form.month)) &&
                    errors.month}
                  {(errors.year || (touched.year && !form.year)) && errors.year}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="pro-label">Award Description (Optional)</label>
              <ReactQuill
                theme="snow"
                value={form.awardDescription}
                onChange={(value) =>
                  handleQuillChange("awardDescription", value)
                }
                modules={quillModules}
              />
              <div className="char-counter">
                {form.awardDescription.length}/2500
              </div>
            </div>

            <div className="pro-modal-actions">
              <button
                type="button"
                className="pro-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="pro-btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AwardModal;
