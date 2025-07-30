'use client';

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/api.service";
import LoginPopup from "../../../../components/common/form/login/LoginPopup";
import MainHeader from "../../../../components/header/MainHeader";
import MobileMenu from "../../../../components/header/MobileMenu";
import DashboardCandidatesSidebar from "../../../../components/header/DashboardCandidatesSidebar";
import CopyrightFooter from "../../../../components/dashboard-pages/CopyrightFooter";

// Thêm hàm lấy quota download CV theo tên gói
function getDownloadQuotaByPackageName(name) {
  if (!name) return 0;
  if (name.toLowerCase() === 'free') return 1;
  if (name.toLowerCase() === 'basic') return 3;
  if (name.toLowerCase() === 'premium') return 'Unlimited';
  return 0;
}

function canRemoveWatermarkByPackageName(name) {
  if (!name) return false;
  if (name.toLowerCase() === 'basic' || name.toLowerCase() === 'premium') return true;
  return false;
}

const BuyPackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const pkgRes = await ApiService.getSubscriptionPackages();
        setPackages(pkgRes);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const handleBuyPackage = async (subscriptionTypeId) => {
    setBuyingId(subscriptionTypeId);
    try {
      const res = await ApiService.createPayment(subscriptionTypeId);
      if (res?.CheckoutUrl || res?.checkoutUrl) {
        window.location.href = res.CheckoutUrl || res.checkoutUrl;
      } else {
        alert("Cannot create payment!");
      }
    } catch (err) {
      alert("Error creating payment!");
    }
    setBuyingId(null);
  };

  if (loading) return <div>Loading packages...</div>;

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      <DashboardCandidatesSidebar />
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
                    <div className="pricing-tabs tabs-box wow fadeInUp" style={{marginTop: 40}}>
                      <div className="row">
                        {packages.map((pkg, idx) => {
                          return (
                            <div
                              className={`pricing-table col-lg-4 col-md-6 col-sm-12${pkg.isRecommended ? ' tagged' : ''}`}
                              key={pkg.subscriptionTypeId || pkg.SubscriptionTypeId}
                            >
                              <div className="inner-box">
                                {pkg.isRecommended ? (
                                  <span className="tag">Propose</span>
                                ) : null}
                                <div className="title">{pkg.name}</div>
                                <div style={{marginBottom: 8, fontStyle: 'italic', color: '#666', fontSize: 14}}>{pkg.description}</div>
                                <div className="price">
                                  {pkg.price === 0 ? "Free" : pkg.price?.toLocaleString()} <span className="duration">VND</span>
                                </div>
                                <div className="table-content">
                                  <ul>
                                    <li><span>Try-match: {pkg.tryMatchLimit}</span></li>
                                    <li><span>Download CV: {getDownloadQuotaByPackageName(pkg.name)}</span></li>
                                    <li><span>Remove watermark: {canRemoveWatermarkByPackageName(pkg.name) ? 'Yes' : 'No'}</span></li>
                                  </ul>
                                </div>
                                <div className="table-footer">
                                  {pkg.price !== 0 && (
                                    <button
                                      className="theme-btn btn-style-three"
                                      disabled={buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                                      onClick={() => handleBuyPackage(pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                                    >
                                      {buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId)
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
        .tag {
          background: #ff7675;
          color: #fff;
          font-weight: bold;
          font-size: 15px;
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 16px;
          border-radius: 20px;
          z-index: 2;
          box-shadow: 0 2px 8px #ff767533;
        }
      `}</style>
    </div>
  );
};

export default BuyPackagePage; 