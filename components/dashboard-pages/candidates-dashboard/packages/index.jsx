'use client';

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/api.service";
import Link from "next/link";
import LoginPopup from "../../../common/form/login/LoginPopup";
import MobileMenu from "../../../header/MobileMenu";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";

import PackageDataTable from "./components/PackageDataTable";
import MainHeader from "../../../header/MainHeader";
import MenuToggler from "../../MenuToggler";
import axios from "axios";

const PackagesPage = () => {
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = React.useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Hàm cập nhật lại thông tin gói (bao gồm số lượt try-match, download...)
  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const sub = await ApiService.getMySubscription();
      setMySubscription(sub);
    } catch (e) {
      setMySubscription(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSubscription(); // Gọi khi mount
  }, []);

  useEffect(() => {
    axios.get('/api/payment/packages').then(res => setPackages(res.data));
  }, []);

  // Cho phép gọi refreshSubscription từ window để thao tác bên ngoài (ví dụ: sau khi mua gói hoặc dùng try-match)
  useEffect(() => {
    window.refreshCandidatePackage = refreshSubscription;
    return () => { delete window.refreshCandidatePackage; };
  }, []);

  // Download CV quota logic (localStorage, cộng dồn)
  const userId = (typeof window !== 'undefined' && localStorage.getItem('userId')) || '';
  const keyMax = `cv_download_max_${userId}`;
  const keyCount = `cv_download_count_${userId}`;

  // Hàm lấy quota theo loại gói
  function getQuotaByPackage(packageName) {
    if (!packageName) return 0;
    if (packageName.toLowerCase() === 'free') return 1;
    if (packageName.toLowerCase() === 'basic') return 3;
    if (packageName.toLowerCase() === 'premium') return Infinity;
    return 0;
  }

  // Khi user có gói mới, cộng quota vào localStorage
  useEffect(() => {
    if (!mySubscription) return;
    let packageName = mySubscription.isSubscribed ? mySubscription.subscription?.packageName : mySubscription.freePackage?.name;
    if (!packageName) return;
    
    // Nếu là Free và chưa từng mua gói nào, chỉ reset quota về 1/1 nếu chưa từng set hoặc chuyển từ gói khác về Free
    if (
      !mySubscription.isSubscribed &&
      packageName.toLowerCase() === 'free' &&
      (localStorage.getItem(keyMax) === null || localStorage.getItem('cv_last_package_' + userId) !== 'Free')
    ) {
      localStorage.setItem(keyMax, '1');
      localStorage.setItem(keyCount, '0');
      localStorage.setItem('cv_last_package_' + userId, 'Free');
      return;
    }
    
    // Lấy updatedAt để đánh dấu khi gói được update
    const updatedAt = mySubscription.isSubscribed ? 
      mySubscription.subscription?.updatedAt :
      mySubscription.freePackage?.updatedAt || new Date().toISOString();
    
    const lastUpdatedAt = localStorage.getItem('cv_last_updated_at_' + userId);
    
  
    // Chỉ cộng quota khi có updatedAt mới (thực sự update gói) và không phải Free package
    if (lastUpdatedAt !== updatedAt) {
      console.log('Adding quota for package update:', packageName);
      if (packageName.toLowerCase() !== 'free') {
        const add = getQuotaByPackage(packageName);
        const currentRaw = localStorage.getItem(keyMax);
        const currentMax = currentRaw === 'Infinity' ? Infinity : parseInt(currentRaw || '0', 10);
        const safeCurrent = Number.isNaN(currentMax) ? 0 : currentMax;
        const newMax = add === Infinity || safeCurrent === Infinity ? Infinity : safeCurrent + add;
        localStorage.setItem(keyMax, newMax === Infinity ? 'Infinity' : String(newMax));
      }
      localStorage.setItem('cv_last_package_' + userId, packageName);
      localStorage.setItem('cv_last_updated_at_' + userId, updatedAt);
    } else {
      console.log('Skipping quota addition - same update time');
    }
  }, [mySubscription, userId]);

  // Lấy số lượt download còn lại (đảm bảo không NaN)
  const readMaxDownloads = () => {
    const raw = localStorage.getItem(keyMax);
    if (raw === 'Infinity') return Infinity;
    const num = parseInt(raw || '0', 10);
    return Number.isNaN(num) ? 0 : num;
  };
  const readDownloadCount = () => {
    const num = parseInt(localStorage.getItem(keyCount) || '0', 10);
    return Number.isNaN(num) ? 0 : num;
  };
  const maxDownloads = readMaxDownloads();
  const downloadCount = readDownloadCount();
  const downloadRemaining = maxDownloads === Infinity ? 'Unlimited' : Math.max(0, maxDownloads - downloadCount);

  // Helper function to get progress percentage
  const getProgressPercentage = (used, total) => {
    if (total === Infinity || total === 'Unlimited') return 100;
    if (!Number.isFinite(total) || !Number.isFinite(used) || total <= 0) return 0;
    return Math.min(100, ((total - used) / total) * 100);
  };

  // Hàm xử lý khi click vào button mua package
  const handleBuyPackageClick = () => {
    // Kiểm tra nếu user có gói hiện tại và chưa sử dụng hết
    if (mySubscription?.isSubscribed && mySubscription.subscription) {
      const currentPackage = mySubscription.subscription;
      const remainingTryMatches = currentPackage.remainingTryMatches || 0;
      const remainingDownloads = downloadRemaining;
      
      if (remainingTryMatches > 0 || (remainingDownloads !== 'Unlimited' && remainingDownloads > 0)) {
        const message = `You have not used up all of your current ${currentPackage.packageName} package.\n\n` +
          `- Remaining Try Matches: ${remainingTryMatches}\n` +
          `- Remaining CV Downloads: ${remainingDownloads}\n` +
        
          `Are you sure you want to purchase a new package?`;
        
        setConfirmMessage(message);
        setShowConfirmModal(true);
        return;
      }
    }
    
    // Nếu không có gói hiện tại hoặc đã sử dụng hết, chuyển thẳng đến trang buy
    window.location.href = "/candidates-dashboard/packages/buy";
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    window.location.href = "/candidates-dashboard/packages/buy";
  };

  const handleCancelPurchase = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />

      {/* End Login Popup Modal */}

      <MainHeader />
      {/* End Header */}

      <MobileMenu />
      <DashboardCandidatesSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="My Package" />
          <MenuToggler />
          <div className="row">
            <div className="col-lg-12">
              {/* Package Information Card */}
              <div className="ls-widget package-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <div className="title-section">
                      <h4 style={{ color: 'white' }}><i className="fas fa-box-open" style={{ color: 'white' }}></i> My Current Package</h4>
                    </div>
                  </div>
                  <div className="widget-content">
                    {loading ? (
                      <div className="package-loading-state">
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                        </div>
                        <p className="loading-text">Loading your package information...</p>
                      </div>
                    ) : mySubscription ? (
                      <div className="package-info-card">
                        {mySubscription.isSubscribed ? (
                          <div className="premium-package">
                            <div className="package-header">
                              <div className="package-info">
                                <h3 className="package-name">{mySubscription.subscription?.packageName || 'Premium'}</h3>
                                <span className="status-badge active">
                                  <i className="fas fa-check-circle"></i>
                                  {mySubscription.subscription?.packageName || 'Active Subscription'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="package-stats">
                              <div className="stat-card">
                                <div className="stat-header">
                                  <div className="stat-icon try-match">
                                    <i className="fas fa-sync-alt"></i>
                                  </div>
                                  <div className="stat-info">
                                    <h4>Try-Match Credits</h4>
                                    <p className="stat-description">Find your perfect job matches</p>
                                  </div>
                                </div>
                                <div className="stat-content">
                                  {(() => {
                                    const remaining = mySubscription.subscription?.remainingTryMatches;
                                    let limit = mySubscription.subscription?.tryMatchLimit;
                                    if (limit === undefined && packages && packages.length > 0) {
                                      const pkg = packages.find(p => (p.name || '').toLowerCase() === (mySubscription.subscription?.packageName || '').toLowerCase());
                                      if (pkg && pkg.tryMatchLimit !== undefined) limit = pkg.tryMatchLimit;
                                    }
                                    if (remaining !== undefined && limit !== undefined) {
                                      const total = remaining > limit ? remaining : limit;
                                      const percentage = getProgressPercentage(total - remaining, total);
                                      return (
                                        <>
                                          <div className="stat-numbers">
                                            <span className="current">{remaining}</span>
                                            <span className="divider">/</span>
                                            <span className="total">{total === Infinity ? 'Unlimited' : total}</span>
                                          </div>
                                          {total !== Infinity && (
                                            <div className="progress-bar">
                                              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    } else if (remaining !== undefined) {
                                      return (
                                        <div className="stat-numbers">
                                          <span className="current">{remaining}</span>
                                        </div>
                                      );
                                    } else {
                                      return <div className="stat-numbers"><span className="current">-</span></div>;
                                    }
                                  })()}
                                </div>
                              </div>

                              <div className="stat-card">
                                <div className="stat-header">
                                  <div className="stat-icon download">
                                    <i className="fas fa-download"></i>
                                  </div>
                                  <div className="stat-info">
                                    <h4>CV Downloads</h4>
                                    <p className="stat-description">Download candidate profiles</p>
                                  </div>
                                </div>
                                <div className="stat-content">
                                  <div className="stat-numbers">
                                    <span className="current">{downloadRemaining}</span>
                                    {maxDownloads !== Infinity && (
                                      <>
                                        <span className="divider">/</span>
                                        <span className="total">{maxDownloads}</span>
                                      </>
                                    )}
                                  </div>
                                  {maxDownloads !== Infinity && (
                                    <div className="progress-bar">
                                      <div className="progress-fill" style={{ width: `${getProgressPercentage(downloadCount, maxDownloads)}%` }}></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : mySubscription.freePackage ? (
                          <div className="free-package">
                            <div className="package-header">
                              <div className="package-info">
                                <h3 className="package-name">{mySubscription.freePackage.name}</h3>
                                <span className="status-badge free">
                                  <i className="fas fa-star"></i>
                                  {mySubscription.freePackage.name ? `${mySubscription.freePackage.name} Plan` : 'Free Plan'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="package-stats">
                              <div className="stat-card">
                                <div className="stat-header">
                                  <div className="stat-icon try-match free">
                                    <i className="fas fa-sync-alt"></i>
                                  </div>
                                  <div className="stat-info">
                                    <h4>Free Try-Match</h4>
                                    <p className="stat-description">Limited job matching</p>
                                  </div>
                                </div>
                                <div className="stat-content">
                                  {(() => {
                                    const remaining = mySubscription.freePackage?.remainingFreeMatches;
                                    const limit = mySubscription.freePackage?.tryMatchLimit;
                                    if (remaining !== undefined && limit !== undefined) {
                                      const percentage = getProgressPercentage(limit - remaining, limit);
                                      return (
                                        <>
                                          <div className="stat-numbers">
                                            <span className="current">{remaining}</span>
                                            <span className="divider">/</span>
                                            <span className="total">{limit === Infinity ? 'Unlimited' : limit}</span>
                                          </div>
                                          {limit !== Infinity && (
                                            <div className="progress-bar">
                                              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    } else if (limit !== undefined) {
                                      return (
                                        <div className="stat-numbers">
                                          <span className="current">{limit}</span>
                                        </div>
                                      );
                                    } else {
                                      return <div className="stat-numbers"><span className="current">-</span></div>;
                                    }
                                  })()}
                                </div>
                              </div>

                              <div className="stat-card">
                                <div className="stat-header">
                                  <div className="stat-icon download free">
                                    <i className="fas fa-download"></i>
                                  </div>
                                  <div className="stat-info">
                                    <h4>CV Downloads</h4>
                                    <p className="stat-description">Basic download access</p>
                                  </div>
                                </div>
                                <div className="stat-content">
                                  <div className="stat-numbers">
                                    <span className="current">{downloadRemaining}</span>
                                    <span className="divider">/</span>
                                    <span className="total">{maxDownloads}</span>
                                  </div>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${getProgressPercentage(downloadCount, maxDownloads)}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="no-package">
                            <div className="empty-state">
                              <div className="empty-icon">
                                <i className="fas fa-inbox"></i>
                              </div>
                              <h3>No Package Information</h3>
                              <p>Unable to load your package details at this time.</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="package-actions">
                          <button className="primary-button" onClick={handleBuyPackageClick}>
                            <i className={mySubscription.isSubscribed ? "fas fa-arrow-up" : "fas fa-shopping-cart"}></i>
                            <span>{mySubscription.isSubscribed ? 'Upgrade Package' : 'Buy Package'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="no-subscription">
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="fas fa-shopping-bag"></i>
                          </div>
                          <h3>Welcome to Packages</h3>
                          <p>Choose the perfect plan to unlock premium features and boost your job search experience.</p>
                          <div className="benefits-list">
                            <div className="benefit-item">
                              <i className="fas fa-check"></i>
                              <span>Advanced job matching</span>
                            </div>
                            <div className="benefit-item">
                              <i className="fas fa-check"></i>
                              <span>Unlimited CV downloads</span>
                            </div>
                            <div className="benefit-item">
                              <i className="fas fa-check"></i>
                              <span>Priority support</span>
                            </div>
                          </div>
                        </div>
                        <div className="package-actions">
                          <Link href="/candidates-dashboard/packages/buy">
                            <button className="primary-button large">
                              <i className="fas fa-rocket"></i>
                              <span>Explore Packages</span>
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
              <h3>Confirm package purchase</h3>
              <button className="modal-close" onClick={handleCancelPurchase}>
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
              <button className="btn-cancel" onClick={handleCancelPurchase}>
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button className="btn-confirm" onClick={handleConfirmPurchase}>
                <i className="fas fa-check"></i>
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        .package-widget {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
          background: #fff;
          border: 1px solid #f0f2f5;
          transition: all 0.3s ease;
        }

        .package-widget:hover {
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .widget-title {
          padding: 30px 35px 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
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

        .title-section {
          position: relative;
          z-index: 1;
        }

        .title-section h4 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-section h4 i {
          font-size: 20px;
          opacity: 0.9;
        }

        .subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
          font-weight: 400;
        }

        .widget-content {
          padding: 35px;
        }

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
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }

        .package-info-card {
          position: relative;
        }

        .premium-package, .free-package {
          border-radius: 16px;
          padding: 0;
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .premium-package {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 2px solid #e0edff;
        }

        .premium-package::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }

        .free-package {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 2px solid #e5e7eb;
        }

        .package-header {
          padding: 30px 30px 25px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

        .package-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 14px;
          min-width: fit-content;
        }

        .premium-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .free-badge {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
        }

        .package-info {
          flex: 1;
        }

        .package-name {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .status-badge.free {
          background: rgba(107, 114, 128, 0.1);
          color: #4b5563;
        }

        .package-stats {
          padding: 0 30px 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #f0f2f5;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .stat-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-icon.try-match {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-icon.download {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
        }

        .stat-icon.try-match.free, .stat-icon.download.free {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
        }

        .stat-info h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #1f2937;
        }

        .stat-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .stat-content {
          text-align: center;
        }

        .stat-numbers {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .stat-numbers .current {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-numbers .divider {
          font-size: 20px;
          color: #d1d5db;
          font-weight: 500;
        }

        .stat-numbers .total {
          font-size: 18px;
          color: #6b7280;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .package-actions {
          padding: 0 30px 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          margin-top: 32px;
        }

        .primary-button, .secondary-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
          margin: 0 auto;
        }

        .primary-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .primary-button.large {
          padding: 16px 32px;
          font-size: 16px;
        }

        .secondary-button {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .secondary-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }

        .no-subscription, .no-package {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-state {
          margin-bottom: 35px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 50%;
          font-size: 32px;
          color: #9ca3af;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1f2937;
        }

        .empty-state p {
          font-size: 16px;
          color: #6b7280;
          max-width: 400px;
          margin: 0 auto 25px;
          line-height: 1.5;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 300px;
          margin: 0 auto;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-size: 15px;
          color: #4b5563;
        }

        .benefit-item i {
          color: #10b981;
          font-size: 14px;
          width: 16px;
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
          z-index: 1050;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f8f9fa;
          color: #333;
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .warning-icon {
          margin-bottom: 16px;
        }

        .warning-icon i {
          font-size: 48px;
          color: #ffc107;
        }

        .message-content {
          text-align: left;
        }

        .main-message {
          font-size: 16px;
          margin-bottom: 12px;
          color: #333;
          font-weight: 500;
        }

        .detail-line {
          font-size: 14px;
          margin-bottom: 8px;
          color: #666;
          padding-left: 16px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel, .btn-confirm {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f8f9fa;
          color: #666;
        }

        .btn-cancel:hover {
          background: #e9ecef;
          color: #333;
        }

        .btn-confirm {
          background: #007bff;
          color: white;
        }

        .btn-confirm:hover {
          background: #0056b3;
        }

        @media (max-width: 768px) {
          .widget-content {
            padding: 25px 20px;
          }

          .package-header {
            padding: 25px 20px 20px;
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .package-name {
            font-size: 24px;
          }

          .package-stats {
            padding: 0 20px 25px;
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }

          .package-actions {
            padding: 0 20px 25px;
            flex-direction: column;
            align-items: center;
          }

          .primary-button, .secondary-button {
            justify-content: center;
            width: 100%;
            margin: 0 auto;
          }

          .title-section h4 {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .widget-title {
            padding: 25px 20px 20px;
          }

          .stat-numbers .current {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default PackagesPage;