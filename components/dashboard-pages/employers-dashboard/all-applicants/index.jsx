'use client';


import MobileMenu from "../../../header/MobileMenu";
import MainHeader from "../../../header/MainHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import WidgetContentBox from "./components/WidgetContentBox";
import WidgetTopFilterBox from "./components/WidgetTopFilterBox";
import MenuToggler from "../../MenuToggler";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';


const Index = ({ showMatchingInfo = false, useMatchingApi = false }) => {
  const searchParams = useSearchParams();
  const [jobIdFromUrl, setJobIdFromUrl] = useState(null);
  const [candidateName, setCandidateName] = useState("");


  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId) {
      setJobIdFromUrl(jobId);
    }
  }, [searchParams]);


  // Build link with jobId if present
  const jobId = searchParams.get('jobId');
  const matchingUrl = jobId
    ? `/company-dashboard/all-applicants-matching?jobId=${jobId}`
    : '/company-dashboard/all-applicants-matching';
  const allUrl = jobId
    ? `/company-dashboard/all-applicants?jobId=${jobId}`
    : '/company-dashboard/all-applicants';


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
          <BreadCrumb title={showMatchingInfo || useMatchingApi ? "All Matching Applicants" : "All Applicants"} />
          {/* breadCrumb */}


          <MenuToggler />
          {/* Collapsible sidebar button */}


          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{showMatchingInfo || useMatchingApi ? "Matching Applicant" : "Applicant"}</h4>
                    {useMatchingApi ? (
                      <a href={allUrl} style={{ color: '#1967d2', fontWeight: 600, fontSize: 14, textDecoration: 'underline', cursor: 'pointer' }}>Go to All Applicants</a>
                    ) : (
                      <a href={matchingUrl} style={{ color: '#1967d2', fontWeight: 600, fontSize: 14, textDecoration: 'underline', cursor: 'pointer' }}>Go to Matching Applicants</a>
                    )}
                  </div>
                  {/* End top widget filter bar */}
                  {/* <WidgetTopFilterBox
                    candidateName={candidateName}
                    onCandidateNameChange={setCandidateName}
                  /> */}
                  {/* End widget-content */}
                  <WidgetContentBox jobId={jobIdFromUrl} candidateName={candidateName} showMatchingInfo={showMatchingInfo} useMatchingApi={useMatchingApi} />
                </div>
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
        {/* End dashboard-outer */}
      </section>
      {/* <!-- End Dashboard --> */}


      <CopyrightFooter />
      {/* <!-- End Copyright --> */}
    </div>
    // End page-wrapper
  );
};


export default Index;