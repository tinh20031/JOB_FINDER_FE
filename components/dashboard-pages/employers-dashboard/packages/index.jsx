'use client';

import React, { useEffect, useState } from "react";
import MobileMenu from "../../../header/MobileMenu";
import MainHeader from "../../../header/MainHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import ApiService from "../../../../services/api.service";
import Link from "next/link";

const getDisplayPackage = (info) => {
  if (!info) return null;
  if (info.subscription) return info.subscription;
  return info;
};

const formatLimit = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === 0 ||
    value === Number.MAX_SAFE_INTEGER ||
    value >= 999999
  ) {
    return 'Unlimited';
  }
  return value;
};

const EmployerPackagesPage = () => {
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getMyCompanySubscription()
      .then(res => {
        if (res) {
          setPackageInfo(res);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayPackage = getDisplayPackage(packageInfo);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      <DashboardEmployerSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="My company package" />
          <MenuToggler />
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget package-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Current Package</h4>
                  </div>
                  <div className="widget-content">
                    {loading ? (
                      <div className="package-loading-state">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">Loading package information...</p>
                      </div>
                    ) : displayPackage ? (
                      <div className="package-info-card">
                        {displayPackage.packageName && displayPackage.packageName.toLowerCase() !== 'free' ? (
                          <div className="premium-package">
                            <div className="package-header">
                              <div className="package-icon">
                                <i className="fas fa-crown"></i>
                              </div>
                              <div className="package-title">
                                <h3>{displayPackage.packageName || displayPackage.currentTier}</h3>
                                <span className="badge active-badge">Active</span>
                              </div>
                            </div>
                            <div className="package-details">
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-briefcase"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Posting Limit</p>
                                  <p className="detail-value">{formatLimit(displayPackage.jobPostLimit)}</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-user-check"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">CV matching limit</p>
                                  <p className="detail-value">{formatLimit(displayPackage.cvMatchLimit)}</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-tasks"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Active Jobs</p>
                                  <p className="detail-value">{displayPackage.activeJobCount}</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-clipboard-list"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Remaining Jobs</p>
                                  <p className="detail-value">{formatLimit(displayPackage.remainingJobPosts)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="free-package">
                            <div className="package-header">
                              <div className="package-icon">
                                <i className="fas fa-gift"></i>
                              </div>
                              <div className="package-title">
                                <h3>{displayPackage.packageName || displayPackage.currentTier || 'Free'}</h3>
                                <span className="badge free-badge">Free</span>
                              </div>
                            </div>
                            <div className="package-details">
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-briefcase"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Posting Limit</p>
                                  <p className="detail-value">{formatLimit(displayPackage.jobPostLimit)}</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-user-check"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">CV matching limit</p>
                                  <p className="detail-value">{formatLimit(displayPackage.cvMatchLimit)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="package-action">
                          <Link href="/employers-dashboard/packages/buy">
                            <button className="upgrade-button">
                              <i className="fas fa-arrow-up"></i>
                              Upgrade package
                            </button>
                          </Link>
                        </div>
                        {displayPackage.message || displayPackage.description ? (
                          <div style={{color: '#0070f3', marginTop: 8}}>{displayPackage.message || displayPackage.description}</div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="no-package">
                        <div className="empty-state">
                          <i className="fas fa-exclamation-circle"></i>
                          <p>No current package information.</p>
                        </div>
                        <div className="package-action">
                          <Link href="/employers-dashboard/packages/buy">
                            <button className="upgrade-button">
                              <i className="fas fa-shopping-cart"></i>
                              Browse Packages
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CopyrightFooter />
      <style jsx>{`
        .package-widget {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
          background: #fff;
        }
        .widget-title {
          padding: 20px 30px;
          background: #f5f7fc;
          border-bottom: 1px solid #ecedf2;
        }
        .widget-title h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #202124;
        }
        .widget-content {
          padding: 30px;
        }
        .package-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
        }
        .loading-text {
          margin-top: 15px;
          color: #696969;
        }
        .package-info-card {
          position: relative;
        }
        .premium-package, .free-package {
          border-radius: 10px;
          padding: 25px;
          transition: all 0.3s;
        }
        .premium-package {
          background: linear-gradient(135deg, #f5faff 0%, #eef6ff 100%);
          border: 1px solid #e0edff;
        }
        .free-package {
          background: #f5f7fc;
          border: 1px solid #ecedf2;
        }
        .package-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .package-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 20px;
        }
        .premium-package .package-icon {
          background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
          color: white;
        }
        .free-package .package-icon {
          background: linear-gradient(135deg, #f5f7fc 0%, #dfe3ef 100%);
          color: #696969;
        }
        .package-title h3 {
          margin: 0 0 5px 0;
          font-size: 22px;
          font-weight: 600;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 30px;
        }
        .active-badge {
          background-color: #e1f5ea;
          color: #0ca750;
        }
        .free-badge {
          background-color: #f0f0f0;
          color: #696969;
        }
        .package-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }
        .detail-item {
          display: flex;
          align-items: center;
        }
        .detail-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 16px;
        }
        .premium-package .detail-icon {
          background: rgba(58, 123, 213, 0.1);
          color: #3a7bd5;
        }
        .free-package .detail-icon {
          background: rgba(105, 105, 105, 0.1);
          color: #696969;
        }
        .detail-label {
          margin: 0;
          font-size: 14px;
          color: #696969;
        }
        .detail-value {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #202124;
        }
        .package-action {
          margin-top: 30px;
          display: flex;
          justify-content: center;
        }
        .upgrade-button {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
          color: white;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 10px rgba(58, 123, 213, 0.2);
        }
        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(58, 123, 213, 0.3);
        }
        .no-package .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 0;
          color: #696969;
        }
        .empty-state i {
          font-size: 48px;
          color: #d1d5db;
          margin-bottom: 15px;
        }
        .empty-state p {
          color: #696969;
        }
        @media (max-width: 767px) {
          .widget-content {
            padding: 20px;
          }
          .premium-package, .free-package {
            padding: 20px;
          }
          .package-title h3 {
            font-size: 18px;
          }
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .detail-icon {
            margin-bottom: 10px;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerPackagesPage;
