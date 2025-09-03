"use client";

import MobileMenu from "../../../header/MobileMenu";
import MainHeader from "../../../header/MainHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import TopCardBlock from "./components/TopCardBlock";
import ProfileChart from "./components/ProfileChart";
import Notification from "./components/Notification";
import Applicants from "./components/Applicants";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import { useState } from "react";
import UniqueApplicantsChart from "./components/UniqueApplicantsChart";

const Index = () => {
  const [candidateName, setCandidateName] = useState("");
  // Filter input style giống WidgetTopFilterBox
  const filterInputStyle = {
    minWidth: 220,
    background: "#f5f8fa",
    border: "1px solid #e5e9ec",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    height: 48,
    boxShadow: "none",
    outline: "none",
    color: "#6f6f6f",
    fontWeight: 400,
    paddingLeft: 16,
    width: "100%",
  };
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
          <BreadCrumb title="Dashboard Home!" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <TopCardBlock />
          </div>
          {/* End .row top card block */}

          <div className="row">
            <div className="col-xl-7 col-lg-12">
              {/* <!-- Graph widget --> */}
              <div className="graph-widget ls-widget">
                <ProfileChart />
              </div>
              {/* End profile chart */}
              {/* Unique Applicants Chart */}
              <div className="graph-widget ls-widget" style={{ marginTop: 32 }}>
                <UniqueApplicantsChart />
              </div>
            </div>
            {/* End .col */}

            <div className="col-xl-5 col-lg-12">
              {/* <!-- Notification Widget --> */}
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div className="widget-content">
                  <Notification />
                </div>
              </div>
            </div>
            {/* End .col */}

            <div className="col-lg-12">
              {/* <!-- applicants Widget --> */}
              <div className="applicants-widget ls-widget">
                <div
                  className="widget-title"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ margin: 0, fontWeight: 600, fontSize: 24 }}>
                    Recent Applicants
                  </h3>
                  <div className="chosen-outer" style={{ minWidth: 300 }}>
                    <input
                      type="text"
                      className="chosen-single form-select chosen-container"
                      placeholder="Enter Candidate name..."
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      style={filterInputStyle}
                    />
                  </div>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {/* <!-- Candidate block three --> */}
                    <Applicants candidateName={candidateName} />
                  </div>
                </div>
              </div>
            </div>
            {/* End .col */}
          </div>
          {/* End .row profile and notificatins */}
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
