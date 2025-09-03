'use client';

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/api.service";
import LoginPopup from "../../../../components/common/form/login/LoginPopup";
import MainHeader from "../../../../components/header/MainHeader";
import MobileMenu from "../../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../../components/header/DashboardEmployerSidebar";
import CopyrightFooter from "../../../../components/dashboard-pages/CopyrightFooter";

// Inline icons for feature list and badges
const IconCheck = ({ color = "#0ca750" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = ({ color = "#d63031" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
    <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSparkles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 6 }}>
    <path d="M12 3l1.8 3.6L18 8.4l-3.6 1.8L12 14l-1.8-3.6L6 8.4l3.6-1.8L12 3zM19 14l.9 1.8L22 17l-2.1 1.1L19 20l-1-1.9L16 17l2-.9 1-2.1zM5 14l.9 1.8L8 17l-2.1 1.1L5 20l-1-1.9L2 17l2-.9 1-2.1z" fill="#ff9f43" />
  </svg>
);

const BuyCompanyPackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const pkgRes = await ApiService.getCompanySubscriptionPackages();
        setPackages(pkgRes);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      setSubLoading(true);
      try {
        const sub = await ApiService.getMyCompanySubscription();
        setCurrentSubscription(sub);
      } catch (err) {
        setCurrentSubscription(null);
      }
      setSubLoading(false);
    };
    fetchCurrentSubscription();
  }, []);

  const handleBuyPackage = async (subscriptionTypeId) => {
    setBuyingId(subscriptionTypeId);
    try {
      const res = await ApiService.createCompanySubscriptionPayment(subscriptionTypeId);
      if (res?.CheckoutUrl || res?.checkoutUrl) {
        window.location.href = res.CheckoutUrl || res.checkoutUrl;
      } else {
        alert("Unable to create payment!");
      }
    } catch (err) {
      alert("There was an error creating the payment.!");
    }
    setBuyingId(null);
  };

  if (loading || subLoading) {
    return (
      <div className="page-wrapper dashboard">
        <span className="header-span"></span>
        <LoginPopup />
        <MainHeader />
        <MobileMenu />
        <DashboardEmployerSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="tabs-box">
                    <div className="widget-title">
                      <h4>List of corporate packages</h4>
                    </div>
                    <div className="widget-content">
                      <div className="pricing-tabs tabs-box" style={{ marginTop: 40 }}>
                        <div className="row">
                          {[1, 2, 3].map((i) => (
                            <div className="col-lg-4 col-md-6 col-sm-12" key={i}>
                              <div className="skeleton-card">
                                <div className="skeleton skeleton-badge" />
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-desc" />
                                <div className="skeleton skeleton-price" />
                                <div className="skeleton skeleton-line" />
                                <div className="skeleton skeleton-line" />
                                <div className="skeleton skeleton-line" />
                                <div className="skeleton skeleton-button" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <CopyrightFooter />
        <style jsx>{`
          .skeleton-card { border-radius: 16px; padding: 24px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.06); min-height: 360px; }
          .skeleton { position: relative; overflow: hidden; background: #f1f2f6; border-radius: 8px; margin-bottom: 14px; }
          .skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.4s infinite; }
          .skeleton-badge { width: 120px; height: 24px; border-radius: 20px; }
          .skeleton-title { width: 60%; height: 28px; }
          .skeleton-desc { width: 90%; height: 16px; }
          .skeleton-price { width: 40%; height: 32px; }
          .skeleton-line { width: 100%; height: 14px; }
          .skeleton-button { width: 70%; height: 40px; border-radius: 10px; margin-top: 12px; }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      <DashboardEmployerSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  {/* Bỏ hoàn toàn phần hiển thị card Thông tin gói hiện tại ở đây */}
                  <div className="widget-title">
                    <h4>List of corporate packages</h4>
                  </div>
                  <div className="widget-content">
                    <div className="pricing-tabs tabs-box wow fadeInUp" style={{marginTop: 40}}>
                      <div className="row">
                        {packages.map((pkg) => {
                          const planKey = pkg.companySubscriptionTypeId || pkg.CompanySubscriptionTypeId;
                          const isRecommended = Boolean(pkg.isRecommended);
                          const isCurrent = Boolean(currentSubscription && currentSubscription.currentTier === pkg.name);
                          const isBasic = pkg.name && pkg.name.toLowerCase() === 'basic';
                          const isPremium = pkg.name && pkg.name.toLowerCase() === 'premium';
                          const postingLimit = pkg.jobPostLimit === 2147483647 ? 'Unlimited' : pkg.jobPostLimit;
                          const cvMatchLimit = pkg.cvMatchLimit === 2147483647 ? 'Unlimited' : pkg.cvMatchLimit;
                          const trendingJobLimit = pkg.trendingJobLimit === 2147483647 ? 'Unlimited' : pkg.trendingJobLimit;

                          return (
                            <div className="col-lg-4 col-md-6 col-sm-12" key={planKey}>
                              <div className={`pricing-card ${isRecommended ? 'recommended' : ''} ${isCurrent ? 'current' : ''}`}>
                                {isCurrent ? (
                                  <div className="ribbon ribbon-current">Current Plan</div>
                                ) : isRecommended ? (
                                  <div className="ribbon">Recommended <IconSparkles /></div>
                                ) : null}
                                <div className={`card-header ${isBasic ? 'basic' : ''} ${isPremium ? 'premium' : ''}`}>
                                  <div className="plan-name">{pkg.name}</div>
                                  {pkg.description ? (
                                    <div className="plan-desc">{pkg.description}</div>
                                  ) : null}
                                  <div className="plan-price">
                                    {pkg.price === 0 ? (
                                      <>
                                        Free
                                        <span className="price-suffix">/ forever</span>
                                      </>
                                    ) : (
                                      <>
                                        {pkg.price?.toLocaleString()}<span className="currency"> VND</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ul className="features">
                                  <li>
                                    <IconCheck />
                                    <span>Posting Limit: <strong>{postingLimit}</strong></span>
                                  </li>
                                  <li>
                                    <IconCheck />
                                    <span>CV matching limit: <strong>{cvMatchLimit}</strong></span>
                                  </li>
                                  <li>
                                    <IconCheck />
                                    <span>Trending Job Limit: <strong>{trendingJobLimit}</strong></span>
                                  </li>
                                </ul>
                                <div className="card-footer">
                                  {!isCurrent && pkg.price !== 0 && (
                                    <button
                                      className={`cta-btn ${isPremium ? 'btn-premium' : isBasic ? 'btn-basic' : ''}`}
                                      disabled={buyingId === planKey}
                                      onClick={() => handleBuyPackage(planKey)}
                                    >
                                      {buyingId === planKey
                                        ? 'Processing...'
                                        : isBasic
                                          ? 'Choose Basic'
                                          : isPremium
                                            ? 'Choose Premium'
                                            : 'Choose Plan'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CopyrightFooter />
      <style jsx>{`
        .row { display: flex; flex-wrap: wrap; align-items: stretch; }

        /* Pricing card */
        .pricing-card {
          position: relative;
          height: 100%;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          overflow: hidden;
          transition: transform .25s ease, box-shadow .25s ease;
          display: flex;
          flex-direction: column;
          margin-bottom: 30px;
        }
        .pricing-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
        .pricing-card.current { box-shadow: 0 16px 40px rgba(16,185,129,0.22); }

        .ribbon {
          position: absolute;
          top: 14px;
          right: 14px;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: #fff;
          padding: 6px 12px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 6px 16px rgba(37,117,252,0.3);
          z-index: 2;
        }
        .ribbon-current { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }

        .card-header { padding: 24px 24px 16px 24px; background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%); }
        .card-header.basic { background: linear-gradient(180deg, #eef9f3 0%, #ffffff 100%); }
        .card-header.premium { background: linear-gradient(180deg, #fff5eb 0%, #ffffff 100%); }

        .plan-name { font-size: 20px; font-weight: 700; color: #111; }
        .plan-desc { margin-top: 6px; color: #6b7280; font-size: 14px; }
        .plan-price { margin-top: 14px; font-size: 28px; font-weight: 800; color: #0f172a; }
        .price-suffix { font-size: 12px; margin-left: 6px; color: #64748b; font-weight: 600; }
        .currency { font-size: 14px; margin-left: 6px; color: #64748b; font-weight: 700; }

        .features { list-style: none; margin: 0; padding: 12px 24px; flex: 1; }
        .features li { display: flex; align-items: center; padding: 10px 0; color: #334155; border-bottom: 1px dashed #eef2f7; }
        .features li:last-child { border-bottom: none; }
        .features strong { color: #0f172a; }

        .card-footer { padding: 16px 24px 24px 24px; }
        .cta-btn {
          width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; font-weight: 700; border-radius: 12px; color: #fff; background: #111827; border: none;
          cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, opacity .2s ease;
          box-shadow: 0 10px 18px rgba(17,24,39,0.18);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 22px rgba(17,24,39,0.22); }
        .cta-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-basic { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 18px rgba(16,185,129,0.25); }
        .btn-basic:hover { box-shadow: 0 14px 24px rgba(16,185,129,0.32); }
        .btn-premium { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 10px 18px rgba(245,158,11,0.25); }
        .btn-premium:hover { box-shadow: 0 14px 24px rgba(245,158,11,0.32); }
      `}</style>
    </div>
  );
};

export default BuyCompanyPackagePage; 