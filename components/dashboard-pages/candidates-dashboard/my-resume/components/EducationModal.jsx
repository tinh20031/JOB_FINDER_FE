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
          width: 95vw; max-width: 900px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 24px 0 24px; position: relative; overflow-y: auto;
          padding-bottom: 20px;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .edu-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
        .edu-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .edu-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 700px) { .edu-modal-grid { grid-template-columns: 1fr; } }
        .edu-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          background: #fff; border-top: 1px solid #eee; padding: 16px 0 0 0; margin-top: 0;
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
          >
            ×
          </button>
          <div className="edu-modal-title">Education</div>
          <form className="edu-modal-form" onSubmit={handleSubmit}>
            <div className="edu-modal-grid">
              <div>
                <label>
                  School <span style={{ color: "#e60023" }}>*</span>
                </label>
                <input
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    border:
                      errors.school || (touched.school && !form.school.trim())
                        ? "2px solid #e60023"
                        : form.school.trim()
                        ? "2px solid #28a745"
                        : "1px solid #ddd",
                    outline:
                      errors.school || (touched.school && !form.school.trim())
                        ? "1px solid #e60023"
                        : undefined,
                    background: "#fff",
                  }}
                />
                {(errors.school || (touched.school && !form.school.trim())) && (
                  <div style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}>
                    Please enter your school
                  </div>
                )}
              </div>
              <div>
                <label>
                  Major <span style={{ color: "#e60023" }}>*</span>
                </label>
                <input
                  name="major"
                  value={form.major}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    border:
                      errors.major || (touched.major && !form.major.trim())
                        ? "2px solid #e60023"
                        : form.major.trim()
                        ? "2px solid #28a745"
                        : "1px solid #ddd",
                    outline:
                      errors.major || (touched.major && !form.major.trim())
                        ? "1px solid #e60023"
                        : undefined,
                    background: "#fff",
                  }}
                />
                {(errors.major || (touched.major && !form.major.trim())) && (
                  <div style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}>
                    Please enter your major
                  </div>
                )}
              </div>
              <div>
                <label>
                  Degree <span style={{ color: "#e60023" }}>*</span>
                </label>
                <select
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    border:
                      errors.degree || (touched.degree && !form.degree.trim())
                        ? "2px solid #e60023"
                        : form.degree.trim()
                        ? "2px solid #28a745"
                        : "1px solid #ddd",
                    outline:
                      errors.degree || (touched.degree && !form.degree.trim())
                        ? "1px solid #e60023"
                        : undefined,
                    background: "#fff",
                  }}
                >
                  <option value="">Select degree</option>
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {(errors.degree || (touched.degree && !form.degree.trim())) && (
                  <div style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}>
                    Please select your degree
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  name="isStudying"
                  checked={form.isStudying}
                  onChange={handleChange}
                  id="isStudying"
                />
                <label htmlFor="isStudying" style={{ margin: 0 }}>
                  Currently studying here
                </label>
              </div>
              <div>
                <label>
                  From <span style={{ color: "#e60023" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <select
                      name="monthStart"
                      value={form.monthStart}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      style={{
                        border:
                          errors.monthStart ||
                          errors.dateRange ||
                          (touched.monthStart && !form.monthStart)
                            ? "2px solid #e60023"
                            : form.monthStart
                            ? "2px solid #28a745"
                            : "1px solid #ddd",
                        outline:
                          errors.monthStart ||
                          errors.dateRange ||
                          (touched.monthStart && !form.monthStart)
                            ? "1px solid #e60023"
                            : undefined,
                        background: "#fff",
                      }}
                    >
                      <option value="">Month</option>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {(errors.monthStart ||
                      (touched.monthStart && !form.monthStart)) && (
                      <div
                        style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                      >
                        {errors.monthStart}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <select
                      name="yearStart"
                      value={form.yearStart}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      style={{
                        border:
                          errors.yearStart ||
                          errors.dateRange ||
                          (touched.yearStart && !form.yearStart)
                            ? "2px solid #e60023"
                            : form.yearStart
                            ? "2px solid #28a745"
                            : "1px solid #ddd",
                        outline:
                          errors.yearStart ||
                          errors.dateRange ||
                          (touched.yearStart && !form.yearStart)
                            ? "1px solid #e60023"
                            : undefined,
                        background: "#fff",
                      }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {(errors.yearStart ||
                      (touched.yearStart && !form.yearStart)) && (
                      <div
                        style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                      >
                        {errors.yearStart}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label>
                  To
                  {!form.isStudying && (
                    <span style={{ color: "#e60023" }}> *</span>
                  )}
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <select
                      name="monthEnd"
                      value={form.monthEnd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required={!form.isStudying}
                      disabled={form.isStudying}
                      style={{
                        border:
                          !form.isStudying &&
                          (errors.monthEnd ||
                            errors.dateRange ||
                            (touched.monthEnd && !form.monthEnd))
                            ? "2px solid #e60023"
                            : form.monthEnd
                            ? "2px solid #28a745"
                            : "1px solid #ddd",
                        outline:
                          !form.isStudying &&
                          (errors.monthEnd ||
                            errors.dateRange ||
                            (touched.monthEnd && !form.monthEnd))
                            ? "1px solid #e60023"
                            : undefined,
                        background: form.isStudying ? "#f5f5f5" : "#fff",
                      }}
                    >
                      <option value="">Month</option>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {!form.isStudying &&
                      (errors.monthEnd ||
                        (touched.monthEnd && !form.monthEnd)) && (
                        <div
                          style={{
                            color: "#e60023",
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          {errors.monthEnd}
                        </div>
                      )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <select
                      name="yearEnd"
                      value={form.yearEnd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required={!form.isStudying}
                      disabled={form.isStudying}
                      style={{
                        border:
                          !form.isStudying &&
                          (errors.yearEnd ||
                            errors.dateRange ||
                            (touched.yearEnd && !form.yearEnd))
                            ? "2px solid #e60023"
                            : form.yearEnd
                            ? "2px solid #28a745"
                            : "1px solid #ddd",
                        outline:
                          !form.isStudying &&
                          (errors.yearEnd ||
                            errors.dateRange ||
                            (touched.yearEnd && !form.yearEnd))
                            ? "1px solid #e60023"
                            : undefined,
                        background: form.isStudying ? "#f5f5f5" : "#fff",
                      }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {!form.isStudying &&
                      (errors.yearEnd ||
                        (touched.yearEnd && !form.yearEnd)) && (
                        <div
                          style={{
                            color: "#e60023",
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          {errors.yearEnd}
                        </div>
                      )}
                  </div>
                </div>
                {errors.dateRange && (
                  <div style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}>
                    {errors.dateRange}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "1/3" }}>
                <label>Additional details</label>
                <input
                  name="detail"
                  value={form.detail}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="edu-modal-actions">
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "#fff",
                  border: "1px solid #e60023",
                  color: "#e60023",
                  padding: "10px 32px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: "#e60023",
                  color: "#fff",
                  border: "none",
                  padding: "10px 32px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
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
