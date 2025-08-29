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
import dayjs from "dayjs";

const getDisplayPackage = (info) => {
  if (!info) return null;
  if (info.subscription) return info.subscription;
  return info;
};

const formatLimit = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === Number.MAX_SAFE_INTEGER ||
    value >= 99999 ||
    value === -2147483648
  ) {
    return 'Unlimited';
  }
  if (value === 0) {
    return '0';
  }
  return value;
};

const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';

const getPackageBadge = (name) => {
  if (!name) return { label: 'Unknown', className: 'unknown-badge', icon: <i className="fas fa-question"></i> };
  const lower = name.toLowerCase();
  if (lower === 'free') return { label: 'Free', className: 'free-badge', icon: <i className="fas fa-heart"></i> };
  if (lower === 'basic') return { label: 'Basic Active', className: 'basic-badge', icon: <i className="fas fa-leaf"></i> };
  if (lower === 'premium') return { label: 'Premium Active', className: 'premium-badge', icon: <i className="fas fa-star"></i> };
  if (lower === 'pro') return { label: 'Pro Active', className: 'pro-badge', icon: <i className="fas fa-gem"></i> };
  return { label: `${name} Active`, className: 'other-badge', icon: <i className="fas fa-box"></i> };
};

const getPackageBadgeLabel = (name) => {
  if (!name) return 'Unknown';
  const lower = name.toLowerCase();
  if (lower === 'free') return 'Free';
  if (lower === 'basic') return 'Basic Active';
  if (lower === 'premium') return 'Premium Active';
  if (lower === 'pro') return 'Pro Active';
  return `${name} Active`;
};

