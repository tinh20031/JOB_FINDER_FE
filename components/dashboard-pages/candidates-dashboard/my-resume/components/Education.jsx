import React, { useState, useEffect } from "react";
import EducationModal from "./EducationModal";
import {
  updateEducation,
  createEducation,
  deleteEducation,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const Education = ({
  education = [],
  refetch,
  openExternal,
  setOpenExternal,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeletedEducation, setLastDeletedEducation] = useState(null);

  // Sync with external open prop
  useEffect(() => {
    if (openExternal) setOpen(true);
  }, [openExternal]);

  const handleEdit = (edu) => {
    setSelectedEdu(edu);
    setOpen(true);
  };
  const handleAdd = () => {
    setSelectedEdu(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (setOpenExternal) setOpenExternal(false);
  };

  const handleSave = async (eduData) => {
    try {
      if (!eduData.educationId || eduData.educationId === 0) {
        await createEducation(eduData);
      } else {
        await updateEducation(eduData);
      }
      setOpen(false);
      if (setOpenExternal) setOpenExternal(false);
      if (typeof refetch === "function") {
        await refetch();
      }
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed!");
    }
  };

  const handleUndo = async (edu) => {
    try {
      // Loại bỏ các trường không hợp lệ khi tạo mới
      const { educationId, createdAt, updatedAt, ...rest } = edu;
      await createEducation(rest);
      if (typeof refetch === "function") await refetch();
      toast.success("Restored successfully");
      setLastDeletedEducation(null);
    } catch {
      toast.error("Undo failed!");
    }
  };

  const handleDelete = async (id) => {
    const edu = education.find((e) => (e.educationId ?? e.id) === id);
    // if (!window.confirm("Are you sure you want to delete this education?"))
    // return;
    setDeletingId(id);
    try {
      await deleteEducation(id);
      setLastDeletedEducation(edu); // Lưu lại education vừa xóa
      if (typeof refetch === "function") {
        await refetch();
      }
      toast.info(
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>
            You deleted an Education.
          </span>
          <button
            style={{
              color: "#fff",
              background: "#28a745",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 16,
              padding: "6px 18px",
              marginLeft: 8,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={async (e) => {
              e.preventDefault();
              await handleUndo(edu);
            }}
          >
            <span style={{ fontSize: 18, marginRight: 4 }}>⟲</span> Undo
          </button>
        </span>,
        { autoClose: 10000 }
      );
    } catch (e) {
      toast.error("Delete failed!");
    }
    setDeletingId(null);
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
        Education
      </div>
      {education.length === 0 && (
        <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 18 }}>
          No education info.
        </div>
      )}
      {education.map((edu, idx) => (
        <div
          key={edu.educationId}
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
              title="Edit"
            >
              <span className="la la-pencil"></span>
            </button>
            <button
              onClick={() => handleDelete(edu.educationId)}
              disabled={deletingId === edu.educationId}
              style={{
                background: "none",
                border: "none",
                cursor:
                  deletingId === edu.educationId ? "not-allowed" : "pointer",
                color: deletingId === edu.educationId ? "#ccc" : "#888",
                fontSize: 20,
                opacity: deletingId === edu.educationId ? 0.6 : 1,
              }}
              title="Delete"
            >
              <span className="la la-trash"></span>
            </button>
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
