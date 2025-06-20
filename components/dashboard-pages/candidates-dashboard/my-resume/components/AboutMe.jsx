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
    <div className="resume-outer">
      <div className="upper-title">
        <h4>About Me</h4>
        <button onClick={handleEdit}>
          <span className="la la-pencil" style={{ color: "red" }}></span>
        </button>
      </div>
      {!aboutme?.aboutMeDescription && <div>No about me info.</div>}
      {aboutme?.aboutMeDescription && (
        <div className="resume-block">
          <div className="inner">
            <div className="title-box">
              <div className="edit-box">
                <div className="text">{aboutme.aboutMeDescription}</div>
                <div className="edit-btns"></div>
              </div>
            </div>
          </div>
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
