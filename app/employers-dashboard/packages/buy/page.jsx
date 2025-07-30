'use client';

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/api.service";
import LoginPopup from "../../../../components/common/form/login/LoginPopup";
import MainHeader from "../../../../components/header/MainHeader";
import MobileMenu from "../../../../components/header/MobileMenu";
import DashboardEmployerSidebar from "../../../../components/header/DashboardEmployerSidebar";
import CopyrightFooter from "../../../../components/dashboard-pages/CopyrightFooter";

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

  if (loading || subLoading) return <div>Loading data...</div>;

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
                        {packages.map((pkg, idx) => {
                          const isCurrent = currentSubscription && currentSubscription.currentTier === pkg.name;
                          return (
                            <div
                              className={`pricing-table col-lg-4 col-md-6 col-sm-12${pkg.isRecommended ? ' tagged' : ''}${isCurrent ? ' current-package' : ''}`}
                              key={pkg.companySubscriptionTypeId || pkg.CompanySubscriptionTypeId}
                            >
                              <div className="inner-box">
                                {pkg.isRecommended ? (
                                  <span className="tag">Propose</span>
                                ) : null}
                                {isCurrent && (
                                  <span className="tag" style={{background: '#0ca750', color: '#fff'}}>Current Package</span>
                                )}
                                <div className="title">{pkg.name}</div>
                                <div style={{marginBottom: 8, fontStyle: 'italic', color: '#666', fontSize: 14}}>{pkg.description}</div>
                                <div className="price">
                                  {pkg.price === 0 ? "Free" : pkg.price?.toLocaleString()} <span className="duration">VND</span>
                                </div>
                                <div className="table-content">
                                  <ul>                                  
                                    <li><span>Posting Limit: {pkg.jobPostLimit === 2147483647 ? 'Unlimited' : pkg.jobPostLimit}</span></li>
                                    <li><span>CV matching limit: {pkg.cvMatchLimit === 2147483647 ? 'Unlimited' : pkg.cvMatchLimit}</span></li>
                                    <li><span>Trending Job Limit: {pkg.trendingJobLimit === 2147483647 ? 'Unlimited' : pkg.trendingJobLimit}</span></li>
                                  </ul>
                                </div>
                                <div className="table-footer">
                                  {!(isCurrent || pkg.price === 0) && (
                                    <button
                                      className="theme-btn btn-style-three"
                                      disabled={buyingId === (pkg.companySubscriptionTypeId || pkg.CompanySubscriptionTypeId)}
                                      onClick={() => handleBuyPackage(pkg.companySubscriptionTypeId || pkg.CompanySubscriptionTypeId)}
                                    >
                                      {buyingId === (pkg.companySubscriptionTypeId || pkg.CompanySubscriptionTypeId)
                                        ? "Processing..."
                                        : (pkg.name && pkg.name.toLowerCase() === 'basic')
                                          ? "Update to Basic"
                                          : (pkg.name && pkg.name.toLowerCase() === 'premium')
                                            ? "Update to Premium"
                                            : "Purchase/Subscription"}
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
        .current-subscription-card {
          background: #f5f7fc;
          border: 1px solid #ecedf2;
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
        }
        .pricing-table {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .pricing-table .inner-box {
          min-height: 500px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .current-package .inner-box {
          border: 3px solid #0ca750;
          box-shadow: 0 0 16px 0 #0ca75055;
          background: #eafff2;
          position: relative;
        }
        .current-package .tag {
          background: #0ca750 !important;
          color: #fff !important;
          font-weight: bold;
          font-size: 15px;
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 16px;
          border-radius: 20px;
          z-index: 2;
          box-shadow: 0 2px 8px #0ca75033;
        }
      `}</style>
    </div>
  );
};

export default BuyCompanyPackagePage; 