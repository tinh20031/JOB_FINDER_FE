'use client';
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ApiService from "../../services/api.service";
import LoginPopup from "../../components/common/form/login/LoginPopup";
import FooterDefault from "../../components/footer/common-footer";
import MainHeader from "@/components/header/MainHeader";
import MobileMenu from "../../components/header/MobileMenu";
import Breadcrumb from "../../components/dashboard-pages/BreadCrumb";

const PaymentSuccessPageContent = () => {
  const searchParams = useSearchParams();
  let orderCode = searchParams.get("orderCode");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const type = searchParams.get("type");
  

  // Only prepend SUB- for candidate, not for company
  if (orderCode && type !== 'company' && !orderCode.startsWith("SUB-")) {
    orderCode = "SUB-" + orderCode;
  }

  useEffect(() => {
    if (orderCode) {
      ApiService.checkPaymentStatus(orderCode, type)
        .then((res) => {
          setStatus(res);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to check payment status");
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("Missing or invalid order code!");
    }
  }, [orderCode, type]);

  if (loading) {
    return (
      <>
        <span className="header-span"></span>
        <LoginPopup />
        <MainHeader />
        <MobileMenu />
        <div className="loading-wrapper">
          <div className="loading-card">
            <div className="spinner" />
            <h4 className="loading-title">Checking payment status...</h4>
            <p className="loading-sub">Please wait while we verify your order details</p>
            <div className="skeleton-group">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          </div>
        </div>
        <FooterDefault footerStyle="alternate5" />
        <style jsx>{`
          .loading-wrapper {
            min-height: 50vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }
          .loading-card {
            width: 100%;
            max-width: 620px;
            background: #fff;
            border-radius: 16px;
            padding: 28px 24px;
            box-shadow: 0 12px 30px rgba(2, 6, 23, 0.08);
            text-align: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            margin: 0 auto 16px;
            animation: spin 0.8s linear infinite;
          }
          .loading-title { margin: 0 0 6px; font-weight: 800; color: #0f172a; }
          .loading-sub { margin: 0 0 18px; color: #64748b; }
          .skeleton-group { display: grid; gap: 10px; margin-top: 8px; }
          .skeleton {
            position: relative;
            overflow: hidden;
            background: #f1f5f9;
            height: 14px;
            border-radius: 8px;
          }
          .skeleton::after {
            content: '';
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer 1.4s infinite;
          }
          .skeleton-line { width: 100%; }
          .skeleton-line.short { width: 60%; margin: 0 auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </>
    );
  }
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!status) return <div>No payment status data!</div>;

  return (
    <>
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      {/* Breadcrumb căn giữa */}
      <div style={{ textAlign: 'center' }}>
        <Breadcrumb title="Order Completed" meta="Order Completed" />
      </div>
      <section className="order-confirmation">
        <div className="auto-container">
          <div className="upper-box">
            <span className="icon fa fa-check"></span>
            <h4>Your order is completed!</h4>
            <div className="text">Thank you. Your order has been received.</div>
          </div>
          <ul className="order-info">
            <li>
              <span>Order Number</span>
              <strong>{status.orderCode}</strong>
            </li>
            <li>
              <span>Date</span>
              <strong>{status.updatedAt ? new Date(status.updatedAt).toLocaleString() : ''}</strong>
            </li>
            <li>
              <span>Total</span>
              <strong>{status.amount?.toLocaleString()} VND</strong>
            </li>
            <li>
              <span>Status</span>
              <strong>{status.status}</strong>
            </li>
          </ul>
          <div className="order-box">
            <h3>Order details</h3>
            <table>
              <thead>
                <tr>
                  <th><strong>Product</strong></th>
                  <th><strong>Subtotal</strong></th>
                </tr>
              </thead>
              <tbody>
                <tr className="cart-item">
                  <td className="product-name">Subscription Package</td>
                  <td className="product-total">{status.amount?.toLocaleString()} VND</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="order-total">
                  <td>Total</td>
                  <td><span className="amount">{status.amount?.toLocaleString()} VND</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {String(status.status).toLowerCase() === "completed" ? (
            <p style={{ color: "green", fontWeight: 600, marginTop: 24 }}>Payment successful! Your package has been activated.</p>
          ) : (
            <p style={{ color: "red", marginTop: 24 }}>Payment not completed or failed.</p>
          )}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a
                              href={type === "company" ? "/company-dashboard/packages" : "/candidates-dashboard/packages"}
              style={{ display: 'inline-block', padding: '8px 20px', background: '#1976d2', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}
            >
              {type === "company" ? "Return to My Company Packages" : "Return My Package"}
            </a>
          </div>
        </div>
      </section>
      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

const PaymentSuccessPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PaymentSuccessPageContent />
  </Suspense>
);

export default PaymentSuccessPage; 
