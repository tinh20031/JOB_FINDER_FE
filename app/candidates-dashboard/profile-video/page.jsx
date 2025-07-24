'use client';
import MobileMenu from "@/components/header/MobileMenu";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "@/components/header/DashboardCandidatesSidebar";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";
import MainHeader from "@/components/header/MainHeader";
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
import VideoProfileUploader from "@/components/candidates/VideoProfileUploader";
import apiService from "@/services/api.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProfileVideoPage = () => {
  const router = useRouter();
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
      <MainHeader />
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
      <style jsx>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          background: #f5f8ff;
          color: #2563eb;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          padding: 8px 18px;
          margin-bottom: 18px;
          margin-left: 0;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .back-btn:hover {
          background: #e3f2fd;
          color: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default ProfileVideoPage; 