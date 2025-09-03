import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const months = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const years = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString()
);

const projectTemplate =
  "<p><strong>Description:</strong> Write a short description of your project</p><p><strong>Role:</strong> Your role in this project</p><p><strong>Responsibilities:</strong></p><ul><li>First responsibility</li><li>Second responsibility</li></ul><p><strong>Tech stack:</strong> List technologies used</p><p><strong>Team size:</strong> x members</p>";

const HighlightProjectModal = ({
  open,
  onClose,
  onSubmit,
  highlightProject,
}) => {
  const [form, setForm] = useState({
    highlightProjectId: highlightProject?.highlightProjectId || 0,
    candidateProfileId: highlightProject?.candidateProfileId || 0,
    projectName: highlightProject?.projectName || "",
    isWorking: highlightProject?.isWorking || false,
    monthStart: highlightProject?.monthStart
      ? highlightProject.monthStart.slice(5, 7)
      : "",
    yearStart: highlightProject?.yearStart
      ? highlightProject.yearStart.slice(0, 4)
      : "",
    monthEnd: highlightProject?.monthEnd
      ? highlightProject.monthEnd.slice(5, 7)
      : "",
    yearEnd: highlightProject?.yearEnd
      ? highlightProject.yearEnd.slice(0, 4)
      : "",
    projectDescription: highlightProject?.projectDescription || "",
    technologies: highlightProject?.technologies || "",
    responsibilities: highlightProject?.responsibilities || "",
    teamSize: highlightProject?.teamSize || "",
    achievements: highlightProject?.achievements || "",
    projectLink: highlightProject?.projectLink || "",
    createdAt: highlightProject?.createdAt || new Date().toISOString(),
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
      highlightProjectId: highlightProject?.highlightProjectId || 0,
      candidateProfileId: highlightProject?.candidateProfileId || 0,
      projectName: highlightProject?.projectName || "",
      isWorking: highlightProject?.isWorking || false,
      monthStart: highlightProject?.monthStart
        ? highlightProject.monthStart.slice(5, 7)
        : "",
      yearStart: highlightProject?.yearStart
        ? highlightProject.yearStart.slice(0, 4)
        : "",
      monthEnd: highlightProject?.monthEnd
        ? highlightProject.monthEnd.slice(5, 7)
        : "",
      yearEnd: highlightProject?.yearEnd
        ? highlightProject.yearEnd.slice(0, 4)
        : "",
      projectDescription: highlightProject?.projectDescription || "",
      technologies: highlightProject?.technologies || "",
      responsibilities: highlightProject?.responsibilities || "",
      teamSize: highlightProject?.teamSize || "",
      achievements: highlightProject?.achievements || "",
      projectLink: highlightProject?.projectLink || "",
      createdAt: highlightProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setErrors({});
    setTouched({});
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [highlightProject, open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

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

  const handleInsertTemplate = () => {
    const currentContent = form.projectDescription;
    const isEditorEmpty =
      !currentContent ||
      currentContent.trim() === "" ||
      currentContent === "<p><br></p>";

    const newContent = isEditorEmpty
      ? projectTemplate
      : `${currentContent}<p><br></p>${projectTemplate}`;

    handleQuillChange("projectDescription", newContent);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.projectName.trim())
      newErrors.projectName = "Project Name is required.";
    if (!form.projectDescription.trim())
      newErrors.projectDescription = "Project Description is required.";
    if (!form.technologies.trim())
      newErrors.technologies = "Technologies is required.";
    if (!form.responsibilities.trim())
      newErrors.responsibilities = "Responsibilities is required.";
    if (!form.teamSize.trim()) newErrors.teamSize = "Team Size is required.";
    // achievements is optional - no validation required
    if (!form.monthStart) newErrors.monthStart = "Month is required.";
    if (!form.yearStart) newErrors.yearStart = "Year is required.";
    if (!form.isWorking) {
      if (!form.monthEnd) newErrors.monthEnd = "Month is required.";
      if (!form.yearEnd) newErrors.yearEnd = "Year is required.";
      if (form.yearStart && form.monthStart && form.yearEnd && form.monthEnd) {
        const start = new Date(`${form.yearStart}-${form.monthStart}-01`);
        const end = new Date(`${form.yearEnd}-${form.monthEnd}-01`);
        if (end <= start) {
          newErrors.dateRange = "End date must be after start date.";
        }
      }
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      projectName: true,
      projectDescription: true,
      technologies: true,
      responsibilities: true,
      teamSize: true,
      // achievements is optional - no need to force validation
      monthStart: true,
      yearStart: true,
      monthEnd: true,
      yearEnd: true,
    });
    if (Object.keys(validationErrors).length > 0) return;

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
        .pro-checkbox-row { display: flex; align-items: center; gap: 8px; margin: 0 0 24px 0; }
        .pro-checkbox { width: 18px; height: 18px; accent-color: #1967d2; }
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
        .insert-template-btn { background: #f0f0f0; border: 1px solid #ccc; border-radius: 6px; padding: 4px 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .insert-template-btn:hover { background: #e0e0e0; }
        .quill-wrapper.error .ql-toolbar.ql-snow,
        .quill-wrapper.error .ql-container.ql-snow {
          border: 2px solid #e60023 !important;
        }
        .quill-wrapper.valid .ql-toolbar.ql-snow,
        .quill-wrapper.valid .ql-container.ql-snow {
          border: 2px solid #28a745 !important;
        }
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
          <div className="pro-modal-title">Highlight Project</div>
          <div className="field-tip">
            💡 <b>Tips:</b> Share the project that relates to your skills and
            capabilities, and be sure to include project details, your role,
            technologies, and team size.
          </div>
          <form className="pro-modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="pro-label">
                Project Name <span className="pro-required">*</span>
              </label>
              <input
                name="projectName"
                className={`pro-input${
                  errors.projectName ||
                  (touched.projectName && !form.projectName.trim())
                    ? " error"
                    : form.projectName.trim()
                    ? " valid"
                    : ""
                }`}
                value={form.projectName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="pro-error">
                {(errors.projectName ||
                  (touched.projectName && !form.projectName.trim())) &&
                  "Please enter your project name"}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', margin: '0', flexShrink: '0' }}
                name="isWorking"
                checked={form.isWorking}
                onChange={handleChange}
                id="hp_isWorking"
              />
              <label htmlFor="hp_isWorking" style={{ margin: '0', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                I am working on this project
              </label>
            </div>

            <div className="pro-modal-grid">
              <div className="form-group">
                <label className="pro-label">
                  Start date <span className="pro-required">*</span>
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthStart"
                    className={`pro-select${
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
                    className={`pro-select${
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
                  {(errors.monthStart ||
                    (touched.monthStart && !form.monthStart)) &&
                    errors.monthStart}
                  {(errors.yearStart ||
                    (touched.yearStart && !form.yearStart)) &&
                    errors.yearStart}
                </div>
              </div>
              <div className="form-group">
                <label className="pro-label">
                  End date
                  {!form.isWorking && <span className="pro-required"> *</span>}
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <select
                    name="monthEnd"
                    className={`pro-select${
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
                    className={`pro-select${
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
                <div className="pro-error">
                  {!form.isWorking &&
                    (errors.monthEnd || (touched.monthEnd && !form.monthEnd)) &&
                    errors.monthEnd}
                  {!form.isWorking &&
                    (errors.yearEnd || (touched.yearEnd && !form.yearEnd)) &&
                    errors.yearEnd}
                </div>
              </div>
            </div>
            {errors.dateRange && (
              <div
                className="pro-error"
                style={{ gridColumn: "1 / -1", marginTop: "-20px" }}
              >
                {errors.dateRange}
              </div>
            )}

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label className="pro-label" style={{ marginBottom: 0 }}>
                  Description <span className="pro-required">*</span>
                </label>
                <button
                  type="button"
                  className="insert-template-btn"
                  onClick={handleInsertTemplate}
                >
                  Insert template
                </button>
              </div>
              <div
                className={`quill-wrapper${
                  errors.projectDescription ||
                  (touched.projectDescription &&
                    !form.projectDescription.trim())
                    ? " error"
                    : form.projectDescription.trim()
                    ? " valid"
                    : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={form.projectDescription}
                  onChange={(value) =>
                    handleQuillChange("projectDescription", value)
                  }
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      projectDescription: true,
                    }))
                  }
                  modules={quillModules}
                />
              </div>
              <div className="pro-error">
                {(errors.projectDescription ||
                  (touched.projectDescription &&
                    !form.projectDescription.trim())) &&
                  "Please enter your project description"}
              </div>
              <div className="char-counter">
                {form.projectDescription.length}/2500
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label className="pro-label" style={{ marginBottom: 0 }}>
                  Technologies Uses <span className="pro-required">*</span>
                </label>
              </div>
              <div
                className={`quill-wrapper${
                  errors.technologies ||
                  (touched.technologies && !form.technologies.trim())
                    ? " error"
                    : form.technologies.trim()
                    ? " valid"
                    : ""
                }`}
              >
                <ReactQuill
                  theme="snow"
                  value={form.technologies}
                  onChange={(value) => handleQuillChange("technologies", value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, technologies: true }))
                  }
                  modules={quillModules}
                />
              </div>
              <div className="pro-error">
                {(errors.technologies ||
                  (touched.technologies && !form.technologies.trim())) &&
                  "Please enter technologies used"}
              </div>
              <div className="char-counter">
                {form.technologies.length}/2500
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label className="pro-label" style={{ marginBottom: 0 }}>
                  Key Responsibilities <span className="pro-required">*</span>
                </label>
              </div>
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
              <div className="pro-error">
                {(errors.responsibilities ||
                  (touched.responsibilities &&
                    !form.responsibilities.trim())) &&
                  "Please enter key responsibilities"}
              </div>
              <div className="char-counter">
                {form.responsibilities.length}/2500
              </div>
            </div>

            <div className="form-group">
              <label className="pro-label">
                Team Size <span className="pro-required">*</span>
              </label>
              <input
                name="teamSize"
                className={`pro-input${
                  errors.teamSize || (touched.teamSize && !form.teamSize.trim())
                    ? " error"
                    : form.teamSize.trim()
                    ? " valid"
                    : ""
                }`}
                value={form.teamSize}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="pro-error">
                {(errors.teamSize ||
                  (touched.teamSize && !form.teamSize.trim())) &&
                  "Please enter your team size"}
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label className="pro-label" style={{ marginBottom: 0 }}>
                  Achievements/Results (Optional)
                </label>
              </div>
              <ReactQuill
                theme="snow"
                value={form.achievements}
                onChange={(value) => handleQuillChange("achievements", value)}
                modules={quillModules}
              />
              <div className="char-counter">
                {form.achievements.length}/2500
              </div>
            </div>

            <div className="form-group">
              <label className="pro-label">Project URL (Optional)</label>
              <input
                name="projectLink"
                type="url"
                className="pro-input"
                placeholder="https://example.com"
                value={form.projectLink}
                onChange={handleChange}
              />
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

export default HighlightProjectModal;
