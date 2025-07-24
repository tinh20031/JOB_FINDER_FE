'use client';
import Link from 'next/link';

export default function PaymentCancelled() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#ffc107', marginBottom: 16 }}>Bạn đã hủy thanh toán</h1>
      <p style={{ marginBottom: 24 }}>Giao dịch đã bị hủy theo yêu cầu của bạn.</p>
      <Link href="/candidates-dashboard/packages/buy">
        <button className="theme-btn btn-style-three">Quay lại mua gói</button>
      </Link>
    </div>
  );
} 