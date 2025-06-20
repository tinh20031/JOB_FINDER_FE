import React, { useState } from "react";
import HighlightProjectModal from "./HighlighProjectModal";
import {
  updateHighlighProject,
  createHighlighProject,
} from "@/services/useResumeData";

const HighlightProject = ({ project = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectedProject, setselectedProject] = useState(null);
  const [reload, setReload] = useState(0);

  const handleEdit = (proj) => {
    setselectedProject(proj);
    setOpen(true);
  };
  const handleAdd = () => {
    setselectedProject(null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = async (projectData) => {
    try {
      if (
        projectData.highlightProjectId &&
        projectData.highlightProjectId > 0
      ) {
        await updateHighlighProject(projectData);
      } else {
        await createHighlighProject(projectData);
      }
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

  const isArray = Array.isArray(project);
  const list = isArray ? project : [];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 24 }}>Highlight Project</span>
        <button
          onClick={handleAdd}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#e60023",
            fontSize: 24,
          }}
          title="Add"
        >
          <span className="icon flaticon-plus"></span>
        </button>
      </div>
      <hr style={{ margin: "8px 0 16px 0" }} />
      {list.length === 0 && (
        <div style={{ color: "#888", fontStyle: "italic" }}>
          No Highlight Project info.
        </div>
      )}
      {list.map((proj, idx) => (
        <div
          key={proj.highlighProjectId || proj.highlightProjectId || idx}
          style={{
            padding: "0 0 24px 0",
            borderBottom: idx !== list.length - 1 ? "1px solid #eee" : "none",
            marginBottom: idx !== list.length - 1 ? 24 : 0,
            position: "relative",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {proj.projectName}
          </div>
          <div style={{ color: "#888", marginBottom: 8, fontSize: 15 }}>
            {formatMonthYear(proj.yearStart)} -{" "}
            {proj.isWorking ? "NOW" : formatMonthYear(proj.yearEnd)}
          </div>
          <div style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}>
            {proj.projectDescription}
          </div>
          {proj.projectLink && (
            <div style={{ marginBottom: 0 }}>
              <a
                href={proj.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 16,
                }}
              >
                View project{" "}
                <span
                  className="la la-external-link-alt"
                  style={{ fontSize: 16 }}
                ></span>
              </a>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <button
              onClick={() => handleEdit(proj)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e60023",
                fontSize: 20,
                padding: 4,
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
                padding: 4,
              }}
              title="Delete"
              // TODO: Thêm logic xóa nếu cần
            >
              <span className="la la-trash"></span>
            </button>
          </div>
        </div>
      ))}
      <HighlightProjectModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        highlightProject={selectedProject}
      />
    </div>
  );
};

export default HighlightProject;
