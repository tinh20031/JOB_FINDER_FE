'use client';
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#28a745', marginBottom: 16 }}>Thanh toán thành công!</h1>
      <p style={{ marginBottom: 24 }}>Gói dịch vụ của bạn đã được kích hoạt. Cảm ơn bạn đã sử dụng dịch vụ.</p>
      <Link href="/candidates-dashboard/packages">
        <button className="theme-btn btn-style-three">Xem gói của tôi</button>
      </Link>
    </div>
  );
} 