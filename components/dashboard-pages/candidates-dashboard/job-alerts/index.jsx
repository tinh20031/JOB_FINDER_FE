'use client';

import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import JobAlertsTable from "./components/JobAlertsTable";
import MainHeader from "../../../header/MainHeader";
import MenuToggler from "../../MenuToggler";
import notificationService from "@/services/notification.service";
import notificationHubService from "@/services/notificationHub";
import { useEffect, useState } from "react";

const index = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Lấy toàn bộ thông báo, pageSize lớn
      const data = await notificationService.getAllNotifications(1, 1000);
      setNotifications(Array.isArray(data) ? data : []);
    };
    fetchNotifications();

    // Lắng nghe notification realtime để refetch
    const handleRealtime = () => fetchNotifications();
    notificationHubService.on && notificationHubService.on('ReceiveNotification', handleRealtime);
    return () => {
      notificationHubService.off && notificationHubService.off('ReceiveNotification', handleRealtime);
    };
  }, []);

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
          <BreadCrumb title="Notification" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="ls-widget">
                <JobAlertsTable />
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

export default index;
