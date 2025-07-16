'use client';
import MobileMenu from "@/components/header/MobileMenu";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "@/components/header/DashboardCandidatesSidebar";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";
import DashboardCandidatesHeader from "@/components/header/DashboardCandidatesHeader";
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
import VideoProfileUploader from "@/components/candidates/VideoProfileUploader";
import apiService from "@/services/api.service";
import { useEffect, useState } from "react";

const ProfileVideoPage = () => {
  const [candidateProfileId, setCandidateProfileId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiService.get('/CandidateProfile/me');
        setCandidateProfileId(profile.candidateProfileId);
        setVideoUrl(profile.videoUrl || null);
      } catch {}
    };
    fetchProfile();
  }, []);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <DashboardCandidatesHeader />
      <MobileMenu />
      <DashboardCandidatesSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Profile Introduction Video" />
          <MenuToggler />
          <div className="row">
            <div className="col-lg-12">
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>Profile Introduction Video</h4>
                </div>
                <div className="widget-content">
                  <VideoProfileUploader
                    candidateProfileId={candidateProfileId}
                    initialVideoUrl={videoUrl}
                    onUploadSuccess={setVideoUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CopyrightFooter />
    </div>
  );
};

export default ProfileVideoPage; 