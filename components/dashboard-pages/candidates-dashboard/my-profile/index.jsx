"use client";

import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import Resume from "./components";
import MainHeader from "../../../header/MainHeader";
import MenuToggler from "../../MenuToggler";
import Link from "next/link";
import useResumeData from "@/services/useResumeData";

const index = () => {
  const { profile } = useResumeData();

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

      <DashboardCandidatesSidebar />
      {/* <!-- End Candidates Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
     
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    {profile?.candidateProfileId ? (
                      <Link href={`/candidate-profile/${profile.candidateProfileId}`} legacyBehavior>
                        <a style={{
                          display: 'inline-block',
                          padding: '6px 18px',
                          background: '#7367F0',
                          color: '#fff',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 20,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(115,103,240,0.08)',
                          transition: 'background 0.2s',
                          marginBottom: 0,
                          marginTop: 0,
                          cursor: 'pointer',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#5e50ee'}
                        onMouseOut={e => e.currentTarget.style.background = '#7367F0'}
                      >
                        My Profile
                      </a>
                    </Link>
                    ) : (
                      <h4>My Profile</h4>
                    )}
                  </div>
                  {/* End widget-title */}

                  <div className="widget-content">
                    <Resume />
                  </div>
                  {/* End widget-content */}
                </div>
              </div>
              {/* End ls-widget */}
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

export default index;
