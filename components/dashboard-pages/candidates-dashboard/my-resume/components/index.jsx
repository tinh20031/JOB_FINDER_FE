"use client";

import Awards from "./Awards";
import Education from "./Education";
import Experiences from "./Experiences";
import SkillsMultiple from "./SkillsMultiple";
import useResumeData from "@/services/useResumeData";
import ProfileCard from "./ProfileCard";
import AboutMe from "./AboutMe";
import ForeignLanguague from "./ForeignLanguague";
import HighlightProject from "./HighlightProject";
import Certificate from "./Certificate";
import Award from "./Award";
import EditProfileModal from "./EditProfileModal";
import { updateCandidateProfile } from "@/services/useResumeData";
import { useState } from "react";

const index = () => {
  const {
    aboutme,
    profile,
    education,
    experiences,
    awards,
    skills,
    foreignlanguage,
    project,
    certificate,
    award,
    loading,
  } = useResumeData();
  const [editOpen, setEditOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);

  if (loading) return <div>Loading...</div>;
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleEditProfile = () => setEditOpen(true);
  const handleEditAboutMe = () => setEditOpen(true);
  const handleCloseEdit = () => setEditOpen(false);
  const handleSaveEdit = async (form) => {
    console.log("handleSaveEdit called:", form);
    setSaving(true);
    try {
      await updateCandidateProfile(form);
      setEditOpen(false);
      setReload((r) => r + 1); // trigger reload
      window.location.reload(); // hoặc refetch lại dữ liệu nếu muốn mượt hơn
    } catch (e) {
      alert("Cập nhật thất bại!");
    }
    setSaving(false);
  };

  return (
    <div className="default-form">
      <div className="row">
        <div className="form-group col-lg-12 col-md-12">
          <ProfileCard profile={profile} onEdit={handleEditProfile} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <AboutMe aboutme={aboutme} onEdit={handleEditAboutMe} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Education education={education} />
          <Experiences experiences={experiences} />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <Awards awards={awards} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <label>Skills</label>
          <SkillsMultiple skills={skills} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <ForeignLanguague foreignlanguage={foreignlanguage} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <HighlightProject project={project} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Certificate certificate={certificate} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Award award={award} />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <button type="submit" className="theme-btn btn-style-one">
            Save
          </button>
        </div>
        {/* <!-- Input --> */}
      </div>
      {/* End .row */}
      <EditProfileModal
        open={editOpen}
        onClose={handleCloseEdit}
        onSubmit={handleSaveEdit}
        profile={profile}
      />
    </div>
  );
};

export default index;
