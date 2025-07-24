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
                    <h4>Available Packages</h4>
                  </div>
                  <div className="widget-content">
                    <div className="pricing-tabs tabs-box wow fadeInUp" style={{marginTop: 40}}>
                      <div className="row">
                        {packages.map((pkg, idx) => (
                          <div
                            className={`pricing-table col-lg-4 col-md-6 col-sm-12${pkg.isRecommended ? ' tagged' : ''}`}
                            key={pkg.subscriptionTypeId || pkg.SubscriptionTypeId}
                          >
                            <div className="inner-box">
                              {pkg.isRecommended ? (
                                <span className="tag">Recommended</span>
                              ) : null}
                              <div className="title">{pkg.name}</div>
                              <div className="price">
                                {pkg.price?.toLocaleString()} <span className="duration">VND</span>
                              </div>
                              <div className="table-content">
                                <ul>
                                  {pkg.description && (
                                    <li><span>{pkg.description}</span></li>
                                  )}
                                  <li><span>Try-match: {pkg.tryMatchLimit}</span></li>
                                  <li><span>Download CV: {getDownloadQuotaByPackageName(pkg.name)}</span></li>
                                  <li><span>Remove watermark: {canRemoveWatermarkByPackageName(pkg.name) ? 'Yes' : 'No'}</span></li>
                                </ul>
                              </div>
                              <div className="table-footer">
                                <button
                                  className="theme-btn btn-style-three"
                                  disabled={buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                                  onClick={() => handleBuyPackage(pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                                >
                                  {buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId) ? "Processing..." : "Buy/Subscribe"}
                                </button>
                              </div>
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
    </div>
  );
};

export default BuyPackagePage; 