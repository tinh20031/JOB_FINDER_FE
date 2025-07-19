'use client';
import Pricing from '@/components/pricing/Pricing';

export default function BuyPackagePage() {
  return (
    <div className="page-wrapper dashboard">
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <h2 style={{marginBottom: 24}}>Mua gói dịch vụ</h2>
          <Pricing />
        </div>
      </section>
    </div>
  );
} 