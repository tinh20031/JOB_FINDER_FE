import React, { useState } from "react";
import WorkExperienceModal from "./WorkExperienceModal";
import { updateWorkExperience } from "@/services/useResumeData";

const Experiences = ({ experiences = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [reload, setReload] = useState(0);

  const handleEdit = (work) => {
    setSelectedWork(work);
    setOpen(true);
  };
  const handleAdd = () => {
    setSelectedWork(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = async (workData) => {
    try {
      await updateWorkExperience(workData);
      setOpen(false);
      setReload((r) => r + 1);
      window.location.reload();
    } catch (e) {
      alert("Cập nhật thất bại!");
    }
  };

  // Helper to format date MM/YYYY
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        position: "relative",
        minHeight: 100,
      }}
    >
      {/* Nút add nổi bật góc phải */}
      <button
        onClick={handleAdd}
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          background: "none",
          border: "none",
          color: "#e60023",
          fontSize: 28,
          cursor: "pointer",
          padding: 0,
        }}
        title="Add"
      >
        <span className="icon flaticon-plus"></span>
      </button>
      <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 12 }}>
        Work Experience
      </div>
      {experiences.length === 0 && (
        <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 18 }}>
          No Work Experience info.
        </div>
      )}
      {experiences.map((work, idx) => (
        <div
          key={work.workExperienceId}
          style={{
            background: "#f8f9fa",
            borderRadius: 14,
            padding: 20,
            marginBottom: 18,
            boxShadow: "0 1px 4px #0001",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {work.jobTitle}
            </div>
            <div style={{ color: "#222", marginBottom: 2 }}>
              {work.companyName}
            </div>
            <div style={{ color: "#888", marginBottom: 2 }}>
              {formatMonthYear(work.yearStart)} -{" "}
              {work.isWorking ? "NOW" : formatMonthYear(work.yearEnd)}
            </div>
            <div className="text" style={{ marginTop: 6 }}>
              {work.workDescription}
            </div>
            {work.proJects && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontWeight: 700 }}>Project:</div>
                <div className="text">{work.proJects}</div>
              </div>
            )}
          </div>
          <div
            style={{
              marginLeft: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <button
              onClick={() => handleEdit(work)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e60023",
                fontSize: 20,
              }}
              title="Edit"
            >
              <span className="la la-pencil"></span>
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 20,
              }}
              title="Delete"
            >
              <span className="la la-trash"></span>
            </button>
          </div>
        </div>
      ))}
      <WorkExperienceModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        workExperience={selectedWork}
      />
    </div>
  );
};

export default Experiences;
