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

import { useState, useEffect } from "react";
import ForeignLanguageModal from "./ForeignLanguageModal";
import ProfileStrengthSidebar from "./ProfileStrengthSidebar";
import { useDispatch } from "react-redux";
import { setProfileUpdated } from "@/features/auth/authSlice";

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

  const dispatch = useDispatch();

  useEffect(() => {
    setProfileState(profile);
  }, [profile]);

  if (loading) return (
    <div className="row my-resume-page">
      <div className="col-12 col-lg-8 mb-4 mb-lg-0">
        <div className="default-form">
          <div className="row">
            <div className="form-group col-12">
              {/* ProfileCard Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 180, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 16 }}></div>
                <div className="skeleton-line" style={{ width: "40%", height: 28, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 18, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "30%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "50%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* AboutMe Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 120, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "90%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "80%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "70%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* Education & Experiences Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 120, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "80%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "50%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* Skills Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 80, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
                <div className="skeleton-line" style={{ width: "40%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* ForeignLanguague Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 80, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* HighlightProject Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 80, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* Certificate Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 80, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
            <div className="form-group col-12">
              {/* Awards Skeleton */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 80, marginBottom: 24, boxShadow: "0 2px 8px #eee" }}>
                <div className="skeleton-line" style={{ width: "30%", height: 22, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        {/* ProfileStrengthSidebar Skeleton */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, minHeight: 320, marginBottom: 24, boxShadow: "0 2px 8px #eee", textAlign: "center" }}>
          <div className="skeleton-line" style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px auto" }}></div>
          <div className="skeleton-line" style={{ width: "60%", height: 18, margin: "0 auto 8px auto" }}></div>
          <div className="skeleton-line" style={{ width: "80%", height: 16, margin: "0 auto 8px auto" }}></div>
        </div>
      </div>
      <style jsx>{`
        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
          border-radius: 6px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  );

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleEditProfile = () => setEditOpen(true);
  const handleEditAboutMe = () => setEditOpen(true);
  const handleCloseEdit = () => setEditOpen(false);
  const handleSaveEdit = async (updatedProfile) => {
    setSaving(true);
    try {
      // Cập nhật state ngay lập tức với dữ liệu mới
      setProfileState((prev) => ({ ...prev, ...updatedProfile }));
      
      // Đóng modal
      setEditOpen(false);
      
      // Dispatch action để cập nhật Redux store
      dispatch(setProfileUpdated(Date.now()));
      
      // Refetch data để đảm bảo đồng bộ với server
      if (typeof refetch === "function") {
        try {
          await refetch();
        } catch (refetchError) {
          console.warn("Refetch failed but profile was updated:", refetchError);
        }
      }
    } catch (e) {
      console.error("Error updating profile state:", e);
      alert("Update failed! Please try again.");
      // Không đóng modal nếu có lỗi
      setEditOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="row my-resume-page">
      <div className="col-12 col-lg-8 mb-4 mb-lg-0">
        <div className="default-form">
          <div className="row">
            <div className="form-group col-12">
              <ProfileCard profile={profileState} onEdit={handleEditProfile} />
            </div>
            <div className="form-group col-12">
              <AboutMe
                aboutme={Array.isArray(aboutme) ? aboutme[0] : aboutme}
                refetch={refetch}
                onEdit={handleEditAboutMe}
                openExternal={openAboutMeModal}
                setOpenExternal={setOpenAboutMeModal}
              />
            </div>
            <div className="form-group col-12">
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
            <div className="form-group col-12">
              <Skills
                skills={skills}
                refetch={refetch}
                openExternal={openSkillsModal}
                setOpenExternal={setOpenSkillsModal}
                forceCoreSkillModal={openSkillsModal}
              />
            </div>
            <div className="form-group col-12">
              <ForeignLanguague
                foreignlanguage={foreignlanguage}
                refetch={refetch}
                onEdit={() => setOpenFL(true)}
                openExternal={openForeignLangModal}
                setOpenExternal={setOpenForeignLangModal}
              />
            </div>
            <div className="form-group col-12">
              <HighlightProject
                project={project}
                refetch={refetch}
                openExternal={openHighlightProjectModal}
                setOpenExternal={setOpenHighlightProjectModal}
              />
            </div>
            <div className="form-group col-12">
              <Certificate
                certificate={certificate}
                refetch={refetch}
                openExternal={openCertificateModal}
                setOpenExternal={setOpenCertificateModal}
              />
            </div>
            <div className="form-group col-12">
              <Awards
                awards={awards}
                refetch={refetch}
                openExternal={openAwardsModal}
                setOpenExternal={setOpenAwardsModal}
              />
            </div>
            <div className="form-group col-12">
              {/* Removed Save button here */}
            </div>
            {/* <!-- Input --> */}
          </div>
          {/* End .row */}
          <EditProfileModal
            open={editOpen}
            onClose={handleCloseEdit}
            onSubmit={handleSaveEdit}
            profile={profileState}
            saving={saving}
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
      <div className="col-12 col-lg-4">
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
