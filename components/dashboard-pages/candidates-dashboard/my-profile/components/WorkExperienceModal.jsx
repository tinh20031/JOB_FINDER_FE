import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const years = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const WorkExperienceModal = ({ open, onClose, onSubmit, workExperience }) => {
  const [form, setForm] = useState({
    workExperienceId: workExperience?.workExperienceId || 0,
    candidateProfileId: workExperience?.candidateProfileId || 0,
    jobTitle: workExperience?.jobTitle || "",
    companyName: workExperience?.companyName || "",
    isWorking: workExperience?.isWorking || false,
    monthStart: workExperience?.monthStart
      ? workExperience.monthStart.slice(5, 7)
      : "",
    yearStart: workExperience?.yearStart
      ? workExperience.yearStart.slice(0, 4)
      : "",
    monthEnd: workExperience?.monthEnd
      ? workExperience.monthEnd.slice(5, 7)
      : "",
    yearEnd: workExperience?.yearEnd ? workExperience.yearEnd.slice(0, 4) : "",
    workDescription: workExperience?.workDescription || "",
    responsibilities: workExperience?.responsibilities || "",
    achievements: workExperience?.achievements || "",
    technologies: workExperience?.technologies || "",
    projectName: workExperience?.projectName || "",
    proJects: workExperience?.proJects || "",
    createdAt: workExperience?.createdAt || new Date().toISOString(),
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
      workExperienceId: workExperience?.workExperienceId || 0,
      candidateProfileId: workExperience?.candidateProfileId || 0,
      jobTitle: workExperience?.jobTitle || "",
      companyName: workExperience?.companyName || "",
      isWorking: workExperience?.isWorking || false,
      monthStart: workExperience?.monthStart
        ? workExperience.monthStart.slice(5, 7)
        : "",
      yearStart: workExperience?.yearStart
        ? workExperience.yearStart.slice(0, 4)
        : "",
      monthEnd: workExperience?.monthEnd
        ? workExperience.monthEnd.slice(5, 7)
        : "",
      yearEnd: workExperience?.yearEnd
        ? workExperience.yearEnd.slice(0, 4)
        : "",
      workDescription: workExperience?.workDescription || "",
      responsibilities: workExperience?.responsibilities || "",
      achievements: workExperience?.achievements || "",
      technologies: workExperience?.technologies || "",
      projectName: workExperience?.projectName || "",
      proJects: workExperience?.proJects || "",
      createdAt: workExperience?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors({});
    setTouched({});
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [workExperience, open]);

  if (!open && !show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isWorking") {
      setForm((prev) => ({
        ...prev,
        isWorking: checked,
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

  const handleQuillChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    let endBeforeStart = false;
    if (!form.jobTitle.trim()) newErrors.jobTitle = "Job Title is required.";
    if (!form.companyName.trim())
      newErrors.companyName = "Company Name is required.";
    if (!form.workDescription.trim())
      newErrors.workDescription = "Work Description is required.";
    if (!form.responsibilities.trim())
      newErrors.responsibilities = "Responsibilities is required.";
    if (!form.achievements.trim())
      newErrors.achievements = "Achievements is required.";
    if (!form.monthStart) newErrors.monthStart = "Month is required.";
    if (!form.yearStart) newErrors.yearStart = "Year is required.";
    if (!form.isWorking) {
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
      jobTitle: true,
      companyName: true,
      responsibilities: true,
      achievements: true,
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
        monthEnd: form.isWorking ? null : toISO(form.yearEnd, form.monthEnd),
        yearEnd: form.isWorking ? null : toISO(form.yearEnd, form.monthEnd),
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
        .work-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
          opacity: ${show ? 1 : 0};
          pointer-events: ${show ? "auto" : "none"};
        }
        .work-modal-content {
          background: #fff; border-radius: 12px; min-width: 320px;
          width: 95vw; max-width: 700px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 32px 0 32px; position: relative; overflow-y: auto;
          padding-bottom: 30px;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .work-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
        .work-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .work-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; }
        .form-group { margin-bottom: 24px; }
        @media (max-width: 700px) { .work-modal-grid { grid-template-columns: 1fr; gap: 18px; } }
        .work-label { font-size: 15px; font-weight: 600; color: #222; margin-bottom: 6px; display: flex; align-items: center; }
        .work-required { color: #e60023; margin-left: 2px; }
        .work-input, .work-select {
          width: 100%; border-radius: 8px; border: 1.5px solid #ddd; padding: 12px 14px; font-size: 16px;
          margin-bottom: 0; background: #fff; transition: border 0.2s;
        }
        .work-input:focus, .work-select:focus { border: 1.5px solid #1967d2; outline: none; }
        .work-input.error, .work-select.error { border: 2px solid #e60023 !important; }
        .work-input.valid, .work-select.valid { border: 2px solid #28a745 !important; }
        .work-error { color: #e60023; font-size: 13px; margin-top: 2px; min-height: 18px; }
        .work-checkbox-row { display: flex; align-items: center; gap: 8px; margin: 16px 0 8px 0; }
        .work-checkbox {
          width: 18px; height: 18px; accent-color: #1967d2; margin: 0;
        }
        .work-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          background: #fff; border-top: 1px solid #eee; padding: 18px 0 0 0; margin-top: 24px;
        }
        .work-btn-cancel {
          background: #fff; border: 1.5px solid #e60023; color: #e60023;
          padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer;
        }
        .work-btn-save {
          background: #e60023; color: #fff; border: none;
          padding: 12px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer;
        }
        .quill { border-radius: 8px; }
        .ql-toolbar.ql-snow { border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1.5px solid #ddd; border-bottom: none}
        .ql-container.ql-snow { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border: 1.5px solid #ddd; }
        .ql-editor { min-height: 120px; }
        .ql-editor p {
          margin: 0;
          line-height: 1.5;
        }
        .char-counter { font-size: 12px; color: #888; text-align: right; margin-top: 4px; }
        .field-tip { background: #f0f8ff; border-left: 3px solid #1967d2; padding: 8px 12px; margin-bottom: 8px; font-size: 14px; color: #444; }
        .insert-template-btn {
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 4px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .insert-template-btn:hover {
          background: #e0e0e0;
        }
        .quill-wrapper.error .ql-toolbar.ql-snow,
        .quill-wrapper.error .ql-container.ql-snow {
          border: 2px solid #e60023 !important;
        }
        .quill-wrapper.valid .ql-toolbar.ql-snow,
        .quill-wrapper.valid .ql-container.ql-snow {
          border: 2px solid #28a745 !important;
        }
      `}</style>
      <div className="work-modal-overlay">
        <div className="work-modal-content">
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
          <div className="work-modal-title">Work Experience</div>
          <form
            className="work-modal-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="form-group">
              <label className="work-label">
                Job Title <span className="work-required">*</span>
              </label>
              <input
                name="jobTitle"
                className={`work-input${
                  errors.jobTitle || (touched.jobTitle && !form.jobTitle.trim())
                    ? " error"
                    : form.jobTitle.trim()
                    ? " valid"
                    : ""
                }`}
                placeholder="JobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <div className="work-error">
                {(errors.jobTitle ||
                  (touched.jobTitle && !form.jobTitle.trim())) &&
                  "Please enter your Job Title"}
              </div>
            </div>

            <div className="form-group">
              <label className="work-label">
                Company Name <span className="work-required">*</span>
              </label>
              <input
                name="companyName"
                className={`work-input${
                  errors.companyName ||
                  (touched.companyName && !form.companyName.trim())
                    ? " error"
                    : form.companyName.trim()
                    ? " valid"
                    : ""
                }`}
                placeholder="Company Name"
                value={form.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <div className="work-error">
                {(errors.companyName ||
                  (touched.companyName && !form.companyName.trim())) &&
                  "Please enter your company nam"}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', margin: '0', flexShrink: '0' }}
                name="isWorking"
                checked={form.isWorking}
                onChange={handleChange}
                id="isWorking"
              />
              <label htmlFor="isWorking" style={{ margin: '0', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                I am currently working here
              </label>
            </div>
            <div className="work-modal-grid">
              <div>
                <label className="work-label">
                  From <span className="work-required">*</span>
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthStart"
                    className={`work-select${
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
                    className={`work-select${
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
                <div className="work-error">
                  {(errors.monthStart ||
                    (touched.monthStart && !form.monthStart)) &&
                    errors.monthStart}
                  {(errors.yearStart ||
                    (touched.yearStart && !form.yearStart)) &&
                    errors.yearStart}
                </div>
              </div>
              <div>
                <label className="work-label">
                  To
                  {!form.isWorking && <span className="work-required"> *</span>}
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthEnd"
                    className={`work-select${
                      !form.isWorking &&
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
                    required={!form.isWorking}
                    disabled={form.isWorking}
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
                    className={`work-select${
                      !form.isWorking &&
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
                    required={!form.isWorking}
                    disabled={form.isWorking}
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="work-error">
                  {!form.isWorking &&
                    (errors.monthEnd || (touched.monthEnd && !form.monthEnd)) &&
                    errors.monthEnd}
                  {!form.isWorking &&
                    (errors.yearEnd || (touched.yearEnd && !form.yearEnd)) &&
                    errors.yearEnd}
                  {errors.dateRange && errors.dateRange}
                </div>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="work-label">
                Description <span className="work-required">*</span>
              </label>
              <div style={{ marginBottom: 12, fontWeight: 600 }}>
                <span role="img" aria-label="tips">
                  📝
                </span>{" "}
                <span style={{ color: "#ff9800" }}>Tips:</span>{" "}
                <span style={{ color: "#000000" }}>
                  Brief the company's industry, then detail your
                  responsibilities and achievements. For projects, write on the
                  "Project" field below.
                </span>
              </div>
              <div
                className={`quill-wrapper${
                  errors.workDescription ||
                  (touched.workDescription && !form.workDescription.trim())
                    ? " error"
                    : form.workDescription.trim()
                    ? " valid"
                    : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={form.workDescription}
                  onChange={(value) =>
                    handleQuillChange("workDescription", value)
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, workDescription: true }))
                  }
                  modules={quillModules}
                />
              </div>
              <div className="work-error">
                {(errors.workDescription ||
                  (touched.workDescription && !form.workDescription.trim())) &&
                  "Please enter your work description"}
              </div>
              <div className="char-counter">
                {form.workDescription.length}/2500
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="work-label">
                Key Responsibilities <span className="work-required">*</span>
              </label>
              <div style={{ marginBottom: 12, fontWeight: 600 }}></div>
              <div
                className={`quill-wrapper${
                  errors.responsibilities ||
                  (touched.responsibilities && !form.responsibilities.trim())
                    ? " error"
                    : form.responsibilities.trim()
                    ? " valid"
                    : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={form.responsibilities}
                  onChange={(value) =>
                    handleQuillChange("responsibilities", value)
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, responsibilities: true }))
                  }
                  modules={quillModules}
                />
              </div>
              <div className="work-error">
                {(errors.responsibilities ||
                  (touched.responsibilities &&
                    !form.responsibilities.trim())) &&
                  "Please enter your key responsibilities"}
              </div>
              <div className="char-counter">
                {form.responsibilities.length}/2500
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="work-label">
                Key Achievements <span className="work-required">*</span>
              </label>
              <div style={{ marginBottom: 12, fontWeight: 600 }}></div>
              <div
                className={`quill-wrapper${
                  errors.achievements ||
                  (touched.achievements && !form.achievements.trim())
                    ? " error"
                    : form.achievements.trim()
                    ? " valid"
                    : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={form.achievements}
                  onChange={(value) => handleQuillChange("achievements", value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, achievements: true }))
                  }
                  modules={quillModules}
                />
              </div>
              <div className="work-error">
                {(errors.achievements ||
                  (touched.achievements && !form.achievements.trim())) &&
                  "Please enter your key achievements"}
              </div>
              <div className="char-counter">
                {form.achievements.length}/2500
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="work-label">Technologies Used (Optional)</label>
              <div style={{ marginBottom: 12, fontWeight: 600 }}></div>
              <ReactQuill
                theme="snow"
                value={form.technologies}
                onChange={(value) => handleQuillChange("technologies", value)}
                modules={quillModules}
              />
              <div className="char-counter">
                {form.technologies.length}/2500
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="work-label">Project Name (Optional)</label>
              <div style={{ marginBottom: 12, fontWeight: 600 }}></div>
              <ReactQuill
                theme="snow"
                value={form.projectName}
                onChange={(value) => handleQuillChange("projectName", value)}
                modules={quillModules}
              />
              <div className="char-counter">{form.projectName.length}/2500</div>
            </div>

            <div className="work-modal-actions">
              <button
                type="button"
                className="work-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="work-btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default WorkExperienceModal;
