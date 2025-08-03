'use client'

import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import ChatBox from "./components";
import MainHeader from "../../../header/MainHeader";
import MenuToggler from "../../MenuToggler";
import { useSelector } from "react-redux";

const Index = () => {
  const { chatSidebar } = useSelector((state) => state.toggle);

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
      <section className="user-dashboard" style={{ height: "80vh", position: "relative", zIndex: 1 }}>
        <div className="dashboard-outer" style={{ height: "100%", position: "relative", zIndex: 2 }}>
          <BreadCrumb title="Messages" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row" style={{ height: "100%", position: "relative", zIndex: 3 }}>
            <div
              className={`col-lg-12 ${
                chatSidebar ? "active-chat-contacts" : ""
              }`}
              style={{ height: "100%", position: "relative", zIndex: 4 }}
            >
              <div className="chat-widget" style={{ height: "100%", position: "relative", zIndex: 5 }}>
                <div className="widget-content" style={{ height: "100%", position: "relative", zIndex: 6 }}>
                  <ChatBox />
                </div>
              </div>
              {/* <!-- Chat Widget --> */}
            </div>
          </div>
          {/* End row */}
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