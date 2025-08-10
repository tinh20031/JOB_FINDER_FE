'use client'

import { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const RecentTransactions = ({ dateRange }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdown, setBreakdown] = useState({
    candidateRevenue: 0,
    companyRevenue: 0,
    revenueBreakdown: { candidatePercentage: 0, companyPercentage: 0 },
  });

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        const toIsoDateTime = (value, isEnd = false) => {
          if (!value) return undefined;
          if (typeof value === 'string' && value.includes('T')) return value;
          return isEnd ? `${value}T23:59:59.999Z` : `${value}T00:00:00Z`;
        };

        const params = {
          count: 10,
          startDate: toIsoDateTime(dateRange?.startDate, false),
          endDate: toIsoDateTime(dateRange?.endDate, true),
        };

        const [txResponse, statsResponse] = await Promise.all([
          ApiService.request(
            'RevenueStatistics/recent-transactions',
            'GET',
            null,
            params
          ),
          ApiService.getDashboardStatistics(
            toIsoDateTime(dateRange?.startDate, false),
            toIsoDateTime(dateRange?.endDate, true)
          ),
        ]);

        const items = (txResponse && (txResponse.transactions || txResponse.Transactions)) || [];
        setTransactions(items);

        // Normalize stats response similar to RevenueChart
        const data = statsResponse || {};
        const getNum = (v) => (typeof v === 'number' ? v : Number(v)) || 0;

        let candidateRevenue = getNum(
          data.candidateRevenue ?? data.CandidateRevenue ?? data.revenue?.candidate ?? data.revenueBreakdown?.candidateRevenue
        );
        let companyRevenue = getNum(
          data.companyRevenue ?? data.CompanyRevenue ?? data.revenue?.company ?? data.revenueBreakdown?.companyRevenue
        );

        // Fallback: derive from transactions list if stats not provided
        if ((candidateRevenue === 0 && companyRevenue === 0) && Array.isArray(items) && items.length > 0) {
          const sums = items.reduce(
            (acc, t) => {
              const amt = getNum(t.amount || t.Amount);
              const type = t.paymentType || t.PaymentType;
              if (type === 'CandidateSubscription') acc.candidate += amt;
              else if (type === 'CompanySubscription') acc.company += amt;
              return acc;
            },
            { candidate: 0, company: 0 }
          );
          candidateRevenue = sums.candidate;
          companyRevenue = sums.company;
        }

        let candidatePercentage = getNum(
          data.revenueBreakdown?.candidatePercentage ?? data.RevenueBreakdown?.CandidatePercentage ?? data.candidatePercentage ?? data.share?.candidate
        );
        let companyPercentage = getNum(
          data.revenueBreakdown?.companyPercentage ?? data.RevenueBreakdown?.CompanyPercentage ?? data.companyPercentage ?? data.share?.company
        );

        // If backend returns 0..1, convert to %
        if (candidatePercentage > 0 && candidatePercentage <= 1) candidatePercentage *= 100;
        if (companyPercentage > 0 && companyPercentage <= 1) companyPercentage *= 100;

        // If stats percentages not available, compute from totals
        const totalRev = candidateRevenue + companyRevenue;
        if (totalRev > 0 && (candidatePercentage === 0 && companyPercentage === 0)) {
          candidatePercentage = (candidateRevenue / totalRev) * 100;
          companyPercentage = (companyRevenue / totalRev) * 100;
        }

        setBreakdown({
          candidateRevenue,
          companyRevenue,
          revenueBreakdown: {
            candidatePercentage,
            companyPercentage,
          },
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError('Failed to load recent transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeColor = (paymentType) => {
    switch (paymentType) {
      case 'CandidateSubscription':
        return 'badge-success';
      case 'CompanySubscription':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getPaymentTypeLabel = (paymentType) => {
    switch (paymentType) {
      case 'CandidateSubscription':
        return 'Candidate';
      case 'CompanySubscription':
        return 'Company';
      default:
        return paymentType;
    }
  };

  const getAccentClass = (paymentType) => {
    switch (paymentType) {
      case 'CandidateSubscription':
        return 'accent-green';
      case 'CompanySubscription':
        return 'accent-amber';
      default:
        return 'accent-blue';
    }
  };

  if (loading) {
    return (
      <div className="recent-transactions">
        <div className="skeleton-list">
          {[...Array(5)].map((_, i) => (
            <div className="skeleton-item" key={i}>
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-meta">
                <div className="skeleton-pill" />
                <div className="skeleton-line tiny" />
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .recent-transactions { padding: 20px; }
          .skeleton-list { display: grid; gap: 12px; }
          .skeleton-item { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 14px; position: relative; overflow: hidden; }
          .skeleton-line { height: 12px; background: #f1f5f9; border-radius: 8px; margin: 8px 0; position: relative; overflow: hidden; }
          .skeleton-line.short { width: 40%; }
          .skeleton-line.tiny { width: 30%; height: 10px; }
          .skeleton-pill { width: 90px; height: 20px; background: #eef2ff; border-radius: 999px; }
          .skeleton-item::after, .skeleton-line::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.4s infinite; }
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
    <div className="recent-transactions">
      <div className="breakdown-widget">
        <div className="breakdown-header"><h5>Revenue Breakdown</h5></div>
        <div className="breakdown-content">
          <div className="breakdown-item candidate">
            <div className="breakdown-info">
              <div className="breakdown-label"><i className="icon la la-user"></i>Candidate Revenue</div>
              <div className="breakdown-amount">{formatCurrency(breakdown.candidateRevenue)}</div>
            </div>
            <div className="breakdown-bar">
              <div className="bar-fill candidate-fill" style={{ width: `${breakdown.revenueBreakdown.candidatePercentage}%` }} />
            </div>
            <div className="breakdown-percentage">{breakdown.revenueBreakdown.candidatePercentage.toFixed(1)}%</div>
          </div>
          <div className="breakdown-item company">
            <div className="breakdown-info">
              <div className="breakdown-label"><i className="icon la la-building"></i>Company Revenue</div>
              <div className="breakdown-amount">{formatCurrency(breakdown.companyRevenue)}</div>
            </div>
            <div className="breakdown-bar">
              <div className="bar-fill company-fill" style={{ width: `${breakdown.revenueBreakdown.companyPercentage}%` }} />
            </div>
            <div className="breakdown-percentage">{breakdown.revenueBreakdown.companyPercentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>
      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((t) => {
            const id = t.transactionId || t.TransactionId;
            const order = t.orderCode || t.OrderCode;
            const amount = t.amount || t.Amount;
            const userName = t.userName || t.UserName;
            const userEmail = t.userEmail || t.UserEmail;
            const paymentType = t.paymentType || t.PaymentType;
            const dateStr = t.createdAt || t.completedAt || t.date || t.Date;
            const provider = t.paymentProvider || t.PaymentProvider;
            return (
              <div key={id} className={`transaction-item ${getAccentClass(paymentType)}`}>
                
                <div className="accent-bar" />
                <div className="transaction-header">
                  <div className="transaction-id">
                    <strong>#{id}</strong>
                    <span className="order-code">{order}</span>
                  </div>
                  <div className="transaction-amount">
                    {formatCurrency(amount)}
                  </div>
                </div>
                <div className="transaction-details">
                  <div className="user-info">
                    <div className="user-name">{userName}</div>
                    <div className="user-email">{userEmail}</div>
                  </div>
                  <div className="transaction-meta">
                    <span className={`badge ${getPaymentTypeColor(paymentType)}`}>
                      {getPaymentTypeLabel(paymentType)}
                    </span>
                    {provider ? <span className="provider-pill">{provider}</span> : null}
                    <div className="transaction-date">{formatDate(dateStr)}</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-transactions">
            <i className="icon la la-inbox"></i>
            <p>No recent transactions found</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .recent-transactions { padding: 16px; display: grid; gap: 12px; }

        .breakdown-widget { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; }
        .breakdown-header h5 { margin: 0 0 8px; font-weight: 700; color: #0f172a; }
        .breakdown-content { display: flex; flex-direction: column; gap: 12px; }
        .breakdown-item { display: flex; align-items: center; gap: 12px; }
        .breakdown-info { flex: 1; display: flex; align-items: center; justify-content: space-between; }
        .breakdown-label { display: flex; align-items: center; gap: 8px; color: #111827; font-weight: 600; }
        .breakdown-amount { font-weight: 800; color: #0f172a; }
        .breakdown-bar { width: 160px; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; transition: width .3s ease; }
        .candidate-fill { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .company-fill { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .breakdown-percentage { min-width: 56px; text-align: right; color: #64748b; font-weight: 700; }

        .transactions-list { max-height: 317px; overflow-y: auto; display: grid; gap: 12px; }

        .transaction-item { position: relative; background: #ffffff; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; transition: transform .2s ease, box-shadow .2s ease; }
        .transaction-item:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }
        .accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .accent-green .accent-bar { background: #10b981; }
        .accent-amber .accent-bar { background: #f59e0b; }
        .accent-blue .accent-bar { background: #3b82f6; }

        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .transaction-id {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .order-code { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }

        .transaction-amount { font-weight: 800; color: #0f172a; font-size: 16px; }

        .transaction-details { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; }

        .user-info {
          flex: 1;
        }

        .user-name { font-weight: 700; color: #111827; margin-bottom: 2px; }

        .user-email { font-size: 12px; color: #6b7280; }

        .transaction-meta { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .provider-pill { background: #eef2ff; color: #3730a3; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }

        .badge { display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: 700; border-radius: 999px; }
        .badge-success { background-color: #dcfce7; color: #166534; }
        .badge-warning { background-color: #fef9c3; color: #854d0e; }
        .badge-info { background-color: #e0f2fe; color: #075985; }

        .transaction-date { font-size: 11px; color: #64748b; }

        .no-transactions { text-align: center; padding: 40px 20px; color: #64748b; }
        .no-transactions i { font-size: 48px; margin-bottom: 15px; opacity: 0.5; }
        .no-transactions p { margin: 0; font-style: italic; }
      `}</style>
    </div>
  );
};

export default RecentTransactions; 