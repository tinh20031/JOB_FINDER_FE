'use client';
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import MainHeader from "../../../../components/header/MainHeader";
import DashboardEmployerSidebar from "../../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../../components/dashboard-pages/BreadCrumb";
import PostJobSteps from "../../../../components/dashboard-pages/employers-dashboard/post-jobs/components/PostJobSteps";
import PostBoxForm from "../../../../components/dashboard-pages/employers-dashboard/post-jobs/components/PostBoxForm";
import LoginPopup from "../../../../components/common/form/login/LoginPopup";
import MobileMenu from "../../../../components/header/MobileMenu";
import CopyrightFooter from "../../../../components/dashboard-pages/CopyrightFooter";
import { jobService } from "../../../../services/jobService";

const CloneJobPage = () => {
  const params = useParams();
  const jobId = params?.jobId;
  const [cloneData, setCloneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const titleSet = useRef(false);

  useEffect(() => {
    if (!titleSet.current) {
      document.title = 'Clone Job || Job Finder';
      titleSet.current = true;
    }
    if (!jobId) return;
    jobService.getJobById(jobId)
      .then(data => {
        setCloneData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      <DashboardEmployerSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Clone a Job" />
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Clone Job</h4>
                  </div>
                  <div className="widget-content">
                    <PostJobSteps />
                    <PostBoxForm cloneData={cloneData} isClone loading={loading} />
                  </div>
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

export default CloneJobPage; 