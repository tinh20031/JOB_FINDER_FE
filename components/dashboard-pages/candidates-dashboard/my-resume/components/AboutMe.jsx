import React, { useState } from "react";
import AboutMeModal from "./AboutMeModal";
import { updateAboutMe } from "@/services/useResumeData";

const AboutMe = ({ aboutme }) => {
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(0);

  const handleEdit = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSave = async (value) => {
    try {
      const aboutMeData = {
        aboutMeId: aboutme?.aboutMeId || 0,
        candidateProfileId: aboutme?.candidateProfileId || 0,
        aboutMeDescription: value,
        createdAt: aboutme?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await updateAboutMe(aboutMeData);
      setOpen(false);
      setReload((r) => r + 1);
      window.location.reload();
    } catch (e) {
      alert("Cập nhật thất bại!");
    }
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
      <button
        onClick={handleEdit}
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
        title="Edit"
      >
        <span className="la la-pencil"></span>
      </button>
      <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 12 }}>
        About Me
      </div>
      {!aboutme?.aboutMeDescription && (
        <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 18 }}>
          No about me info.
        </div>
      )}
      {aboutme?.aboutMeDescription && (
        <div style={{ color: "#222", fontSize: 18, lineHeight: 1.7 }}>
          {aboutme.aboutMeDescription}
        </div>
      )}
      <AboutMeModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        aboutMe={aboutme?.aboutMeDescription || ""}
      />
    </div>
  );
};

export default AboutMe;
