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
    <div className="resume-outer">
      <div className="upper-title">
        <h4>Work Experience</h4>
        <button className="add-info-btn" onClick={handleAdd}>
          <span className="icon flaticon-plus"></span> Add Work Experience
        </button>
      </div>
      {experiences.length === 0 && <div>No Work Experience info.</div>}
      {experiences.map((work) => (
        <div className="resume-block" key={work.workExperienceId}>
          <div
            className="inner"
            style={{
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
              className="edit-btns"
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
              >
                <span className="la la-trash"></span>
              </button>
            </div>
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
