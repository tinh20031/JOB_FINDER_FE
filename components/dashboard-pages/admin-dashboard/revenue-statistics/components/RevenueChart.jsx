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
        
        // Use the refactored service method
        const response = await ApiService.getDashboardStatistics();
        
        
        // Directly use the data from the API response
        setDashboardData({
          todayRevenue: response.todayRevenue || 0,
          weekRevenue: response.weekRevenue || 0,
          monthRevenue: response.monthRevenue || 0,
          yearRevenue: response.yearRevenue || 0,
          totalRevenue: response.totalRevenue || 0,
          candidateRevenue: response.candidateRevenue || 0,
          companyRevenue: response.companyRevenue || 0,
          todayTransactions: response.todayTransactions || 0,
          totalTransactions: response.totalTransactions || 0,
          activeUserSubscriptions: response.activeUserSubscriptions || 0,
          activeCompanySubscriptions: response.activeCompanySubscriptions || 0,
          revenueBreakdown: {
            candidatePercentage: response.revenueBreakdown?.candidatePercentage || 0,
            companyPercentage: response.revenueBreakdown?.companyPercentage || 0
          }
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
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
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

      <div className="revenue-breakdown">
        <div className="breakdown-header">
          <h5>Revenue Breakdown</h5>
        </div>
        
        <div className="breakdown-content">
          <div className="breakdown-item candidate">
            <div className="breakdown-info">
              <div className="breakdown-label">
                <i className="icon la la-user"></i>
                Candidate Revenue
              </div>
              <div className="breakdown-amount">
                {formatCurrency(dashboardData.candidateRevenue)}
              </div>
            </div>
            <div className="breakdown-bar">
              <div 
                className="bar-fill candidate-fill"
                style={{ width: `${dashboardData.revenueBreakdown.candidatePercentage}%` }}
              ></div>
            </div>
            <div className="breakdown-percentage">
              {dashboardData.revenueBreakdown.candidatePercentage.toFixed(1)}%
            </div>
          </div>

          <div className="breakdown-item company">
            <div className="breakdown-info">
              <div className="breakdown-label">
                <i className="icon la la-building"></i>
                Company Revenue
              </div>
              <div className="breakdown-amount">
                {formatCurrency(dashboardData.companyRevenue)}
              </div>
            </div>
            <div className="breakdown-bar">
              <div 
                className="bar-fill company-fill"
                style={{ width: `${dashboardData.revenueBreakdown.companyPercentage}%` }}
              ></div>
            </div>
            <div className="breakdown-percentage">
              {dashboardData.revenueBreakdown.companyPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

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
        .revenue-chart {
          padding: 20px;
        }

        .chart-overview {
          margin-bottom: 30px;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .overview-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #007bff;
          transition: all 0.3s ease;
        }

        .overview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
        }

        .card-icon.today {
          background: linear-gradient(135deg, #28a745, #20c997);
        }

        .card-icon.week {
          background: linear-gradient(135deg, #007bff, #0056b3);
        }

        .card-icon.month {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
        }

        .card-icon.year {
          background: linear-gradient(135deg, #dc3545, #c82333);
        }

        .card-icon i {
          font-size: 20px;
        }

        .card-content h4 {
          margin: 0 0 5px 0;
          font-weight: 600;
          color: #333;
        }

        .card-content p {
          margin: 0 0 5px 0;
          color: #666;
          font-size: 14px;
        }

        .card-content small {
          color: #999;
          font-size: 12px;
        }

        .revenue-breakdown {
          margin-bottom: 30px;
        }

        .breakdown-header h5 {
          margin-bottom: 20px;
          color: #333;
          font-weight: 600;
        }

        .breakdown-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .breakdown-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .breakdown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #333;
        }

        .breakdown-amount {
          font-weight: 600;
          color: #28a745;
        }

        .breakdown-bar {
          width: 150px;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .candidate-fill {
          background: linear-gradient(90deg, #28a745, #20c997);
        }

        .company-fill {
          background: linear-gradient(90deg, #ffc107, #fd7e14);
        }

        .breakdown-percentage {
          min-width: 50px;
          text-align: right;
          font-weight: 600;
          color: #666;
        }

        .subscription-stats {
          margin-top: 30px;
        }

        .stats-header h5 {
          margin-bottom: 20px;
          color: #333;
          font-weight: 600;
        }

        .stats-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
        }

        .stat-icon.candidate {
          background: linear-gradient(135deg, #28a745, #20c997);
        }

        .stat-icon.company {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
        }

        .stat-number {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }

        @media (max-width: 768px) {
          .overview-cards {
            grid-template-columns: 1fr;
          }
          
          .stats-content {
            grid-template-columns: 1fr;
          }
          
          .breakdown-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .breakdown-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default RevenueChart; 