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
  }, [education, open]);

  if (!open) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
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
  };

  return (
    <>
      <style>{`
        .edu-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .edu-modal-content {
          background: #fff; border-radius: 12px; min-width: 320px;
          width: 95vw; max-width: 900px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 24px 0 24px; position: relative; overflow-y: auto;
          padding-bottom: 20px;
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
          <div className="edu-modal-title">Education</div>
          <form className="edu-modal-form" onSubmit={handleSubmit}>
            <div className="edu-modal-grid">
              <div>
                <label>School *</label>
                <input
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Major *</label>
                <input
                  name="major"
                  value={form.major}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Degree *</label>
                <select
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select degree</option>
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
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
                    value={form.yearEnd}
                    onChange={handleChange}
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

export default EducationModal;
