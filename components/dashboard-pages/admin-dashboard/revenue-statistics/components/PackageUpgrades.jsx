'use client';

import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';

const PackageUpgrades = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('combined');

  useEffect(() => {
    const toIsoDateTime = (value, isEnd = false) => {
      if (!value) return undefined;
      // If value already contains time, return as is
      if (typeof value === 'string' && value.includes('T')) return value;
      // Normalize plain date (YYYY-MM-DD) to full ISO with timezone
      return isEnd
        ? `${value}T23:59:59.999Z`
        : `${value}T00:00:00Z`;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getPackageUpgrades(
          toIsoDateTime(dateRange.startDate, false),
          toIsoDateTime(dateRange.endDate, true)
        );
        setData(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching package upgrades data:', err);
        setError('Failed to load package upgrade statistics');
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const formatNumber = (num) => {
    if (num === null || num === undefined || Number.isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="package-upgrades-statistics">
        <div className="tabs-wrapper">
          <div className="skeleton tabs-bar" />
        </div>
        <div className="row">
          {[0,1].map((col) => (
            <div className="col-md-6 mb-4" key={col}>
              <div className="skeleton-card">
                <div className="skeleton-header">
                  <div className="sk-line lg" />
                  <div className="sk-pill" />
                </div>
                <div className="sk-grid">
                  {[...Array(6)].map((_, i) => (
                    <div className="sk-item" key={i}>
                      <div className="sk-icon" />
                      <div className="sk-content">
                        <div className="sk-line md" />
                        <div className="sk-line sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .skeleton.tabs-bar { height: 44px; border-radius: 12px; background: #f1f5f9; }
          .skeleton-card { background: #fff; border: 1px solid #eef2f7; border-radius: 16px; overflow: hidden; }
          .skeleton-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid #eef2f7; }
          .sk-line { height: 12px; background: #f1f5f9; border-radius: 8px; position: relative; overflow: hidden; }
          .sk-line.lg { width: 40%; height: 18px; }
          .sk-line.md { width: 50%; }
          .sk-line.sm { width: 30%; height: 10px; }
          .sk-pill { width: 90px; height: 24px; background: #eef2ff; border-radius: 999px; position: relative; overflow: hidden; }
          .sk-grid { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 20px; }
          .sk-item { display: flex; align-items: center; gap: 12px; }
          .sk-icon { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; }
          .sk-line::after, .sk-pill::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.4s infinite; }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert" style={{
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.1)'
      }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-info" role="alert" style={{
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(6, 182, 212, 0.1)'
      }}>
        No package upgrade data available for the selected date range.
      </div>
    );
  }

  const tabStyle = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '8px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      flexWrap: 'wrap',
    },
    button: {
      flex: '1',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      margin: '0 4px',
      fontWeight: '600',
      backgroundColor: 'transparent',
      color: '#64748b',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeButton: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      boxShadow: '0 2px 5px rgba(37, 99, 235, 0.15)',
    },
    icon: {
      marginRight: '8px',
      fontSize: '1.1rem',
    },
    content: {
      opacity: 1,
      transition: 'all 0.3s ease',
    }
  };

  const cardStyle = {
    container: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      height: '100%',
      transition: 'all 0.2s ease',
    },
    header: {
      padding: '18px 24px',
      borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#334155',
      margin: '0',
    },
    badge: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '20px',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      borderRadius: '12px',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease',
    },
    iconBox: {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      marginRight: '12px',
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    statLabel: {
      fontSize: '0.85rem',
      color: '#64748b',
      marginBottom: '4px',
    },
    statValue: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#334155',
    },
    kpiContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '24px',
    },
    kpiItem: {
      textAlign: 'center',
    },
    progressContainer: {
      position: 'relative',
      width: '100px',
      height: '100px',
    },
    progressBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: '6px solid #f1f5f9',
      borderRadius: '50%',
    },
    progressValue: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#334155',
    },
    kpiLabel: {
      display: 'block',
      marginTop: '8px',
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: '500',
    },
    tableContainer: {
      padding: '0 24px 24px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHead: {
      textAlign: 'left',
      padding: '10px',
      fontSize: '0.85rem',
      color: '#64748b',
      fontWeight: '600',
      borderBottom: '1px solid #e2e8f0',
    },
    tableCell: {
      padding: '10px',
      fontSize: '0.9rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
    },
    percentageBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    bar: {
      height: '8px',
      background: 'linear-gradient(90deg, #3b82f6, #93c5fd)',
      borderRadius: '4px',
    }
  };

  // Color helper functions
  const getIconBgColor = (type) => {
    const colors = {
      primary: 'rgba(59, 130, 246, 0.1)',
      success: 'rgba(34, 197, 94, 0.1)',
      info: 'rgba(6, 182, 212, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      danger: 'rgba(239, 68, 68, 0.1)',
    };
    return colors[type] || colors.primary;
  };

  const getIconColor = (type) => {
    const colors = {
      primary: '#3b82f6',
      success: '#22c55e',
      info: '#06b6d4',
      warning: '#f59e0b',
      danger: '#ef4444',
    };
    return colors[type] || colors.primary;
  };

  // Progress circle component
  const ProgressCircle = ({ value, color }) => {
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const colors = {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
    };

    const circleColor = colors[color] || colors.primary;

    return (
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={circleColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          fontWeight: 'bold',
          fontSize: '1.25rem',
        }}>
          {value}%
        </div>
      </div>
    );
  };

  // Stat item component
  const StatItem = ({ icon, label, value, type }) => {
    const displayValue = typeof value === 'number' ? formatNumber(value) : value;
    return (
      <div style={cardStyle.statItem} className="fade-up">
        <div style={{
          ...cardStyle.iconBox,
          backgroundColor: getIconBgColor(type)
        }}>
          <i className={icon} style={{ color: getIconColor(type) }}></i>
        </div>
        <div style={cardStyle.statContent}>
          <span style={cardStyle.statLabel}>{label}</span>
          <span style={cardStyle.statValue}>{displayValue}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="package-upgrades-statistics">
      <div className="tabs-wrapper">
        <div style={tabStyle.container}>
          <button 
            style={{
              ...tabStyle.button,
              ...(activeTab === 'combined' ? tabStyle.activeButton : {})
            }}
            onClick={() => setActiveTab('combined')}
          >
            <span style={tabStyle.icon}>📊</span>
            Combined Statistics
          </button>
          <button 
            style={{
              ...tabStyle.button,
              ...(activeTab === 'candidate' ? tabStyle.activeButton : {})
            }}
            onClick={() => setActiveTab('candidate')}
          >
            <span style={tabStyle.icon}>👤</span>
            Candidate Statistics
          </button>
          <button 
            style={{
              ...tabStyle.button,
              ...(activeTab === 'company' ? tabStyle.activeButton : {})
            }}
            onClick={() => setActiveTab('company')}
          >
            <span style={tabStyle.icon}>🏢</span>
            Company Statistics
          </button>
        </div>
        
        <div style={tabStyle.content}>
          {activeTab === 'combined' && (
            <div className="row">
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.05s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Overall Package Statistics</h5>
                    <div style={cardStyle.badge}>Combined</div>
                  </div>
                  <div style={cardStyle.statGrid}>
                    <StatItem 
                      icon="fas fa-shopping-cart" 
                      label="Total Payments" 
                      value={data.combinedStatistics.totalPackagePayments}
                      type="primary"
                    />
                    <StatItem 
                      icon="fas fa-arrow-up" 
                      label="Total Upgrades" 
                      value={data.combinedStatistics.totalUpgrades}
                      type="success"
                    />
                    <StatItem 
                      icon="fas fa-sync" 
                      label="Same Package Renewals" 
                      value={data.combinedStatistics.totalSamePackageRenewals}
                      type="info"
                    />
                    <StatItem 
                      icon="fas fa-layer-group" 
                      label="Basic Packages" 
                      value={data.combinedStatistics.totalBasicPackagePayments}
                      type="warning"
                    />
                    <StatItem 
                      icon="fas fa-crown" 
                      label="Premium Packages" 
                      value={data.combinedStatistics.totalPremiumPackagePayments}
                      type="danger"
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.1s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Key Performance Indicators</h5>
                    <div style={cardStyle.badge}>Metrics</div>
                  </div>
                  <div style={cardStyle.kpiContainer}>
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.combinedStatistics.overallUpgradeRate} 
                        color="primary" 
                      />
                      <span style={cardStyle.kpiLabel}>Upgrade Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.combinedStatistics.overallRenewalRate} 
                        color="success" 
                      />
                      <span style={cardStyle.kpiLabel}>Renewal Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.combinedStatistics.overallReturnRate} 
                        color="warning" 
                      />
                      <span style={cardStyle.kpiLabel}>Return Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'candidate' && (
            <div className="row">
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.05s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Candidate Package Statistics</h5>
                    <div style={cardStyle.badge}>Candidate</div>
                  </div>
                  <div style={cardStyle.statGrid}>
                    <StatItem 
                      icon="fas fa-shopping-cart" 
                      label="Total Payments" 
                      value={data.candidateStatistics.totalPackagePayments}
                      type="primary"
                    />
                    <StatItem 
                      icon="fas fa-layer-group" 
                      label="Basic Packages" 
                      value={data.candidateStatistics.basicPackagePayments}
                      type="warning"
                    />
                    <StatItem 
                      icon="fas fa-crown" 
                      label="Premium Packages" 
                      value={data.candidateStatistics.premiumPackagePayments}
                      type="danger"
                    />
                    <StatItem 
                      icon="fas fa-arrow-up" 
                      label="Basic to Premium" 
                      value={data.candidateStatistics.basicToPremiumUpgrades}
                      type="success"
                    />
                    <StatItem 
                      icon="fas fa-sync" 
                      label="Basic Renewals" 
                      value={data.candidateStatistics.basicToBasicRenewals}
                      type="info"
                    />
                    <StatItem 
                      icon="fas fa-sync" 
                      label="Premium Renewals" 
                      value={data.candidateStatistics.premiumToPremiumRenewals}
                      type="info"
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.1s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Candidate User Behavior</h5>
                    <div style={cardStyle.badge}>Analytics</div>
                  </div>
                  <div style={cardStyle.kpiContainer}>
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.candidateStatistics.upgradeRate} 
                        color="primary" 
                      />
                      <span style={cardStyle.kpiLabel}>Upgrade Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.candidateStatistics.renewalRate} 
                        color="success" 
                      />
                      <span style={cardStyle.kpiLabel}>Renewal Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.candidateStatistics.returnRate} 
                        color="warning" 
                      />
                      <span style={cardStyle.kpiLabel}>Return Rate</span>
                    </div>
                  </div>
                  
                  <div className="row px-3 mb-3">
                    <div className="col-md-6 mb-3">
                      <StatItem 
                        icon="fas fa-user-plus" 
                        label="New Users" 
                        value={data.candidateStatistics.newUsers}
                        type="primary"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <StatItem 
                        icon="fas fa-user-check" 
                        label="Returning Users" 
                        value={data.candidateStatistics.returningUsers}
                        type="success"
                      />
                    </div>
                  </div>
                  
                  <div style={{ padding: '0 24px' }}>
                    <h6 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '12px'
                    }}>
                      Package Distribution
                    </h6>
                    <div style={cardStyle.tableContainer}>
                      <table style={cardStyle.table}>
                        <thead>
                          <tr>
                            <th style={cardStyle.tableHead}>Package</th>
                            <th style={cardStyle.tableHead}>Count</th>
                            <th style={cardStyle.tableHead}>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.candidateStatistics.packageDistribution.map((pkg, index) => (
                            <tr key={index}>
                              <td style={cardStyle.tableCell}>{pkg.packageName}</td>
                              <td style={cardStyle.tableCell}>{pkg.count}</td>
                              <td style={cardStyle.tableCell}>
                                <div style={cardStyle.percentageBar}>
                                  <div 
                                    style={{
                                      ...cardStyle.bar,
                                      width: data.candidateStatistics.totalPackagePayments > 0 
                                        ? `${(pkg.count / data.candidateStatistics.totalPackagePayments) * 100}%` 
                                        : '0%',
                                      minWidth: '5px',
                                      maxWidth: '100px'
                                    }}
                                  ></div>
                                  <span>
                                    {data.candidateStatistics.totalPackagePayments > 0 
                                      ? ((pkg.count / data.candidateStatistics.totalPackagePayments) * 100).toFixed(1) + '%' 
                                      : '0%'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'company' && (
            <div className="row">
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.05s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Company Package Statistics</h5>
                    <div style={cardStyle.badge}>Company</div>
                  </div>
                  <div style={cardStyle.statGrid}>
                    <StatItem 
                      icon="fas fa-shopping-cart" 
                      label="Total Payments" 
                      value={data.companyStatistics.totalPackagePayments}
                      type="primary"
                    />
                    <StatItem 
                      icon="fas fa-layer-group" 
                      label="Basic Packages" 
                      value={data.companyStatistics.basicPackagePayments}
                      type="warning"
                    />
                    <StatItem 
                      icon="fas fa-crown" 
                      label="Premium Packages" 
                      value={data.companyStatistics.premiumPackagePayments}
                      type="danger"
                    />
                    <StatItem 
                      icon="fas fa-arrow-up" 
                      label="Basic to Premium" 
                      value={data.companyStatistics.basicToPremiumUpgrades}
                      type="success"
                    />
                    <StatItem 
                      icon="fas fa-sync" 
                      label="Basic Renewals" 
                      value={data.companyStatistics.basicToBasicRenewals}
                      type="info"
                    />
                    <StatItem 
                      icon="fas fa-sync" 
                      label="Premium Renewals" 
                      value={data.companyStatistics.premiumToPremiumRenewals}
                      type="info"
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4 fade-up" style={{ animationDelay: '0.1s' }}>
                <div style={cardStyle.container} className="hover-card">
                  <div style={cardStyle.header}>
                    <h5 style={cardStyle.title}>Company User Behavior</h5>
                    <div style={cardStyle.badge}>Analytics</div>
                  </div>
                  <div style={cardStyle.kpiContainer}>
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.companyStatistics.upgradeRate} 
                        color="primary" 
                      />
                      <span style={cardStyle.kpiLabel}>Upgrade Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.companyStatistics.renewalRate} 
                        color="success" 
                      />
                      <span style={cardStyle.kpiLabel}>Renewal Rate</span>
                    </div>
                    
                    <div style={cardStyle.kpiItem}>
                      <ProgressCircle 
                        value={data.companyStatistics.returnRate} 
                        color="warning" 
                      />
                      <span style={cardStyle.kpiLabel}>Return Rate</span>
                    </div>
                  </div>
                  
                  <div className="row px-3 mb-3">
                    <div className="col-md-6 mb-3">
                      <StatItem 
                        icon="fas fa-user-plus" 
                        label="New Users" 
                        value={data.companyStatistics.newUsers}
                        type="primary"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <StatItem 
                        icon="fas fa-user-check" 
                        label="Returning Users" 
                        value={data.companyStatistics.returningUsers}
                        type="success"
                      />
                    </div>
                  </div>
                  
                  <div style={{ padding: '0 24px' }}>
                    <h6 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '12px'
                    }}>
                      Package Distribution
                    </h6>
                    <div style={cardStyle.tableContainer}>
                      <table style={cardStyle.table}>
                        <thead>
                          <tr>
                            <th style={cardStyle.tableHead}>Package</th>
                            <th style={cardStyle.tableHead}>Count</th>
                            <th style={cardStyle.tableHead}>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.companyStatistics.packageDistribution.map((pkg, index) => (
                            <tr key={index}>
                              <td style={cardStyle.tableCell}>{pkg.packageName}</td>
                              <td style={cardStyle.tableCell}>{pkg.count}</td>
                              <td style={cardStyle.tableCell}>
                                <div style={cardStyle.percentageBar}>
                                  <div 
                                    style={{
                                      ...cardStyle.bar,
                                      width: data.companyStatistics.totalPackagePayments > 0 
                                        ? `${(pkg.count / data.companyStatistics.totalPackagePayments) * 100}%` 
                                        : '0%',
                                      minWidth: '5px',
                                      maxWidth: '100px'
                                    }}
                                  ></div>
                                  <span>
                                    {data.companyStatistics.totalPackagePayments > 0 
                                      ? ((pkg.count / data.companyStatistics.totalPackagePayments) * 100).toFixed(1) + '%' 
                                      : '0%'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .hover-card { transition: transform .2s ease, box-shadow .2s ease; }
        .hover-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); }
        .fade-up { animation: fadeUp .45s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PackageUpgrades;