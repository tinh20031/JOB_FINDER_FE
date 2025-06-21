"use client";

import Education from "./Education";
import Experiences from "./Experiences";
import Skills from "./Skills";
import useResumeData from "@/services/useResumeData";
import ProfileCard from "./ProfileCard";
import AboutMe from "./AboutMe";
import ForeignLanguague from "./ForeignLanguague";
import HighlightProject from "./HighlightProject";
import Certificate from "./Certificate";
import Awards from "./Awards";
import EditProfileModal from "./EditProfileModal";
import { updateCandidateProfile } from "@/services/useResumeData";
import { useState, useEffect } from "react";
import ForeignLanguageModal from "./ForeignLanguageModal";

const index = () => {
  const {
    aboutme,
    profile,
    education,
    experiences,
    skills,
    foreignlanguage,
    project,
    certificate,
    awards,
    loading,
    refetch,
  } = useResumeData();

  const [editOpen, setEditOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [openFL, setOpenFL] = useState(false);
  const [profileState, setProfileState] = useState(profile);

  useEffect(() => {
    setProfileState(profile);
  }, [profile]);

  if (loading) return <div>Loading...</div>;
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleEditProfile = () => setEditOpen(true);
  const handleEditAboutMe = () => setEditOpen(true);
  const handleCloseEdit = () => setEditOpen(false);
  const handleSaveEdit = async (form) => {
    setSaving(true);
    try {
      const updated = await updateCandidateProfile(form);
      setEditOpen(false);
      setProfileState((prev) => ({ ...prev, ...form, ...updated }));
      if (typeof refetch === "function") await refetch();
    } catch (e) {
      alert("Cập nhật thất bại!");
    }
    setSaving(false);
  };

  return (
    <div className="default-form">
      <div className="row">
        <div className="form-group col-lg-12 col-md-12">
          <ProfileCard profile={profileState} onEdit={handleEditProfile} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <AboutMe
            aboutme={aboutme}
            refetch={refetch}
            onEdit={handleEditAboutMe}
          />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Education education={education} refetch={refetch} />
          <Experiences workExperience={experiences} refetch={refetch} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Skills skills={skills} refetch={refetch} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <ForeignLanguague
            foreignlanguage={foreignlanguage}
            onEdit={() => setOpenFL(true)}
          />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <HighlightProject project={project} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Certificate certificate={certificate} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <Awards awards={awards} />
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
        profile={profileState}
      />
      <ForeignLanguageModal
        open={openFL}
        onClose={() => setOpenFL(false)}
        initialLanguages={foreignlanguage}
      />
    </div>
  );
};

export default index;
