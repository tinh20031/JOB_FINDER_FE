'use client'

import { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const RevenueSummaryCards = ({ dateRange }) => {
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    candidateRevenue: 0,
    companyRevenue: 0,
    totalPayments: 0,
    candidatePayments: 0,
    companyPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueSummary = async () => {
      try {
        setLoading(true);
        const toIsoDateTime = (value, isEnd = false) => {
          if (!value) return undefined;
          if (typeof value === 'string' && value.includes('T')) return value;
          return isEnd ? `${value}T23:59:59.999Z` : `${value}T00:00:00Z`;
        };

        // Call API with range
        const response = await ApiService.getRevenueSummary(
          toIsoDateTime(dateRange?.startDate, false),
          toIsoDateTime(dateRange?.endDate, true)
        );

        // Normalize response keys
        const d = response || {};
        const num = (v) => (typeof v === 'number' ? v : Number(v)) || 0;

        const totalRevenue = num(d.totalRevenue ?? d.TotalRevenue ?? d.summary?.totalRevenue);
        const candidateRevenue = num(d.candidateRevenue ?? d.CandidateRevenue ?? d.revenue?.candidate);
        const companyRevenue = num(d.companyRevenue ?? d.CompanyRevenue ?? d.revenue?.company);
        const totalPayments = num(d.totalPayments ?? d.TotalPayments ?? d.summary?.totalPayments);
        const candidatePayments = num(d.candidatePayments ?? d.CandidatePayments ?? d.payments?.candidate);
        const companyPayments = num(d.companyPayments ?? d.CompanyPayments ?? d.payments?.company);

        setSummaryData({
          totalRevenue,
          candidateRevenue,
          companyRevenue,
          totalPayments,
          candidatePayments,
          companyPayments,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching revenue summary:', err);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueSummary();
  }, [dateRange]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);

  if (loading) {
    return (
      <div className="col-12">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-12">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="summary-card gradient-blue">
          <div className="card-icon"><i className="icon la la-coins"></i></div>
          <div className="card-content">
            <h4>{formatCurrency(summaryData.totalRevenue)}</h4>
            <p>Total Revenue</p>
            <small>{formatNumber(summaryData.totalPayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="summary-card gradient-green">
          <div className="card-icon"><i className="icon la la-user"></i></div>
          <div className="card-content">
            <h4>{formatCurrency(summaryData.candidateRevenue)}</h4>
            <p>Candidate Revenue</p>
            <small>{formatNumber(summaryData.candidatePayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="summary-card gradient-amber">
          <div className="card-icon"><i className="icon la la-building"></i></div>
          <div className="card-content">
            <h4>{formatCurrency(summaryData.companyRevenue)}</h4>
            <p>Company Revenue</p>
            <small>{formatNumber(summaryData.companyPayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="summary-card gradient-rose">
          <div className="card-icon"><i className="icon la la-percentage"></i></div>
          <div className="card-content">
            <h4>
              {summaryData.totalRevenue > 0
                ? Math.round((summaryData.candidateRevenue / summaryData.totalRevenue) * 100)
                : 0}%
            </h4>
            <p>Candidate Share</p>
            <small>of total revenue</small>
          </div>
        </div>
      </div>

      <style jsx>{`
        .summary-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #007bff;
          transition: all .25s ease;
          margin-bottom: 20px;
        }
        .summary-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }
        .card-icon { width: 48px; height: 48px; border-radius: 999px; display: flex; align-items: center; justify-content: center; color: #fff; }
        .card-icon i { font-size: 20px; }
        .card-content h4 { margin: 0 0 4px; font-weight: 800; color: #0f172a; }
        .card-content p { margin: 0; color: #334155; font-weight: 600; }
        .card-content small { color: #64748b; }

        .gradient-blue .card-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .gradient-green .card-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .gradient-amber .card-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .gradient-rose .card-icon { background: linear-gradient(135deg, #f43f5e, #e11d48); }
      `}</style>
    </>
  );
};

export default RevenueSummaryCards; 