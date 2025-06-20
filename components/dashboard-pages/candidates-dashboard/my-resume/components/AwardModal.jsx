import React, { useState, useEffect } from "react";
import Award from "./Awards";

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
  }, [award, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <>
      <style>{`
        .cer-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .cer-modal-content {
          background: #fff; border-radius: 12px; min-width: 320px;
          width: 95vw; max-width: 900px; min-height: 40vh; max-height: 90vh;
          display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 24px 0 24px; position: relative; overflow-y: auto;
          padding-bottom: 20px;
        }
        .cer-modal-title { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
        .cer-modal-form { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
        .cer-modal-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .cer-modal-row > div { flex: 1; }
        .cer-modal-checkbox { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .cer-modal-actions {
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
      <div className="cer-modal-overlay">
        <div className="cer-modal-content">
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
          <div className="cer-modal-title">Award</div>
          <form className="cer-modal-form" onSubmit={handleSubmit}>
            <div className="cer-modal-row">
              <div>
                <label>Award Name *</label>
                <input
                  name="awardName"
                  value={form.awardName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="cer-modal-row">
              <div>
                <label>Award Organization *</label>
                <input
                  name="awardOrganization"
                  value={form.awardOrganization}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="cer-modal-row">
              <div>
                <label>Issue date *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    name="month"
                    value={form.month}
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
                    name="year"
                    value={form.year}
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
            </div>

            <div className="cer-modal-row">
              <div style={{ flex: 1, flexDirection: "column" }}>
                <label>Award Description</label>
                <textarea
                  name="awardDescription"
                  value={form.awardDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="cer-modal-actions">
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

export default AwardModal;
