'use client';

import MobileMenu from "../../../../../components/header/MobileMenu";
import MainHeader from "../../../../../components/header/MainHeader";
import LoginPopup from "../../../../../components/common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../../../components/dashboard-pages/BreadCrumb";
import PostJobSteps from "../../../../../components/dashboard-pages/employers-dashboard/edit-jobs/components/PostJobSteps";
import PostBoxForm from "./PostBoxForm";
import MenuToggler from "../../../../../components/dashboard-pages/MenuToggler";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { jobService } from '@/services/jobService';

const EditJobPage = () => {
  const params = useParams();
  const JobId = params.id;
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (JobId) {
      const fetchJobData = async () => {
        try {
          const data = await jobService.getJobById(JobId);
          setJobData(data);
        } catch (err) {
          setError("Failed to load job data.");
        } finally {
          setLoading(false);
        }
      };
      fetchJobData();
    } else {
      setLoading(false);
      setError("Job ID is missing.");
    }
  }, [JobId]);

  if (loading) {
    return (
      <div className="page-wrapper dashboard">
        <span className="header-span"></span>
        <LoginPopup />
        <MainHeader />
        <MobileMenu />
        <DashboardEmployerSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Edit Job" />
            <MenuToggler />
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>Loading Job Details</h4>
                </div>
                <div className="widget-content">
                  <div className="skeleton-loader">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line large"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!jobData) {
    return <div>No job data found.</div>;
  }

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      {/* <!-- Header Span for hight --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <MainHeader />
      {/* End Header */}

      <MobileMenu />
      {/* End MobileMenu */}

      <DashboardEmployerSidebar />
      {/* <!-- End User Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Edit Job!" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Edit Job</h4>
                  </div>

                  <div className="widget-content">
                    {/* <PostJobSteps /> */}
                    {/* End job steps form */}
                    <PostBoxForm initialData={jobData} isEditing={true} />
                    {/* End post box form */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
        {/* End dashboard-outer */}
      </section>
      {/* <!-- End Dashboard --> */}
    </div>
    // End page-wrapper
  );
};

export default EditJobPage; 