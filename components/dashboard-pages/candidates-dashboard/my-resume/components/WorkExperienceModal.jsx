import React, { useState, useEffect } from "react";

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
    proJects: workExperience?.proJects || "",
    createdAt: workExperience?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

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
      proJects: workExperience?.proJects || "",
      createdAt: workExperience?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [workExperience, open]);

  if (!open) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
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
        .work-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .work-modal-content {
          background: #fff; border-radius: 12px; min-width: 320px;
          width: 95vw; max-width: 900px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 24px 0 24px; position: relative; overflow-y: auto;
          padding-bottom: 20px;
        }
        .work-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
        .work-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .work-modal-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .work-modal-row > div { flex: 1; }
        .work-modal-checkbox { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .work-modal-actions {
          display: flex; justify-content: flex-end; gap: 16px;
          background: #fff; border-top: 1px solid #eee; padding: 16px 0 0 0; margin-top: 20px;
        }
        label { font-weight: 600; margin-bottom: 6px; display: block; }
        input, select, textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #ddd;
          font-size: 1rem;
          margin-top: 2px;
        }
        textarea {
          min-height: 100px;
          resize: vertical;
        }
      `}</style>
      <div className="work-modal-overlay">
        <div className="work-modal-content">
          <button
            onClick={onClose}
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
          <div className="work-modal-title">Work Experience</div>
          <form className="work-modal-form" onSubmit={handleSubmit}>
            <div className="work-modal-row">
              <div>
                <label>Job Title *</label>
                <input
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Company Name *</label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="work-modal-row">
              <div>
                <label>From *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    name="monthStart"
                    value={form.monthStart}
                    onChange={handleChange}
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
                    value={form.yearStart}
                    onChange={handleChange}
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
              </div>
              <div>
                <label>To *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    name="monthEnd"
                    value={form.monthEnd}
                    onChange={handleChange}
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
                    value={form.yearEnd}
                    onChange={handleChange}
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
              </div>
            </div>

            <div className="work-modal-checkbox">
              <input
                type="checkbox"
                name="isWorking"
                checked={form.isWorking}
                onChange={handleChange}
                id="isWorking"
              />
              <label htmlFor="isWorking" style={{ margin: 0 }}>
                I am currently working here
              </label>
            </div>

            <div className="work-modal-row">
              <div style={{ flex: 1, flexDirection: "column" }}>
                <label>Description</label>
                <textarea
                  name="workDescription"
                  value={form.workDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="work-modal-row">
              <div style={{ flex: 1, flexDirection: "column" }}>
                <label>Project</label>
                <textarea
                  name="proJects"
                  value={form.proJects}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="work-modal-actions">
              <button
                type="button"
                onClick={onClose}
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

export default WorkExperienceModal;
