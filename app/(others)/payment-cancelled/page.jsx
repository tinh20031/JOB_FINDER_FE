'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoginPopup from "../../../components/common/form/login/LoginPopup";
import FooterDefault from "../../../components/footer/common-footer";
import MainHeader from "@/components/header/MainHeader";
import MobileMenu from "@/components/header/MobileMenu";
import Breadcrumb from "../../../components/dashboard-pages/BreadCrumb";
import { useRouter } from "next/navigation";

const PaymentCancelledPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  let orderCode = searchParams.get("orderCode");
  const error = searchParams.get("error");
  let type = searchParams.get("type");

  // Auto-detect company if orderCode starts with COMPSUB-
  if (!type && orderCode && orderCode.startsWith("COMPSUB-")) {
    type = "company";
  }

  // Đảm bảo orderCode luôn có tiền tố SUB- nếu là candidate
  if (orderCode && type !== "company" && !orderCode.startsWith("SUB-")) {
    orderCode = "SUB-" + orderCode;
  }

  const handleReturn = () => {
    if (type === "company") {
      router.push("/company-dashboard/packages");
    } else {
      router.push("/candidates-dashboard/packages");
    }
  };

  return (
    <>
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      {/* Breadcrumb căn giữa */}
      <div style={{ textAlign: 'center' }}>
        <Breadcrumb title="Payment Cancelled" meta="Payment Cancelled" />
      </div>
      <section className="order-confirmation">
        <div className="auto-container">
          <div className="upper-box">
            <span className="icon fa fa-times" style={{ color: '#e53935' }}></span>
            <h4 style={{ color: '#e53935' }}>Your payment was cancelled!</h4>
            <div className="text" style={{ color: '#e53935' }}>Your order was not completed. If you want to continue, please try again.</div>
          </div>
          <ul className="order-info">
            <li>
              <span>Order Number</span>
              <strong>{orderCode}</strong>
            </li>
            {error && (
              <li>
                <span>Error</span>
                <strong style={{ color: 'red' }}>{error}</strong>
              </li>
            )}
            <li>
              <span>Status</span>
              <strong style={{ color: '#e53935' }}>Cancelled</strong>
            </li>
          </ul>
          <div className="order-box">
            <h3>Order details</h3>
            <table>
              <thead>
                <tr>
                  <th><strong>Product</strong></th>
                  <th><strong>Status</strong></th>
                </tr>
              </thead>
              <tbody>
                <tr className="cart-item">
                  <td className="product-name">Subscription Package</td>
                  <td className="product-total" style={{ color: '#e53935' }}>Cancelled</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ color: '#e53935', marginTop: 24 }}>If you want to continue purchasing the package, please re-select the service package and make the payment again.</p>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              onClick={handleReturn}
              style={{ display: 'inline-block', padding: '8px 20px', background: '#e53935', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 500, border: 'none', cursor: 'pointer' }}
            >
              {type === "company" ? "Return to Company Packages" : "Return to Packages page"}
            </button>
          </div>
        </div>
      </section>
      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

const PaymentCancelledPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PaymentCancelledPageContent />
  </Suspense>
);

export default PaymentCancelledPage; 