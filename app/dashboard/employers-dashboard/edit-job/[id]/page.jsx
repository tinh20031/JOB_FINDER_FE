'use client';

import MobileMenu from "../../../../../components/header/MobileMenu";
import DashboardHeader from "../../../../../components/header/DashboardHeader";
import LoginPopup from "../../../../../components/common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../../../components/header/DashboardEmployerSidebar";
import BreadCrumb from "../../../../../components/dashboard-pages/BreadCrumb";
import PostJobSteps from "../../../../../components/dashboard-pages/employers-dashboard/edit-jobs/components/PostJobSteps";
import PostBoxForm from "../../../../../components/dashboard-pages/employers-dashboard/edit-jobs/components/PostBoxForm";
import MenuToggler from "../../../../../components/dashboard-pages/MenuToggler";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { jobService } from '@/services/jobService';

const EditJobPage = () => {
  const params = useParams();
  const jobId = params.id;
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          const data = await jobService.getJobById(jobId);
          setJobData(data);
        } catch (err) {
          console.error("Error fetching job data:", err);
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
  }, [jobId]);

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!jobData) {
    return <div>No job data found.</div>;
  }

  // Transform jobData to fit formData structure in PostBoxForm if needed
  const initialFormData = {
    title: jobData.jobTitle || '',
    description: jobData.description || '',
    salary: jobData.salary ? String(jobData.salary) : '',
    industryId: jobData.industryId || 0,
    levelId: jobData.levelId || 0,
    jobTypeId: jobData.jobTypeId || 0,
    experienceLevelId: jobData.experienceLevelId || 0,
    expiryDate: jobData.expiryDate ? jobData.expiryDate.split('T')[0] : '',
    timeStart: jobData.timeStart ? jobData.timeStart.split('T')[0] : '',
    timeEnd: jobData.timeEnd ? jobData.timeEnd.split('T')[0] : '',
    provinceName: jobData.provinceName || '',
    addressDetail: jobData.addressDetail || '',
    status: jobData.status || 0,
    companyId: jobData.companyId || 0,
    jobId: jobData.id || 0
  };

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      {/* <!-- Header Span for hight --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DashboardHeader />
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
                    <PostJobSteps />
                    {/* End job steps form */}
                    <PostBoxForm initialData={initialFormData} isEditing={true} />
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