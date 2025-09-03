import React, { useState, useEffect } from "react";
import HighlightProjectModal from "./HighlighProjectModal";
import {
  updateHighlighProject,
  createHighlighProject,
  deleteHighlighProject,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const HighlightProject = ({
  project = [],
  refetch,
  openExternal,
  setOpenExternal,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedProject, setselectedProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeletedProject, setLastDeletedProject] = useState(null);

  // Sync with external open prop
  useEffect(() => {
    if (openExternal) setOpen(true);
  }, [openExternal]);

  const handleEdit = (proj) => {
    setselectedProject(proj);
    setOpen(true);
  };
  const handleAdd = () => {
    setselectedProject(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (setOpenExternal) setOpenExternal(false);
  };
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
      if (setOpenExternal) setOpenExternal(false);
      if (typeof refetch === "function") await refetch();
      toast.success("Project updated successfully!");
    } catch (e) {
      toast.error("Update failed!");
    }
  };

  const handleUndo = async (proj) => {
    try {
      const { highlightProjectId, highlighProjectId, ...rest } = proj;
      await createHighlighProject({ ...rest, highlightProjectId: 0 });
      if (typeof refetch === "function") await refetch();
      toast.success("Restored successfully");
      setLastDeletedProject(null);
    } catch {
      toast.error("Undo failed!");
    }
  };

  const handleDelete = async (id) => {
    const proj = project.find(
      (p) => (p.highlightProjectId || p.highlighProjectId) === id
    );
    if (!proj) return;

    setDeletingId(id);
    try {
      await deleteHighlighProject(id);
      setLastDeletedProject(proj);
      if (typeof refetch === "function") {
        await refetch();
      }
      toast.info(
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>
            You deleted a Project.
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
            }}
            onClick={async (e) => {
              e.preventDefault();
              await handleUndo(proj);
            }}
          >
            Undo
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
      <style>{`
        .text p { margin-bottom: 2px !important; }
        .text ul, .text ol { margin-bottom: 2px !important; }
      `}</style>
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
          <div style={{ fontWeight: 650, fontSize: 20, marginBottom: 4 }}>
            <strong>Project Name:</strong> {proj.projectName}
          </div>
          <div style={{ color: "#888", marginBottom: 8, fontSize: 15 }}>
           {formatMonthYear(proj.yearStart)} -{" "}
            {proj.isWorking ? "NOW" : formatMonthYear(proj.yearEnd)}
          </div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{
              __html: `<strong>Description:</strong> ${proj.projectDescription}`,
            }}
          ></div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{
              __html: `<strong>Technologies Uses:</strong> ${proj.technologies}`,
            }}
          ></div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{
              __html: `<strong>Key Responsibilities:</strong> ${proj.responsibilities}`,
            }}
          ></div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{
              __html: `<strong>Team Size:</strong> ${proj.teamSize}`,
            }}
          ></div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{
              __html: `<strong>Achievements/Results:</strong> ${proj.achievements}`,
            }}
          ></div>
          {proj.projectLink && (
            <div style={{ marginBottom: 0 }}>
              <strong>Project URL: </strong>
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
              onClick={() =>
                handleDelete(proj.highlightProjectId || proj.highlighProjectId)
              }
              disabled={
                deletingId ===
                (proj.highlightProjectId || proj.highlighProjectId)
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 20,
                padding: 4,
              }}
              title="Delete"
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
