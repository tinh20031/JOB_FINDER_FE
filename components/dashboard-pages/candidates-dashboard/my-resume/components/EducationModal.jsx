import React, { useState, useEffect } from "react";

const degreeOptions = ["College", "Bachelor", "Master", "PhD", "Other"];
const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const years = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const EducationModal = ({ open, onClose, onSubmit, education }) => {
  const [form, setForm] = useState({
    educationId: education?.educationId || 0,
    candidateProfileId: education?.candidateProfileId || 0,
    school: education?.school || "",
    degree: education?.degree || "",
    major: education?.major || "",
    isStudying: education?.isStudying || false,
    monthStart: education?.monthStart ? education.monthStart.slice(5, 7) : "",
    yearStart: education?.yearStart ? education.yearStart.slice(0, 4) : "",
    monthEnd: education?.monthEnd ? education.monthEnd.slice(5, 7) : "",
    yearEnd: education?.yearEnd ? education.yearEnd.slice(0, 4) : "",
    detail: education?.detail || "",
    createdAt: education?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setForm({
      educationId: education?.educationId || 0,
      candidateProfileId: education?.candidateProfileId || 0,
      school: education?.school || "",
      degree: education?.degree || "",
      major: education?.major || "",
      isStudying: education?.isStudying || false,
      monthStart: education?.monthStart ? education.monthStart.slice(5, 7) : "",
      yearStart: education?.yearStart ? education.yearStart.slice(0, 4) : "",
      monthEnd: education?.monthEnd ? education.monthEnd.slice(5, 7) : "",
      yearEnd: education?.yearEnd ? education.yearEnd.slice(0, 4) : "",
      detail: education?.detail || "",
      createdAt: education?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors({});
    setTouched({});
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [education, open]);

  if (!open && !show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isStudying") {
      setForm((prev) => ({
        ...prev,
        isStudying: checked,
        monthEnd: checked ? "" : prev.monthEnd,
        yearEnd: checked ? "" : prev.yearEnd,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    let endBeforeStart = false;
    if (!form.school.trim()) newErrors.school = "School is required.";
    if (!form.major.trim()) newErrors.major = "Major is required.";
    if (!form.degree.trim()) newErrors.degree = "Degree is required.";
    if (!form.monthStart) newErrors.monthStart = "Month is required.";
    if (!form.yearStart) newErrors.yearStart = "Year is required.";
    if (!form.isStudying) {
      if (!form.monthEnd) newErrors.monthEnd = "Month is required.";
      if (!form.yearEnd) newErrors.yearEnd = "Year is required.";
      // Validate end > start
      if (form.monthStart && form.yearStart && form.monthEnd && form.yearEnd) {
        const start = new Date(
          `${form.yearStart}-${form.monthStart}-01T00:00:00.000Z`
        );
        const end = new Date(
          `${form.yearEnd}-${form.monthEnd}-01T00:00:00.000Z`
        );
        if (end <= start) {
          endBeforeStart = true;
        }
      }
    }
    if (endBeforeStart) {
      newErrors.dateRange =
        "Please enter an end date bigger than the start date.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      school: true,
      major: true,
      degree: true,
      monthStart: true,
      yearStart: true,
      monthEnd: true,
      yearEnd: true,
    });
    if (Object.keys(validationErrors).length > 0) return;
    setShow(false);
    setTimeout(() => {
      // Chuyển tháng/năm về ISO string cho API
      const toISO = (y, m) => (y && m ? `${y}-${m}-01T00:00:00.000Z` : null);
      const data = {
        ...form,
        monthStart: toISO(form.yearStart, form.monthStart),
        yearStart: toISO(form.yearStart, form.monthStart),
        monthEnd: form.isStudying ? null : toISO(form.yearEnd, form.monthEnd),
        yearEnd: form.isStudying ? null : toISO(form.yearEnd, form.monthEnd),
        updatedAt: new Date().toISOString(),
      };
      onSubmit(data);
    }, 300); // match animation
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      <style>{`
        .edu-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
          opacity: ${show ? 1 : 0};
          pointer-events: ${show ? "auto" : "none"};
        }
        .edu-modal-content {
          background: #fff; border-radius: 12px; min-width: 320px;
          width: 95vw; max-width: 700px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 32px 0 32px; position: relative; overflow-y: auto;
          padding-bottom: 30px;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .edu-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
        .edu-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .edu-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; }
        @media (max-width: 700px) { .edu-modal-grid { grid-template-columns: 1fr; gap: 18px; } }
        .edu-label { font-size: 15px; font-weight: 600; color: #222; margin-bottom: 6px; display: flex; align-items: center; }
        .edu-required { color: #e60023; margin-left: 2px; }
        .edu-input, .edu-select {
          width: 100%; border-radius: 8px; border: 1.5px solid #ddd; padding: 12px 14px; font-size: 16px;
          margin-bottom: 0; background: #fff; transition: border 0.2s;
        }
        .edu-input:focus, .edu-select:focus { border: 1.5px solid #1967d2; outline: none; }
        .edu-input.error, .edu-select.error { border: 2px solid #e60023 !important; }
        .edu-input.valid, .edu-select.valid { border: 2px solid #28a745 !important; }
        .edu-error { color: #e60023; font-size: 13px; margin-top: 2px; min-height: 18px; }
        .edu-checkbox-row { display: flex; align-items: center; gap: 8px; margin: 0 0 8px 0; cursor: pointer; flex-wrap: nowrap; }
        .edu-checkbox {
          width: 18px; height: 18px; accent-color: #1967d2; margin: 0; flex-shrink: 0;
        }
        .edu-checkbox-row span { margin: 0; white-space: nowrap; line-height: 1; }
        .edu-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          background: #fff; border-top: 1px solid #eee; padding: 18px 0 0 0; margin-top: 24px;
        }
        .edu-btn-cancel {
          background: #fff; border: 1.5px solid #e60023; color: #e60023;
          padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer;
        }
        .edu-btn-save {
          background: #e60023; color: #fff; border: none;
          padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer;
        }
      `}</style>
      <div className="edu-modal-overlay">
        <div className="edu-modal-content">
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
            aria-label="Close"
          >
            ×
          </button>
          <div className="edu-modal-title">Education</div>
          <form
            className="edu-modal-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="edu-modal-grid">
              <div>
                <label className="edu-label">
                  School <span className="edu-required">*</span>
                </label>
                <input
                  name="school"
                  className={`edu-input${
                    errors.school || (touched.school && !form.school.trim())
                      ? " error"
                      : form.school.trim()
                      ? " valid"
                      : ""
                  }`}
                  placeholder="School"
                  value={form.school}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <div className="edu-error">
                  {(errors.school || (touched.school && !form.school.trim())) &&
                    "Please enter your school"}
                </div>
              </div>
              <div>
                <label className="edu-label">
                  Degree <span className="edu-required">*</span>
                </label>
                <select
                  name="degree"
                  className={`edu-select${
                    errors.degree || (touched.degree && !form.degree.trim())
                      ? " error"
                      : form.degree.trim()
                      ? " valid"
                      : ""
                  }`}
                  value={form.degree}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Select degree</option>
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="edu-error">
                  {(errors.degree || (touched.degree && !form.degree.trim())) &&
                    "Please select your degree"}
                </div>
              </div>
              <div>
                <label className="edu-label">
                  Major <span className="edu-required">*</span>
                </label>
                <input
                  name="major"
                  className={`edu-input${
                    errors.major || (touched.major && !form.major.trim())
                      ? " error"
                      : form.major.trim()
                      ? " valid"
                      : ""
                  }`}
                  placeholder="Major"
                  value={form.major}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <div className="edu-error">
                  {(errors.major || (touched.major && !form.major.trim())) &&
                    "Please enter your major"}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', margin: '0', flexShrink: '0' }}
                  name="isStudying"
                  checked={form.isStudying}
                  onChange={handleChange}
                  id="isStudying"
                />
                <label htmlFor="isStudying" style={{ margin: '0', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                  I am currently studying here
                </label>
              </div>
              <div>
                <label className="edu-label">
                  From <span className="edu-required">*</span>
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthStart"
                    className={`edu-select${
                      errors.monthStart ||
                      errors.dateRange ||
                      (touched.monthStart && !form.monthStart)
                        ? " error"
                        : form.monthStart
                        ? " valid"
                        : ""
                    }`}
                    value={form.monthStart}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    name="yearStart"
                    className={`edu-select${
                      errors.yearStart ||
                      errors.dateRange ||
                      (touched.yearStart && !form.yearStart)
                        ? " error"
                        : form.yearStart
                        ? " valid"
                        : ""
                    }`}
                    value={form.yearStart}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edu-error">
                  {(errors.monthStart ||
                    (touched.monthStart && !form.monthStart)) &&
                    errors.monthStart}
                  {(errors.yearStart ||
                    (touched.yearStart && !form.yearStart)) &&
                    errors.yearStart}
                </div>
              </div>
              <div>
                <label className="edu-label">
                  To
                  {!form.isStudying && <span className="edu-required"> *</span>}
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthEnd"
                    className={`edu-select${
                      !form.isStudying &&
                      (errors.monthEnd ||
                        errors.dateRange ||
                        (touched.monthEnd && !form.monthEnd))
                        ? " error"
                        : form.monthEnd
                        ? " valid"
                        : ""
                    }`}
                    value={form.monthEnd}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={!form.isStudying}
                    disabled={form.isStudying}
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    name="yearEnd"
                    className={`edu-select${
                      !form.isStudying &&
                      (errors.yearEnd ||
                        errors.dateRange ||
                        (touched.yearEnd && !form.yearEnd))
                        ? " error"
                        : form.yearEnd
                        ? " valid"
                        : ""
                    }`}
                    value={form.yearEnd}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={!form.isStudying}
                    disabled={form.isStudying}
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edu-error">
                  {!form.isStudying &&
                    (errors.monthEnd || (touched.monthEnd && !form.monthEnd)) &&
                    errors.monthEnd}
                  {!form.isStudying &&
                    (errors.yearEnd || (touched.yearEnd && !form.yearEnd)) &&
                    errors.yearEnd}
                  {errors.dateRange && errors.dateRange}
                </div>
              </div>
              <div style={{ gridColumn: "1/3" }}>
                <label className="edu-label">
                  Additional details (Optional)
                </label>
                <input
                  name="detail"
                  className="edu-input"
                  placeholder="Additional details"
                  value={form.detail}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="edu-modal-actions">
              <button
                type="button"
                className="edu-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="edu-btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EducationModal;
