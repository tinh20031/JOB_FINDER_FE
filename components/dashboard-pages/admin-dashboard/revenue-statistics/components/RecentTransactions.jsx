'use client'

import { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        const response = await ApiService.request(
          'RevenueStatistics/recent-transactions',
          'GET',
          null,
          { count: 10 }
        );
        setTransactions(response || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent transactions:', err);
        setError('Failed to load recent transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
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
      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
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
          ))
        ) : (
          <div className="no-transactions">
            <i className="icon la la-inbox"></i>
            <p>No recent transactions found</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .recent-transactions {
          padding: 20px;
        }

        .transactions-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .transaction-item {
          padding: 15px;
          margin-bottom: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          background: #e9ecef;
          transform: translateX(2px);
        }

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

        .no-transactions {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .no-transactions i {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .no-transactions p {
          margin: 0;
          font-style: italic;
        }

        .transactions-list::-webkit-scrollbar {
          width: 6px;
        }

        .transactions-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .transactions-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .transactions-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default RecentTransactions; 