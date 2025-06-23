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
import ProfileStrengthSidebar from "./ProfileStrengthSidebar";

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
  const [openEducationModal, setOpenEducationModal] = useState(false);
  const [openSkillsModal, setOpenSkillsModal] = useState(false);
  const [openAboutMeModal, setOpenAboutMeModal] = useState(false);
  const [openWorkExpModal, setOpenWorkExpModal] = useState(false);
  const [openHighlightProjectModal, setOpenHighlightProjectModal] =
    useState(false);
  const [openCertificateModal, setOpenCertificateModal] = useState(false);
  const [openAwardsModal, setOpenAwardsModal] = useState(false);
  const [openForeignLangModal, setOpenForeignLangModal] = useState(false);

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
    <div className="my-resume-page" style={{ display: "flex", gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div className="default-form">
          <div className="row">
            <div className="form-group col-lg-12 col-md-12">
              <ProfileCard profile={profileState} onEdit={handleEditProfile} />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <AboutMe
                aboutme={Array.isArray(aboutme) ? aboutme[0] : aboutme}
                refetch={refetch}
                onEdit={handleEditAboutMe}
                openExternal={openAboutMeModal}
                setOpenExternal={setOpenAboutMeModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <Education
                education={education}
                refetch={refetch}
                openExternal={openEducationModal}
                setOpenExternal={setOpenEducationModal}
              />
              <Experiences
                workExperience={experiences}
                refetch={refetch}
                openExternal={openWorkExpModal}
                setOpenExternal={setOpenWorkExpModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <Skills
                skills={skills}
                refetch={refetch}
                openExternal={openSkillsModal}
                setOpenExternal={setOpenSkillsModal}
                forceCoreSkillModal={openSkillsModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <ForeignLanguague
                foreignlanguage={foreignlanguage}
                onEdit={() => setOpenFL(true)}
                openExternal={openForeignLangModal}
                setOpenExternal={setOpenForeignLangModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <HighlightProject
                project={project}
                refetch={refetch}
                openExternal={openHighlightProjectModal}
                setOpenExternal={setOpenHighlightProjectModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <Certificate
                certificate={certificate}
                refetch={refetch}
                openExternal={openCertificateModal}
                setOpenExternal={setOpenCertificateModal}
              />
            </div>
            <div className="form-group col-lg-12 col-md-12">
              <Awards
                awards={awards}
                refetch={refetch}
                openExternal={openAwardsModal}
                setOpenExternal={setOpenAwardsModal}
              />
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
            onClose={() => {
              setOpenFL(false);
              setOpenForeignLangModal(false);
            }}
            initialLanguages={foreignlanguage}
            refetch={refetch}
          />
        </div>
      </div>
      <div style={{ width: 320 }}>
        <ProfileStrengthSidebar
          onClickEducation={() => setOpenEducationModal(true)}
          onClickSkills={() => setOpenSkillsModal(true)}
          onClickAboutMe={() => setOpenAboutMeModal(true)}
          onClickWorkExp={() => setOpenWorkExpModal(true)}
          onClickHighlightProject={() => setOpenHighlightProjectModal(true)}
          onClickCertificate={() => setOpenCertificateModal(true)}
          onClickAwards={() => setOpenAwardsModal(true)}
          onClickForeignLang={() => {
            setOpenForeignLangModal(true);
            setOpenFL(true);
          }}
        />
      </div>
    </div>
  );
};

export default index;
