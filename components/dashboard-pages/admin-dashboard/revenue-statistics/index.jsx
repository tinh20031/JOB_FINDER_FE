'use client'

import { useState, useEffect } from 'react';
import MobileMenu from "../../../header/MobileMenu";
import MainHeader from "../../../header/MainHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import RevenueSummaryCards from "./components/RevenueSummaryCards";
import RevenueChart from "./components/RevenueChart";
import PackageTypeBreakdown from "./components/PackageTypeBreakdown";
import RecentTransactions from "./components/RecentTransactions";
import DateRangeFilter from "./components/DateRangeFilter";
import ExportData from "./components/ExportData";
import PackageUpgrades from "./components/PackageUpgrades";

const RevenueStatisticsDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>

      <LoginPopup />

      <MainHeader />

      <MobileMenu />

      <DashboardAdminSidebar />

      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Revenue Statistics" />

          <MenuToggler />

          <div className="row">
            <div className="col-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Revenue Overview</h4>
                </div>
                <div className="widget-content">
                  <DateRangeFilter 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <RevenueSummaryCards dateRange={dateRange} />
          </div>

          <div className="row">
            <div className="col-xl-6 col-lg-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Revenue Trend</h4>
                </div>
                <div className="widget-content">
                  <RevenueChart dateRange={dateRange} />
                </div>
              </div>
            </div>

            <div className="col-xl-6 col-lg-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Recent Transactions</h4>
                </div>
                <div className="widget-content">
                  <RecentTransactions dateRange={dateRange} />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Revenue by Package Type</h4>
                </div>
                <div className="widget-content">
                  <PackageTypeBreakdown dateRange={dateRange} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Package Upgrades & User Retention</h4>
                </div>
                <div className="widget-content">
                  <PackageUpgrades dateRange={dateRange} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <ExportData dateRange={dateRange} />
            </div>
          </div>
        </div>
      </section>

      <CopyrightFooter />
    </div>
  );
};

export default RevenueStatisticsDashboard; 