'use client'

import { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const PackageTypeBreakdown = ({ dateRange }) => {
  const [packageData, setPackageData] = useState({
    candidateRevenue: [],
    companyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    const fetchPackageBreakdown = async () => {
      try {
        setLoading(true);
        const toIsoDateTime = (value, isEnd = false) => {
          if (!value) return undefined;
          if (typeof value === 'string' && value.includes('T')) return value;
          return isEnd ? `${value}T23:59:59.999Z` : `${value}T00:00:00Z`;
        };

        const response = await ApiService.getRevenueByPackageType(
          toIsoDateTime(dateRange?.startDate, false),
          toIsoDateTime(dateRange?.endDate, true)
        );
        
        
        
        // Directly use the data from the API response
        const candidateRevenueData = response?.candidateRevenue || {};
        const companyRevenueData = response?.companyRevenue || {};
        
        const candidateRevenue = candidateRevenueData.packages || [];
        const companyRevenue = companyRevenueData.packages || [];
        
        
        
        setPackageData({ candidateRevenue, companyRevenue });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching package breakdown:', err);
        setError('Failed to load package breakdown data');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageBreakdown();
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

  const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

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

  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowTransactions(true);
  };

  const closeTransactions = () => {
    setShowTransactions(false);
    setSelectedPackage(null);
  };

  if (loading) {
    return (
      <div className="package-breakdown">
        <div className="row">
          {["Candidate Packages", "Company Packages"].map((title, colIdx) => (
            <div className="col-md-6" key={colIdx}>
              <div className="package-section">
                <h5 className={`section-title ${colIdx === 0 ? 'candidate-title' : 'company-title'}`}>
                  <i className={`icon la ${colIdx === 0 ? 'la-user' : 'la-building'}`}></i>
                  {title}
                </h5>
                <div className="package-list skeleton">
                  {[...Array(5)].map((_, i) => (
                    <div className={`package-item ${colIdx === 0 ? 'candidate' : 'company'}`} key={i}>
                      <div className="accent-bar" />
                      <div className="package-info" style={{ width: '100%' }}>
                        <div className="skeleton-line lg" />
                        <div className="skeleton-line sm" />
                      </div>
                      <div className="package-stats" style={{ minWidth: '140px' }}>
                        <div className="skeleton-line md" />
                        <div className="skeleton-line xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .skeleton .package-item { position: relative; overflow: hidden; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 14px; }
          .skeleton-line { height: 12px; background: #f1f5f9; border-radius: 8px; margin: 8px 0; position: relative; overflow: hidden; }
          .skeleton-line.lg { width: 60%; height: 16px; }
          .skeleton-line.md { width: 80%; }
          .skeleton-line.sm { width: 40%; height: 10px; }
          .skeleton-line.xs { width: 50%; height: 8px; }
          .skeleton-line::after, .package-item::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.4s infinite; }
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
    <div className="package-breakdown">
      <div className="row">
        <div className="col-md-6">
          <div className="package-section">
            <h5 className="section-title candidate-title">
              <i className="icon la la-user"></i>
              Candidate Packages
            </h5>
            {packageData.candidateRevenue.length > 0 ? (
              <div className="package-list">
                {packageData.candidateRevenue.map((pkg, index) => (
                  <div 
                    key={index} 
                    className="package-item clickable candidate"
                    onClick={() => handlePackageClick(pkg)}
                  >
                    <div className="accent-bar" />
                    <div className="package-info">
                      <div className="package-name">{pkg.packageName || pkg.PackageName}</div>
                      <div className="package-type">{pkg.packageType || pkg.PackageType}</div>
                    </div>
                    <div className="package-stats">
                      <div className="revenue">{formatCurrency(pkg.revenue || pkg.Revenue)}</div>
                      <div className="transactions">{formatNumber(pkg.paymentCount || pkg.PaymentCount)} payments</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No candidate package revenue in this period</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="package-section">
            <h5 className="section-title company-title">
              <i className="icon la la-building"></i>
              Company Packages
            </h5>
            {packageData.companyRevenue.length > 0 ? (
              <div className="package-list">
                {packageData.companyRevenue.map((pkg, index) => (
                  <div 
                    key={index} 
                    className="package-item clickable company"
                    onClick={() => handlePackageClick(pkg)}
                  >
                    <div className="accent-bar" />
                    <div className="package-info">
                      <div className="package-name">{pkg.packageName || pkg.PackageName}</div>
                      <div className="package-type">{pkg.packageType || pkg.PackageType}</div>
                    </div>
                    <div className="package-stats">
                      <div className="revenue">{formatCurrency(pkg.revenue || pkg.Revenue)}</div>
                      <div className="transactions">{formatNumber(pkg.paymentCount || pkg.PaymentCount)} payments</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No company package revenue in this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showTransactions && selectedPackage && (
        <div className="transaction-modal-overlay" onClick={closeTransactions}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>
                {selectedPackage.packageName || selectedPackage.PackageName} Package Transactions
              </h5>
              <button className="close-btn" onClick={closeTransactions}>
                <i className="icon la la-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="package-summary">
                <div className="summary-item">
                  <span className="label">Total Revenue:</span>
                  <span className="value">{formatCurrency(selectedPackage.revenue || selectedPackage.Revenue)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Transactions:</span>
                  <span className="value">{formatNumber(selectedPackage.paymentCount || selectedPackage.PaymentCount)}</span>
                </div>
              </div>
              
              <div className="transactions-list">
                <h6>Transaction Details:</h6>
                {(selectedPackage.transactions || selectedPackage.Transactions || []).map((transaction, index) => (
                  <div key={index} className="transaction-item">
                    <div className="transaction-header">
                      <div className="transaction-id">
                        <strong>#{transaction.transactionId || transaction.TransactionId}</strong>
                        <span className="order-code">({transaction.orderCode || transaction.OrderCode})</span>
                      </div>
                      <div className="transaction-amount">
                        {formatCurrency(transaction.amount || transaction.Amount)}
                      </div>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="user-info">
                        <div className="user-name">{transaction.userName || transaction.UserName}</div>
                        <div className="user-email">{transaction.userEmail || transaction.UserEmail}</div>
                      </div>
                      
                      <div className="transaction-meta">
                        <span className={`badge ${getPaymentTypeColor(transaction.paymentType || transaction.PaymentType)}`}>
                          {getPaymentTypeLabel(transaction.paymentType || transaction.PaymentType)}
                        </span>
                        <div className="transaction-date">
                          {formatDate(transaction.date || transaction.Date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      <style jsx>{`
        .package-breakdown {
          padding: 20px;
        }

        .package-section {
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
          font-weight: 600;
        }

        .candidate-title {
          color: #28a745;
        }

        .company-title {
          color: #ffc107;
        }

        .section-title i {
          font-size: 18px;
        }

        .package-list { max-height: 360px; overflow-y: auto; display: grid; gap: 10px; }

        .package-item { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; transition: transform .2s ease, box-shadow .2s ease; }
        .package-item .accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .package-item.candidate .accent-bar { background: #10b981; }
        .package-item.company .accent-bar { background: #f59e0b; }

        .package-item.clickable {
          cursor: pointer;
        }

        .package-item.clickable:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }

        .package-info {
          flex: 1;
        }

        .package-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .package-type {
          font-size: 12px;
          color: #666;
          text-transform: capitalize;
        }

        .package-stats { text-align: right; min-width: 160px; }

        .revenue { font-weight: 800; color: #0f172a; font-size: 14px; }

        .transactions { font-size: 12px; color: #64748b; }

        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        /* Modal Styles */
        .transaction-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .transaction-modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .modal-header h5 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 5px;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .package-summary {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .summary-item .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .summary-item .value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .transactions-list h6 {
          margin-bottom: 15px;
          color: #333;
          font-weight: 600;
        }

        .transaction-item { position: relative; padding: 15px; margin-bottom: 12px; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; }
        .transaction-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #3b82f6; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }

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

        .order-code {
          font-size: 12px;
          color: #666;
          font-weight: normal;
        }

        .transaction-amount {
          font-weight: 600;
          color: #28a745;
          font-size: 16px;
        }

        .transaction-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .user-email {
          font-size: 12px;
          color: #666;
        }

        .transaction-meta {
          text-align: right;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .badge-success {
          background-color: #d4edda;
          color: #155724;
        }

        .badge-warning {
          background-color: #fff3cd;
          color: #856404;
        }

        .badge-info {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .transaction-date {
          font-size: 11px;
          color: #666;
        }

        .package-list::-webkit-scrollbar {
          width: 6px;
        }

        .package-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .package-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .package-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default PackageTypeBreakdown; 