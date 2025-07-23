'use client';
import { useEffect, useRef } from "react";
import MainHeader from "../../../components/header/MainHeader";
import DashboardCandidatesSidebar from "../../../components/header/DashboardCandidatesSidebar";
import BreadCrumb from "../../../components/dashboard-pages/BreadCrumb";
import CvMatchingHistory from "../../../components/dashboard-pages/candidates-dashboard/cv-matching-history/CvMatchingHistory";
import LoginPopup from "../../../components/common/form/login/LoginPopup";
import MobileMenu from "../../../components/header/MobileMenu";
import CopyrightFooter from "../../../components/dashboard-pages/CopyrightFooter";

const CvMatchingHistoryPage = () => {
  const titleSet = useRef(false);

  useEffect(() => {
    if (!titleSet.current) {
      document.title = 'CV Match History || Job Finder';
      titleSet.current = true;
    }
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
          <BreadCrumb title="CV Match History" />
          <div className="row">
            <div className="col-lg-12">
              <CvMatchingHistory />
            </div>
          </div>
        </div>
      </section>
      
      <CopyrightFooter />
    </div>
  );
};

export default CvMatchingHistoryPage; 