import React, { useState, useEffect } from "react";
import WorkExperienceModal from "./WorkExperienceModal";
import {
  updateWorkExperience,
  createWorkExperience,
  deleteWorkExperience,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const Experiences = ({
  workExperience = [],
  refetch,
  openExternal,
  setOpenExternal,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeletedWorkExperience, setLastDeletedWorkExperience] =
    useState(null);

  // Sync with external open prop
  useEffect(() => {
    if (openExternal) setOpen(true);
  }, [openExternal]);

  const handleEdit = (work) => {
    setSelectedWork(work);
    setOpen(true);
  };
  const handleAdd = () => {
    setSelectedWork(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (setOpenExternal) setOpenExternal(false);
  };
  const handleSave = async (workData) => {
    try {
      if (!workData.workExperienceId || workData.workExperienceId === 0) {
        await createWorkExperience(workData);
      } else {
        await updateWorkExperience(workData);
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

  const handleUndo = async (work) => {
    try {
      // Loại bỏ các trường không hợp lệ khi tạo mới
      const { workExperienceId, createdAt, updatedAt, ...rest } = work;
      await createWorkExperience(rest);
      if (typeof refetch === "function") await refetch();
      toast.success("Restored successfully");
      setLastDeletedWorkExperience(null);
    } catch {
      toast.error("Undo failed!");
    }
  };

  const handleDelete = async (id) => {
    const work = workExperience.find((e) => e.workExperienceId === id);
    // if (!window.confirm("Are you sure you want to delete this education?"))
    // return;
    setDeletingId(id);
    try {
      await deleteWorkExperience(id);
      setLastDeletedWorkExperience(work); // Lưu lại education vừa xóa
      if (typeof refetch === "function") {
        await refetch();
      }
      toast.info(
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>
            You deleted an Work Experience.
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
              await handleUndo(work);
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
      <style>{`
        .text p { margin-bottom: 2px !important; }
        .text ul, .text ol { margin-bottom: 2px !important; }
      `}</style>
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

      {workExperience.length === 0 && (
        <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 18 }}>
          No work experiences info.
        </div>
      )}
      {workExperience.map((work, idx) => {
        return (
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
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                {work.companyName}
              </div>
              <div style={{ color: "#888", marginBottom: 2 }}>
                {formatMonthYear(work.yearStart)} -{" "}
                {work.isWorking ? "NOW" : formatMonthYear(work.yearEnd)}
              </div>
              {work.workDescription && (
                <div
                  className="text"
                  style={{ marginTop: 6 }}
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Description:</strong> ${work.workDescription}`,
                  }}
                ></div>
              )}
              {work.responsibilities && (
                <div
                  className="text"
                  style={{ marginTop: 6 }}
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Responsibilities:</strong> ${work.responsibilities}`,
                  }}
                ></div>
              )}
              {work.achievements && (
                <div
                  className="text"
                  style={{ marginTop: 6 }}
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Achievements:</strong> ${work.achievements}`,
                  }}
                ></div>
              )}
              {work.technologies && (
                <div
                  className="text"
                  style={{ marginTop: 6 }}
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Technologies Used:</strong> ${work.technologies}`,
                  }}
                ></div>
              )}
              {work.projectName && (
                <div
                  className="text"
                  style={{ marginTop: 6 }}
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Project Name:</strong> ${work.projectName}`,
                  }}
                ></div>
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
                onClick={() => handleDelete(work.workExperienceId)}
                disabled={deletingId === work.workExperienceId}
                style={{
                  background: "none",
                  border: "none",
                  cursor:
                    deletingId === work.workExperienceId
                      ? "not-allowed"
                      : "pointer",
                  color: deletingId === work.workExperienceId ? "#ccc" : "#888",
                  fontSize: 20,
                  opacity: deletingId === work.workExperienceId ? 0.6 : 1,
                }}
                title="Delete"
              >
                <span className="la la-trash"></span>
              </button>
            </div>
          </div>
        );
      })}
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
