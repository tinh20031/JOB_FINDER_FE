import React, { useState } from "react";
import AboutMeModal from "./AboutMeModal";
import {
  updateAboutMe,
  createAboutMe,
  deleteAboutMe,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const AboutMe = ({ aboutme, refetch, openExternal, setOpenExternal }) => {
  const [open, setOpen] = useState(false);

  // Sync with external open prop
  React.useEffect(() => {
    if (openExternal) setOpen(true);
  }, [openExternal]);

  const handleEdit = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    if (setOpenExternal) setOpenExternal(false);
  };

  const handleSave = async (value) => {
    // Loại bỏ thẻ HTML để kiểm tra rỗng thực sự
    const plainText = value.replace(/<[^>]+>/g, "").trim();
    try {
      if (!plainText) {
        // Nếu không có nội dung, gọi API xóa nếu có aboutMeId
        if (aboutme?.aboutMeId) {
          await deleteAboutMe(aboutme.aboutMeId);
          toast.success("About Me deleted");
        }
        setOpen(false);
        if (setOpenExternal) setOpenExternal(false);
        if (typeof refetch === "function") {
          await refetch();
        }
        return;
      }
      const aboutMeData = {
        aboutMeId: aboutme?.aboutMeId || 0,
        candidateProfileId: aboutme?.candidateProfileId || 0,
        aboutMeDescription: value,
        createdAt: aboutme?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!aboutme?.aboutMeId) {
        await createAboutMe(aboutMeData);
      } else {
        await updateAboutMe(aboutMeData);
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
        <div
          className="aboutme-richtext"
          style={{ color: "#222", fontSize: 18, lineHeight: 1.4 }}
          dangerouslySetInnerHTML={{ __html: aboutme.aboutMeDescription }}
        />
      )}
      <style>{`
        .aboutme-richtext p { margin-bottom: 2px !important; }
        .aboutme-richtext ul, .aboutme-richtext ol { margin-bottom: 2px !important; }
      `}</style>
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
