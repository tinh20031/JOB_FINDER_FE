'use client'

import { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const RevenueChart = ({ dateRange }) => {
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    totalRevenue: 0,
    candidateRevenue: 0,
    companyRevenue: 0,
    todayTransactions: 0,
    totalTransactions: 0,
    activeUserSubscriptions: 0,
    activeCompanySubscriptions: 0,
    revenueBreakdown: {
      candidatePercentage: 0,
      companyPercentage: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const toIsoDateTime = (value, isEnd = false) => {
          if (!value) return undefined;
          if (typeof value === 'string' && value.includes('T')) return value;
          return isEnd ? `${value}T23:59:59.999Z` : `${value}T00:00:00Z`;
        };

        const response = await ApiService.getDashboardStatistics(
          toIsoDateTime(dateRange?.startDate, false),
          toIsoDateTime(dateRange?.endDate, true)
        );
        
        
        // Normalize various possible response shapes
        const data = response || {};
        const getNum = (v) => (typeof v === 'number' ? v : Number(v)) || 0;

        const todayRevenue = getNum(data.todayRevenue ?? data.TodayRevenue ?? data.metrics?.todayRevenue);
        const weekRevenue = getNum(data.weekRevenue ?? data.WeekRevenue ?? data.metrics?.weekRevenue);
        const monthRevenue = getNum(data.monthRevenue ?? data.MonthRevenue ?? data.metrics?.monthRevenue);
        const yearRevenue = getNum(data.yearRevenue ?? data.YearRevenue ?? data.metrics?.yearRevenue);
        const totalRevenue = getNum(data.totalRevenue ?? data.TotalRevenue ?? data.summary?.totalRevenue);

        const candidateRevenue = getNum(data.candidateRevenue ?? data.CandidateRevenue ?? data.revenue?.candidate);
        const companyRevenue = getNum(data.companyRevenue ?? data.CompanyRevenue ?? data.revenue?.company);

        const todayTransactions = getNum(data.todayTransactions ?? data.TodayTransactions ?? data.metrics?.todayTransactions);
        const totalTransactions = getNum(data.totalTransactions ?? data.TotalTransactions ?? data.summary?.totalTransactions);

        const activeUserSubscriptions = getNum(
          data.activeUserSubscriptions ?? data.activeCandidateSubscriptions ?? data.ActiveUserSubscriptions
        );
        const activeCompanySubscriptions = getNum(
          data.activeCompanySubscriptions ?? data.ActiveCompanySubscriptions
        );

        const rb = data.revenueBreakdown ?? data.RevenueBreakdown ?? {};
        let candidatePercentage = getNum(
          rb.candidatePercentage ?? rb.CandidatePercentage ?? data.candidatePercentage ?? data.share?.candidate
        );
        let companyPercentage = getNum(
          rb.companyPercentage ?? rb.CompanyPercentage ?? data.companyPercentage ?? data.share?.company
        );
        // If backend returns 0..1, convert to %
        if (candidatePercentage > 0 && candidatePercentage <= 1) candidatePercentage *= 100;
        if (companyPercentage > 0 && companyPercentage <= 1) companyPercentage *= 100;

        setDashboardData({
          todayRevenue,
          weekRevenue,
          monthRevenue,
          yearRevenue,
          totalRevenue,
          candidateRevenue,
          companyRevenue,
          todayTransactions,
          totalTransactions,
          activeUserSubscriptions,
          activeCompanySubscriptions,
          revenueBreakdown: {
            candidatePercentage,
            companyPercentage,
          },
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);

  if (loading) {
    return (
      <div className="revenue-chart">
        <div className="overview-cards skeleton">
          {[...Array(4)].map((_, i) => (
            <div className="overview-card" key={i}>
              <div className="card-icon skeleton-pill" />
              <div className="card-content">
                <div className="skeleton-line lg" />
                <div className="skeleton-line md" />
                <div className="skeleton-line sm" />
              </div>
            </div>
          ))}
        </div>

        <div className="subscription-stats">
          <div className="stats-content skeleton">
            {[...Array(2)].map((_, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-icon skeleton-pill" />
                <div className="stat-info" style={{ width: '100%' }}>
                  <div className="skeleton-line md" />
                  <div className="skeleton-line sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .revenue-chart { padding: 20px; }
          .overview-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
          .skeleton .overview-card,
          .skeleton .stat-item { position: relative; overflow: hidden; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 16px; }
          .skeleton-line { height: 12px; background: #f1f5f9; border-radius: 8px; margin: 8px 0; position: relative; overflow: hidden; }
          .skeleton-line.lg { width: 60%; height: 18px; }
          .skeleton-line.md { width: 40%; }
          .skeleton-line.sm { width: 30%; height: 10px; }
          .skeleton-pill { width: 48px; height: 48px; background: #eef2ff; border-radius: 999px; }
          .skeleton-line::after, .overview-card::after, .stat-item::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.4s infinite; }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="revenue-chart">
      <div className="chart-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon today">
              <i className="icon la la-calendar-day"></i>
            </div>
            <div className="card-content">
              <h4>{formatCurrency(dashboardData.todayRevenue)}</h4>
              <p>Today's Revenue</p>
              <small>{formatNumber(dashboardData.todayTransactions)} transactions</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon week">
              <i className="icon la la-calendar-week"></i>
            </div>
            <div className="card-content">
              <h4>{formatCurrency(dashboardData.weekRevenue)}</h4>
              <p>This Week</p>
              <small>Last 7 days</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon month">
              <i className="icon la la-calendar"></i>
            </div>
            <div className="card-content">
              <h4>{formatCurrency(dashboardData.monthRevenue)}</h4>
              <p>This Month</p>
              <small>Current month</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon year">
              <i className="icon la la-calendar-alt"></i>
            </div>
            <div className="card-content">
              <h4>{formatCurrency(dashboardData.yearRevenue)}</h4>
              <p>This Year</p>
              <small>Current year</small>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown moved to RecentTransactions */}

      <div className="subscription-stats">
        <div className="stats-header">
          <h5>Active Subscriptions</h5>
        </div>
        
        <div className="stats-content">
          <div className="stat-item">
            <div className="stat-icon candidate">
              <i className="icon la la-user-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{formatNumber(dashboardData.activeUserSubscriptions)}</div>
              <div className="stat-label">Active Candidate Subscriptions</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon company">
              <i className="icon la la-building"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{formatNumber(dashboardData.activeCompanySubscriptions)}</div>
              <div className="stat-label">Active Company Subscriptions</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .revenue-chart { padding: 20px; }
        .chart-overview { margin-bottom: 30px; }
        .overview-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .overview-card { display: flex; align-items: center; gap: 14px; padding: 18px; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; transition: all .25s ease; }
        .overview-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }
        .card-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex: 0 0 auto; }
        .card-icon.today { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .card-icon.week { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .card-icon.month { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .card-icon.year { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .card-icon i { font-size: 20px; }
        .card-content h4 { margin: 0 0 4px; font-weight: 800; color: #0f172a; }
        .card-content p { margin: 0; color: #334155; font-weight: 600; }
        .card-content small { color: #64748b; }

        .subscription-stats { margin-top: 30px; }
        .stats-header h5 { margin: 40px 0 16px; color: #0f172a; font-weight: 700; }
        .stats-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 8px; }
        .stat-item { display: flex; align-items: center; gap: 14px; padding: 16px; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; transition: all .25s ease; }
        .stat-item:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }
        .stat-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
        .stat-icon.candidate { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .stat-icon.company { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .stat-number { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
        .stat-label { font-size: 12px; color: #64748b; }

        @media (max-width: 768px) {
          .overview-cards { grid-template-columns: 1fr; }
          .stats-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default RevenueChart; 