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

  if (loading) return <div>Checking payment status...</div>;
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
              href={type === "company" ? "/employers-dashboard/packages" : "/candidates-dashboard/packages"}
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
