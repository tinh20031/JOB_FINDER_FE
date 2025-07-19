'use client';
import Link from 'next/link';

export default function PaymentFailed() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#dc3545', marginBottom: 16 }}>Thanh toán thất bại!</h1>
      <p style={{ marginBottom: 24 }}>Có lỗi xảy ra hoặc giao dịch bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
      <Link href="/candidates-dashboard/packages/buy">
        <button className="theme-btn btn-style-three">Thử lại mua gói</button>
      </Link>
    </div>
  );
} 