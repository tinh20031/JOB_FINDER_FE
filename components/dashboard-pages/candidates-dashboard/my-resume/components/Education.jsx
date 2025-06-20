import React, { useState } from "react";
import EducationModal from "./EducationModal";
import { updateEducation } from "@/services/useResumeData";

const Education = ({ education = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState(null);
  const [reload, setReload] = useState(0);

  const handleEdit = (edu) => {
    setSelectedEdu(edu);
    setOpen(true);
  };
  const handleAdd = () => {
    setSelectedEdu(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = async (eduData) => {
    try {
      await updateEducation(eduData);
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
        <h4>Education</h4>
        <button className="add-info-btn" onClick={handleAdd}>
          <span className="icon flaticon-plus"></span> Add Education
        </button>
      </div>
      {education.length === 0 && <div>No education info.</div>}
      {education.map((edu) => (
        <div className="resume-block" key={edu.educationId}>
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
                {edu.school}
              </div>
              <div style={{ color: "#222", marginBottom: 2 }}>
                {edu.degree} - {edu.major}
              </div>
              <div style={{ color: "#888", marginBottom: 2 }}>
                {formatMonthYear(edu.yearStart)} -{" "}
                {edu.isStudying ? "NOW" : formatMonthYear(edu.yearEnd)}
              </div>
              <div className="text" style={{ marginTop: 6 }}>
                {edu.detail}
              </div>
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
                onClick={() => handleEdit(edu)}
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
      <EducationModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        education={selectedEdu}
      />
    </div>
  );
};

export default Education;
