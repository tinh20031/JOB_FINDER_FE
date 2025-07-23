'use client';

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/api.service";
import Link from "next/link";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesHeader from "../../../header/DashboardCandidatesHeader";
import MobileMenu from "../../../header/MobileMenu";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import axios from "axios";

const PackagesPage = () => {
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = React.useState([]);

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
    // Đã từng cộng quota chưa?
    let lastPackage = localStorage.getItem('cv_last_package_' + userId);
    if (lastPackage !== packageName) {
      // Cộng quota mới
      const add = getQuotaByPackage(packageName);
      const currentMax = parseInt(localStorage.getItem(keyMax) || '0', 10);
      localStorage.setItem(keyMax, currentMax + add);
      localStorage.setItem('cv_last_package_' + userId, packageName);
    }
  }, [mySubscription, userId]);

  // Lấy số lượt download còn lại
  const maxDownloads = localStorage.getItem(keyMax) === 'Infinity' ? Infinity : parseInt(localStorage.getItem(keyMax) || '0', 10);
  const downloadCount = parseInt(localStorage.getItem(keyCount) || '0', 10);
  const downloadRemaining = maxDownloads === Infinity ? 'Unlimited' : Math.max(0, maxDownloads - downloadCount);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <DashboardCandidatesHeader />
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
                    <h4>My Current Package</h4>
                  </div>
                  <div className="widget-content">
                    {loading ? (
                      <div className="package-loading-state">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">Loading your package information...</p>
                      </div>
                    ) : mySubscription ? (
                      <div className="package-info-card">
                        {mySubscription.isSubscribed ? (
                          <div className="premium-package">
                            <div className="package-header">
                              <div className="package-icon">
                                <i className="fas fa-crown"></i>
                              </div>
                              <div className="package-title">
                                <h3>{mySubscription.subscription?.packageName || 'Free'}</h3>
                                <span className="badge active-badge">Active</span>
                              </div>
                            </div>
                            <div className="package-details">
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-sync-alt"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Remaining Try-match</p>
                                  <p className="detail-value">{
                                    (() => {
                                      const remaining = mySubscription.subscription?.remainingTryMatches;
                                      let limit = mySubscription.subscription?.tryMatchLimit;
                                      if (limit === undefined && packages && packages.length > 0) {
                                        const pkg = packages.find(p => (p.name || '').toLowerCase() === (mySubscription.subscription?.packageName || '').toLowerCase());
                                        if (pkg && pkg.tryMatchLimit !== undefined) limit = pkg.tryMatchLimit;
                                      }
                                      if (remaining !== undefined && limit !== undefined) {
                                        // Nếu số còn lại lớn hơn số tối đa mặc định, lấy số còn lại làm tổng số
                                        const total = remaining > limit ? remaining : limit;
                                        return `${remaining} / ${total === Infinity ? 'Unlimited' : total}`;
                                      } else if (remaining !== undefined) {
                                        return `${remaining}`;
                                      } else {
                                        return '-';
                                      }
                                    })()
                                  }</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-download"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Download CV left</p>
                                  <p className="detail-value">{downloadRemaining} {maxDownloads === Infinity ? '' : `/ ${maxDownloads}`}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : mySubscription.freePackage ? (
                          <div className="free-package">
                            <div className="package-header">
                              <div className="package-icon">
                                <i className="fas fa-gift"></i>
                              </div>
                              <div className="package-title">
                                <h3>{mySubscription.freePackage.name}</h3>
                                <span className="badge free-badge">Free</span>
                              </div>
                            </div>
                            <div className="package-details">
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-sync-alt"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Free try-match</p>
                                  <p className="detail-value">{
                                    (mySubscription.freePackage?.tryMatchLimit !== undefined)
                                      ? `${mySubscription.freePackage.tryMatchLimit} / ${mySubscription.freePackage.tryMatchLimit === Infinity ? 'Unlimited' : mySubscription.freePackage.tryMatchLimit}`
                                      : (mySubscription.freePackage?.tryMatchLimit !== undefined ? mySubscription.freePackage.tryMatchLimit : '-')
                                  }</p>
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <i className="fas fa-download"></i>
                                </div>
                                <div className="detail-content">
                                  <p className="detail-label">Download CV left</p>
                                  <p className="detail-value">{downloadRemaining} / {maxDownloads}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="no-package">
                            <div className="empty-state">
                              <i className="fas fa-exclamation-circle"></i>
                              <p>No package information available</p>
                            </div>
                          </div>
                        )}
                        <div className="package-action">
                          <Link href="/candidates-dashboard/packages/buy">
                            <button className="upgrade-button">
                              <i className="fas fa-arrow-up"></i>
                              {mySubscription.isSubscribed ? 'Upgrade Package' : 'Buy Package'}
                            </button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="no-subscription">
                        <div className="empty-state">
                          <i className="fas fa-exclamation-triangle"></i>
                          <h3>No subscription found</h3>
                          <p>You haven't subscribed to any packages yet.</p>
                        </div>
                        <div className="package-action">
                          <Link href="/candidates-dashboard/packages/buy">
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

      {/* Added CSS Styles */}
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

        .no-subscription .empty-state,
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

        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #202124;
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

export default PackagesPage;