const EmployerPackagesPage = () => {
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

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

  const handleUpgradeClick = () => {
    // Kiểm tra nếu user chưa sử dụng hết package hiện tại
    if (displayPackage.remainingJobPosts > 0 || displayPackage.remainingTrendingJobPosts > 0) {
      const message = `You have not used up all of your current ${displayPackage.packageName} package.\n\n` +
`- Remaining Job Posts: ${displayPackage.remainingJobPosts}\n` +
`- Remaining Trending Jobs: ${displayPackage.remainingTrendingJobPosts}\n` +
`- Active Jobs: ${displayPackage.activeJobCount}\n\n` +
`Are you sure you want to upgrade your package?`;
      
      setConfirmMessage(message);
      setShowConfirmModal(true);
    } else {
      // Nếu đã sử dụng hết thì chuyển thẳng đến trang buy
      window.location.href = "/company-dashboard/packages/buy";
    }
  };

  const handleConfirmUpgrade = () => {
    setShowConfirmModal(false);
    window.location.href = "/company-dashboard/packages/buy";
  };

  const handleCancelUpgrade = () => {
    setShowConfirmModal(false);
  };

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
                    <h4><i className="fas fa-box-open"></i> My Current Package</h4>
                  </div>
                  <div className="widget-content">
                    {loading ? (
                      <div className="package-loading-state">
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                        </div>
                        <p className="loading-text">Loading package information...</p>
                      </div>
                    ) : displayPackage ? (
                      (() => {
                        const badge = getPackageBadge(displayPackage.packageName);
                        return (
                          <div className={`package-info-card ${badge.className.replace('-badge', '')}-package`}>
                            {displayPackage.packageName && displayPackage.packageName.toLowerCase() !== 'free' ? (
                              <div className="premium-package">
                                <div className="package-header">
                                  <div className="package-icon premium-icon">
                                    <i className="fas fa-crown"></i>
                                  </div>
                                  <div className="package-title">
                                    <h3>{displayPackage.packageName || displayPackage.currentTier}</h3>
                                    <span className="badge premium-badge">
                                      <i className="fas fa-star"></i> {getPackageBadgeLabel(displayPackage.packageName)}
                                    </span>
                                  </div>
                                </div>
                                {/* giữ nguyên phần package-stats, package-usage như cũ */}
                                <div className="package-stats">
                                  <div className="stats-grid">
                                    <div className={`stat-card job-posts${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-briefcase"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.jobPostLimit)}</h4>
                                        <p>Job Posting Limit</p>
                                      </div>
                                    </div>
                                    <div className={`stat-card cv-match${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-user-check"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.cvMatchLimit)}</h4>
                                        <p>CV Matching Limit</p>
                                      </div>
                                    </div>
                                    <div className={`stat-card trending${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-fire"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.trendingJobLimit)}</h4>
                                        <p>Trending Job Limit</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className={`package-usage${badge.className === 'free-badge' ? ' free' : ''}`}>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-tasks"></i> Active Jobs
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-tasks"></i>
                                            <span>Active Jobs</span>
                                          </div>
                                          <p>Number of job posts that are currently active and visible to candidates. These jobs are being displayed in search results and can receive applications.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{displayPackage.activeJobCount}</span>
                                    </div>
                                  </div>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-clipboard-list"></i> Remaining Jobs
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-clipboard-list"></i>
                                            <span>Remaining Jobs</span>
                                          </div>
                                          <p>Number of job posts you can still create with your current package. Once this reaches 0, you'll need to upgrade your package to post more jobs.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{formatLimit(displayPackage.remainingJobPosts)}</span>
                                    </div>
                                  </div>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-bolt"></i> Remaining Trending
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-bolt"></i>
                                            <span>Remaining Trending</span>
                                          </div>
                                          <p>Number of trending job posts you can still create. Trending jobs appear prominently in search results and get higher visibility to attract more qualified candidates.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{formatLimit(displayPackage.remainingTrendingJobPosts)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="package-action">
                                  <button 
                                    className="upgrade-button"
                                    onClick={handleUpgradeClick}
                                  >
                                    <i className="fas fa-rocket"></i>
                                    <span>Upgrade Package</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="free-package">
                                <div className="package-header">
                                  <div className="package-icon free-icon">
                                    <i className="fas fa-gift"></i>
                                  </div>
                                  <div className="package-title">
                                    <h3>{displayPackage.packageName || displayPackage.currentTier || 'Free Plan'}</h3>
                                    <span className="badge free-badge">
                                      <i className="fas fa-heart"></i> {getPackageBadgeLabel(displayPackage.packageName)}
                                    </span>
                                  </div>
                                </div>
                                {/* giữ nguyên phần package-stats, package-usage như cũ */}
                                <div className="package-stats">
                                  <div className="stats-grid">
                                    <div className={`stat-card job-posts${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-briefcase"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.jobPostLimit)}</h4>
                                        <p>Job Posting Limit</p>
                                      </div>
                                    </div>
                                    <div className={`stat-card cv-match${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-user-check"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.cvMatchLimit)}</h4>
                                        <p>CV Matching Limit</p>
                                      </div>
                                    </div>
                                    <div className={`stat-card trending${badge.className === 'free-badge' ? ' free' : ''}`}>
                                      <div className="stat-icon">
                                        <i className="fas fa-fire"></i>
                                      </div>
                                      <div className="stat-content">
                                        <h4>{formatLimit(displayPackage.trendingJobLimit)}</h4>
                                        <p>Trending Job Limit</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className={`package-usage${badge.className === 'free-badge' ? ' free' : ''}`}>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-tasks"></i> Active Jobs
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-tasks"></i>
                                            <span>Active Jobs</span>
                                          </div>
                                          <p>Number of job posts that are currently active and visible to candidates. These jobs are being displayed in search results and can receive applications.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{displayPackage.activeJobCount}</span>
                                    </div>
                                  </div>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-clipboard-list"></i> Remaining Jobs
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-clipboard-list"></i>
                                            <span>Remaining Jobs</span>
                                          </div>
                                          <p>Number of job posts you can still create with your current package. Once this reaches 0, you'll need to upgrade your package to post more jobs.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{formatLimit(displayPackage.remainingJobPosts)}</span>
                                    </div>
                                  </div>
                                  <div className="usage-item">
                                    <div className="usage-info">
                                      <span className="usage-label tooltip-trigger">
                                        <i className="fas fa-bolt"></i> Remaining Trending
                                        <i className="fas fa-info-circle tooltip-icon"></i>
                                        <div className="tooltip-content">
                                          <div className="tooltip-header">
                                            <i className="fas fa-bolt"></i>
                                            <span>Remaining Trending</span>
                                          </div>
                                          <p>Number of trending job posts you can still create. Trending jobs appear prominently in search results and get higher visibility to attract more qualified candidates.</p>
                                        </div>
                                      </span>
                                      <span className="usage-value">{formatLimit(displayPackage.remainingTrendingJobPosts)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="package-action">
                                  <button 
                                    className="upgrade-button"
                                    onClick={handleUpgradeClick}
                                  >
                                    <i className="fas fa-rocket"></i>
                                    <span>Upgrade Package</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="no-package">
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="fas fa-box-open"></i>
                          </div>
                          <h3>No Package Found</h3>
                          <p>You don't have any active package. Browse our packages to get started!</p>
                        </div>
                        <div className="package-action">
                          <Link href="/company-dashboard/packages/buy">
                            <button className="browse-button">
                              <i className="fas fa-shopping-cart"></i>
                              <span>Browse Packages</span>
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
       
       {/* Confirmation Modal */}
       {showConfirmModal && (
         <div className="modal-overlay">
           <div className="modal-content">
             <div className="modal-header">
               <h3>Confirm package upgrade</h3>
               <button className="modal-close" onClick={handleCancelUpgrade}>
                 <i className="fas fa-times"></i>
               </button>
             </div>
             <div className="modal-body">
               <div className="warning-icon">
                 <i className="fas fa-exclamation-triangle"></i>
               </div>
               <div className="message-content">
                 {confirmMessage.split('\n').map((line, index) => (
                   <p key={index} className={line.startsWith('-') ? 'detail-line' : 'main-message'}>
                     {line}
                   </p>
                 ))}
               </div>
             </div>
             <div className="modal-footer">
               <button className="btn-cancel" onClick={handleCancelUpgrade}>
                 <i className="fas fa-times"></i>
                 <span>Cancel</span>
               </button>
               <button className="btn-confirm" onClick={handleConfirmUpgrade}>
                 <i className="fas fa-check"></i>
                 <span>Confirm</span>
               </button>
             </div>
           </div>
         </div>
       )}
      
      <style jsx>{`
        /* Main Container */
        .package-widget {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          margin-bottom: 30px;
          background: #ffffff;
          border: 1px solid #f0f2f5;
        }

        /* Header */
        .widget-title {
          padding: 24px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-bottom: none;
          position: relative;
          overflow: hidden;
        }

        .widget-title::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .widget-title h4 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .widget-content {
          padding: 32px;
          background: #fafbfc;
        }

        /* Loading State */
        .package-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 0;
        }

        .loading-spinner {
          margin-bottom: 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }

                 /* Package Cards */
         .package-info-card {
           position: relative;
           overflow: visible;
         }

                 .premium-package, .free-package {
           border-radius: 16px;
           padding: 32px;
           position: relative;
           overflow: visible;
           backdrop-filter: blur(10px);
         }

        .premium-package {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .premium-package::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }

        .free-package {
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* Package Header */
        .package-header {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
          position: relative;
          z-index: 2;
        }

        .package-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          font-size: 24px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .package-title h3 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Stats Grid */
        .package-stats {
          margin-bottom: 32px;
          position: relative;
          z-index: 2;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-card.free {
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .stat-content h4 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-content p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

                 /* Usage Section */
         .package-usage {
           background: rgba(255, 255, 255, 0.1);
           backdrop-filter: blur(10px);
           border: 1px solid rgba(255, 255, 255, 0.2);
           border-radius: 12px;
           padding: 24px;
           margin-bottom: 32px;
           position: relative;
           z-index: 2;
           overflow: visible;
         }

        .usage-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
        }

        .usage-item:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

                 .usage-label {
           display: flex;
           align-items: center;
           gap: 10px;
           font-size: 15px;
           font-weight: 500;
           color: rgba(255, 255, 255, 0.9);
           position: relative;
           cursor: help;
         }

         /* Tooltip Styles */
                   .tooltip-trigger {
            position: relative;
            z-index: 10;
          }

         .tooltip-icon {
           font-size: 12px;
           color: rgba(255, 255, 255, 0.7);
           margin-left: 6px;
           transition: all 0.2s ease;
         }

         .tooltip-trigger:hover .tooltip-icon {
           color: rgba(255, 255, 255, 1);
         }

                   .tooltip-content {
            position: absolute;
            bottom: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: #ffffff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 280px;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            pointer-events: none;
          }

          .tooltip-trigger:hover .tooltip-content {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(-5px);
          }

          .tooltip-content::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 8px solid transparent;
            border-top-color: #1f2937;
          }

         .tooltip-header {
           display: flex;
           align-items: center;
           gap: 8px;
           margin-bottom: 8px;
           font-weight: 600;
           font-size: 14px;
           color: #fbbf24;
         }

         .tooltip-content p {
           margin: 0;
           font-size: 13px;
           line-height: 1.4;
           color: #d1d5db;
         }

        .usage-value {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }

        /* Action Buttons */
        .package-action {
          margin-top: 32px;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .upgrade-button, .browse-button {
          padding: 16px 32px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ff7675 0%, #e17055 100%);
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 118, 117, 0.3);
          text-decoration: none;
        }

        .upgrade-button:hover, .browse-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 118, 117, 0.4);
        }

        /* Package Message */
        .package-message {
          margin-top: 24px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          position: relative;
          z-index: 2;
        }

        /* Empty State */
        .no-package {
          text-align: center;
          padding: 60px 0;
        }

        .empty-state {
          margin-bottom: 32px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 32px;
          color: #8b5cf6;
        }

        .empty-state h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .widget-content {
            padding: 20px;
          }
          
          .premium-package, .free-package {
            padding: 24px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .stat-card {
            padding: 16px;
          }
          
          .package-title h3 {
            font-size: 22px;
          }
          
          .package-header {
            flex-direction: column;
            text-align: center;
          }
          
          .package-icon {
            margin-right: 0;
            margin-bottom: 16px;
          }
          
          .usage-item {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }

                 @media (max-width: 480px) {
           .widget-title {
             padding: 20px;
           }
           
           .widget-title h4 {
             font-size: 18px;
           }
           
           .premium-package, .free-package {
             padding: 20px;
           }
           
           .upgrade-button, .browse-button {
             padding: 14px 24px;
             font-size: 15px;
           }

                       .tooltip-content {
              width: 240px;
              left: 0;
              transform: translateX(0);
              bottom: calc(100% + 15px);
            }

            .tooltip-trigger:hover .tooltip-content {
              transform: translateX(0) translateY(-5px);
            }

            .tooltip-content::after {
              left: 20px;
              transform: translateX(0);
            }
         }

         /* Modal Styles */
         .modal-overlay {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: rgba(0, 0, 0, 0.5);
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 9999;
           backdrop-filter: blur(5px);
         }

         .modal-content {
           background: #ffffff;
           border-radius: 16px;
           box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
           max-width: 500px;
           width: 90%;
           max-height: 80vh;
           overflow-y: auto;
           animation: modalSlideIn 0.3s ease-out;
         }

         @keyframes modalSlideIn {
           from {
             opacity: 0;
             transform: translateY(-20px) scale(0.95);
           }
           to {
             opacity: 1;
             transform: translateY(0) scale(1);
           }
         }

         .modal-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 24px 24px 16px 24px;
           border-bottom: 1px solid #e5e7eb;
         }

         .modal-header h3 {
           margin: 0;
           font-size: 20px;
           font-weight: 700;
           color: #374151;
         }

         .modal-close {
           background: none;
           border: none;
           font-size: 20px;
           color: #6b7280;
           cursor: pointer;
           padding: 8px;
           border-radius: 8px;
           transition: all 0.2s ease;
         }

         .modal-close:hover {
           background: #f3f4f6;
           color: #374151;
         }

         .modal-body {
           padding: 24px;
           text-align: center;
         }

         .warning-icon {
           width: 60px;
           height: 60px;
           border-radius: 50%;
           background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
           display: flex;
           align-items: center;
           justify-content: center;
           margin: 0 auto 20px;
           font-size: 24px;
           color: #ffffff;
         }

         .message-content {
           text-align: left;
         }

         .message-content .main-message {
           margin: 0 0 16px 0;
           font-size: 16px;
           line-height: 1.5;
           color: #374151;
           font-weight: 500;
         }

         .message-content .detail-line {
           margin: 8px 0;
           font-size: 14px;
           color: #6b7280;
           padding-left: 16px;
           position: relative;
         }

         .message-content .detail-line:before {
           content: '';
           position: absolute;
           left: 0;
           top: 8px;
           width: 6px;
           height: 6px;
           background: #f59e0b;
           border-radius: 50%;
         }

         .modal-footer {
           display: flex;
           gap: 12px;
           padding: 16px 24px 24px 24px;
           border-top: 1px solid #e5e7eb;
         }

         .btn-cancel, .btn-confirm {
           flex: 1;
           padding: 12px 20px;
           border-radius: 8px;
           border: none;
           font-size: 14px;
           font-weight: 600;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           transition: all 0.2s ease;
         }

         .btn-cancel {
           background: #f3f4f6;
           color: #6b7280;
         }

         .btn-cancel:hover {
           background: #e5e7eb;
           color: #374151;
         }

         .btn-confirm {
           background: linear-gradient(135deg, #10b981 0%, #059669 100%);
           color: #ffffff;
         }

         .btn-confirm:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
         }

         @media (max-width: 480px) {
           .modal-content {
             width: 95%;
             margin: 20px;
           }
           
           .modal-header {
             padding: 20px 20px 12px 20px;
           }
           
           .modal-body {
             padding: 20px;
           }
           
           .modal-footer {
             padding: 12px 20px 20px 20px;
             flex-direction: column;
           }
         }
      `}</style>
    </div>
  );
};

export default EmployerPackagesPage;