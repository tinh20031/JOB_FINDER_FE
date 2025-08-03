'use client'

import { useState } from 'react';
import ApiService from '@/services/api.service';

const ExportData = ({ dateRange }) => {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState('summary');
  const [fileFormat, setFileFormat] = useState('excel');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [detailLevel, setDetailLevel] = useState('standard');


  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await ApiService.exportRevenueData(
        dateRange.startDate,
        dateRange.endDate,
        detailLevel === 'detailed'
      );

      // Create content based on selected format
      let content = '';
      let mimeType = '';
      let fileExtension = '';
      
      if (fileFormat === 'json') {
        content = createJSONContent(response);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
      } else if (fileFormat === 'excel') {
        content = createExcelContent(response);
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      }

      // Download the file
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Format date for filename
      const formattedStartDate = dateRange.startDate.split('T')[0];
      const formattedEndDate = dateRange.endDate.split('T')[0];
      
      // Create Vietnamese filename with date
      const today = new Date();
      const formattedToday = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const fileName = fileFormat === 'excel' 
        ? `bao_cao_doanh_thu_${exportType}_${formattedToday}.${fileExtension}`
        : `revenue_export_${exportType}_${formattedStartDate}_to_${formattedEndDate}.${fileExtension}`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Xuất dữ liệu thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const createCSVContent = (data) => {
    let csvContent = '';
    
    if (includeHeaders) {
      const currentDate = new Date().toLocaleString('en-US');
      csvContent += `REVENUE REPORT\n`;
      csvContent += `Export Date: ${currentDate}\n`;
      csvContent += `Date Range: ${formatDate(data.summary?.startDate)} to ${formatDate(data.summary?.endDate)}\n`;
      csvContent += `Report Type: ${getExportTypeDisplayName()}\n`;
      csvContent += `Detail Level: ${detailLevel === 'detailed' ? 'Detailed' : 'Standard'}\n\n`;
    }
    
    if (exportType === 'summary' || exportType === 'full') {
      csvContent += createSummaryCSV(data.summary);
    }
    
    if (exportType === 'transactions' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createTransactionsCSV(data.transactions);
    }
    
    if (exportType === 'packages' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createPackageStatisticsCSV(data.packageStatistics);
    }
    
    if (exportType === 'monthly' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createMonthlyRevenueCSV(data.monthlyRevenue);
    }
    
    if (exportType === 'daily' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createDailyRevenueCSV(data.dailyRevenue);
    }
    
    if (exportType === 'users' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createUserRevenueCSV(data.userRevenue);
    }
    
    if (exportType === 'upgrades' || exportType === 'full') {
      if (exportType === 'full') csvContent += '\n\n';
      csvContent += createUpgradeStatisticsCSV(data.upgradeStatistics);
    }
    
    return csvContent;
  };

  const createJSONContent = (data) => {
    const exportData = {
      metadata: includeHeaders ? {
        generated: new Date().toISOString(),
        dateRange: {
          startDate: data.summary?.startDate,
          endDate: data.summary?.endDate
        },
        exportType,
        detailLevel
      } : undefined
    };
    
    if (exportType === 'summary' || exportType === 'full') {
      exportData.summary = data.summary;
    }
    
    if (exportType === 'transactions' || exportType === 'full') {
      exportData.transactions = data.transactions;
    }
    
    if (exportType === 'packages' || exportType === 'full') {
      exportData.packageStatistics = data.packageStatistics;
    }
    
    if (exportType === 'monthly' || exportType === 'full') {
      exportData.monthlyRevenue = data.monthlyRevenue;
    }
    
    if (exportType === 'daily' || exportType === 'full') {
      exportData.dailyRevenue = data.dailyRevenue;
    }
    
    if (exportType === 'users' || exportType === 'full') {
      exportData.userRevenue = data.userRevenue;
    }
    
    if (exportType === 'upgrades' || exportType === 'full') {
      exportData.upgradeStatistics = data.upgradeStatistics;
    }
    
    return JSON.stringify(exportData, null, 2);
  };

  const createExcelContent = (data) => {
    const createExcelCSVContent = (data) => {
      const isExcelFormat = true;
      
      let csvContent = '';
      
      if (includeHeaders) {
        const today = new Date();
        const currentDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        csvContent += `REVENUE REPORT\n`;
        csvContent += `Export Date: ${currentDate}\n`;
        csvContent += `Date Range: ${formatDate(data.summary?.startDate, isExcelFormat)} to ${formatDate(data.summary?.endDate, isExcelFormat)}\n`;
        csvContent += `Report Type: ${getExportTypeDisplayName()}\n`;
        csvContent += `Detail Level: ${detailLevel === 'detailed' ? 'Detailed' : 'Standard'}\n\n`;
      }
      
      if (exportType === 'summary' || exportType === 'full') {
        csvContent += createSummaryCSV(data.summary, isExcelFormat);
      }
      
      if (exportType === 'transactions' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createTransactionsCSV(data.transactions, isExcelFormat);
      }
      
      if (exportType === 'packages' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createPackageStatisticsCSV(data.packageStatistics, isExcelFormat);
      }
      
      if (exportType === 'monthly' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createMonthlyRevenueCSV(data.monthlyRevenue, isExcelFormat);
      }
      
      if (exportType === 'daily' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createDailyRevenueCSV(data.dailyRevenue, isExcelFormat);
      }
      
      if (exportType === 'users' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createUserRevenueCSV(data.userRevenue, isExcelFormat);
      }
      
      if (exportType === 'upgrades' || exportType === 'full') {
        if (exportType === 'full') csvContent += '\n\n';
        csvContent += createUpgradeStatisticsCSV(data.upgradeStatistics, isExcelFormat);
      }
      
      return csvContent;
    };
    
    const csvContent = createExcelCSVContent(data);
    const excelContent = csvContent.replace(/,/g, ';');
    return '\ufeff' + excelContent;
  };

  const formatDate = (dateString, isExcelFormat = false) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      
      if (isExcelFormat || fileFormat === 'excel') {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      if (isExcelFormat && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }
      return dateString;
    }
  };

  const getExportTypeDisplayName = () => {
    const types = {
      'summary': 'Revenue Summary',
      'transactions': 'Transaction Details',
      'packages': 'Package Statistics',
      'monthly': 'Monthly Revenue',
      'daily': 'Daily Revenue',
      'users': 'User Revenue',
      'upgrades': 'Package Upgrade Statistics',
      'full': 'Full Report'
    };
    return types[exportType] || exportType;
  };

  const createSummaryCSV = (summary, isExcelFormat = false) => {
    if (!summary) return 'No summary data available';
    
    const headers = [
      'Metric',
      'Value',
      'Start Date',
      'End Date'
    ];

    const rows = [
      ['Total Revenue', formatCurrency(summary.totalRevenue, isExcelFormat), formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Candidate Revenue', formatCurrency(summary.candidateRevenue, isExcelFormat), formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Company Revenue', formatCurrency(summary.companyRevenue, isExcelFormat), formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Total Transactions', summary.totalTransactions, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Candidate Transactions', summary.candidateTransactions, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Company Transactions', summary.companyTransactions, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Unique Users', summary.uniqueUsers, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Unique Candidates', summary.uniqueCandidates, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Unique Companies', summary.uniqueCompanies, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Average Transaction Value', formatCurrency(summary.averageTransactionValue, isExcelFormat), formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Median Transaction Value', formatCurrency(summary.medianTransactionValue, isExcelFormat), formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)],
      ['Most Popular Payment Method', `${summary.topPaymentProvider?.provider} (${summary.topPaymentProvider?.count} transactions)`, formatDate(summary.startDate, isExcelFormat), formatDate(summary.endDate, isExcelFormat)]
    ];

    return `REVENUE SUMMARY\n${[headers, ...rows].map(row => row.join(',')).join('\n')}`;
  };

  const createTransactionsCSV = (transactions, isExcelFormat = false) => {
    if (!transactions || !transactions.length) return 'No transaction data available';
    
    const headers = [
      'Transaction ID',
      'Order Code',
      'Amount',
      'User ID',
      'Email',
      'User Name',
      'Account Type',
      'Payment Type',
      'Package Name',
      'Package Type',
      'Package Price',
      'Created Date',
      'Completed Date',
      'Payment Method'
    ];

    const rows = transactions.map(t => [
      t.transactionId,
      t.orderCode,
      formatCurrency(t.amount, isExcelFormat),
      t.userId,
      t.userEmail,
      t.userName,
      translateAccountType(t.accountType),
      translatePaymentType(t.paymentType),
      t.packageName,
      t.packageType,
      formatCurrency(t.packagePrice, isExcelFormat),
      formatDate(t.createdAt, isExcelFormat),
      formatDate(t.completedAt, isExcelFormat),
      t.paymentProvider
    ]);

    return `TRANSACTION DETAILS\n${[headers, ...rows].map(row => row.join(',')).join('\n')}`;
  };

  const createPackageStatisticsCSV = (packageStats, isExcelFormat = false) => {
    if (!packageStats) return 'No package statistics data available';
    
    const candidateHeaders = [
      'Package ID',
      'Package Name',
      'Package Type',
      'Price',
      'Revenue',
      'Payment Count'
    ];
    
    const candidateRows = (packageStats.candidatePackages || []).map(p => [
      p.packageId,
      p.packageName,
      p.packageType,
      formatCurrency(p.price, isExcelFormat),
      formatCurrency(p.revenue, isExcelFormat),
      p.paymentCount
    ]);
    
    const companyHeaders = [
      'Package ID',
      'Package Name',
      'Package Type',
      'Price',
      'Job Post Limit',
      'CV View Limit',
      'Revenue',
      'Payment Count'
    ];
    
    const companyRows = (packageStats.companyPackages || []).map(p => [
      p.packageId,
      p.packageName,
      p.packageType,
      formatCurrency(p.price, isExcelFormat),
      p.jobPostLimit,
      p.cvMatchLimit,
      formatCurrency(p.revenue, isExcelFormat),
      p.paymentCount
    ]);
    
    const candidateSection = `CANDIDATE PACKAGES\n${[candidateHeaders, ...candidateRows].map(row => row.join(',')).join('\n')}`;
    const companySection = `\n\nCOMPANY PACKAGES\n${[companyHeaders, ...companyRows].map(row => row.join(',')).join('\n')}`;
    
    return `PACKAGE STATISTICS\n${candidateSection}${companySection}`;
  };

  const createMonthlyRevenueCSV = (monthlyData, isExcelFormat = false) => {
    if (!monthlyData || !monthlyData.length) return 'No monthly revenue data available';
    
    const headers = [
      'Month',
      'Month Name',
      'Total Revenue',
      'Candidate Revenue',
      'Company Revenue',
      'Total Transactions',
      'Candidate Transactions',
      'Company Transactions'
    ];
    
    const rows = monthlyData.map(m => [
      m.month,
      m.monthName,
      formatCurrency(m.totalRevenue, isExcelFormat),
      formatCurrency(m.candidateRevenue, isExcelFormat),
      formatCurrency(m.companyRevenue, isExcelFormat),
      m.transactionCount,
      m.candidateTransactions,
      m.companyTransactions
    ]);
    
    return `MONTHLY REVENUE\n${[headers, ...rows].map(row => row.join(',')).join('\n')}`;
  };

  const createDailyRevenueCSV = (dailyData, isExcelFormat = false) => {
    if (!dailyData || !dailyData.length) return 'No daily revenue data available';
    
    const headers = [
      'Date',
      'Total Revenue',
      'Candidate Revenue',
      'Company Revenue',
      'Transaction Count'
    ];
    
    const rows = dailyData.map(d => [
      isExcelFormat ? formatDate(d.date, true) : d.date,
      formatCurrency(d.totalRevenue, isExcelFormat),
      formatCurrency(d.candidateRevenue, isExcelFormat),
      formatCurrency(d.companyRevenue, isExcelFormat),
      d.transactionCount
    ]);
    
    return `DAILY REVENUE\n${[headers, ...rows].map(row => row.join(',')).join('\n')}`;
  };

  const createUserRevenueCSV = (userData, isExcelFormat = false) => {
    if (!userData || !userData.length) return 'No user revenue data available';
    
    const headers = [
      'User ID',
      'Email',
      'Name',
      'Account Type',
      'Total Spent',
      'Transaction Count',
      'First Purchase',
      'Last Purchase'
    ];
    
    const rows = userData.map(u => [
      u.userId,
      u.email,
      u.name,
      translateAccountType(u.accountType),
      formatCurrency(u.totalSpent, isExcelFormat),
      u.transactionCount,
      formatDate(u.firstPurchase, isExcelFormat),
      formatDate(u.lastPurchase, isExcelFormat)
    ]);
    
    return `USER REVENUE\n${[headers, ...rows].map(row => row.join(',')).join('\n')}`;
  };

  const createUpgradeStatisticsCSV = (upgradeStats, isExcelFormat = false) => {
    if (!upgradeStats) return 'No upgrade statistics data available';
    
    const combinedHeaders = [
      'Metric',
      'Value'
    ];
    
    const combinedRows = [
      ['Total Packages Purchased', upgradeStats.combinedStatistics.totalPackagePayments],
      ['Total Basic Packages Purchased', upgradeStats.combinedStatistics.totalBasicPackagePayments],
      ['Total Premium Packages Purchased', upgradeStats.combinedStatistics.totalPremiumPackagePayments],
      ['Total Package Upgrades', upgradeStats.combinedStatistics.totalUpgrades],
      ['Total Same Package Renewals', upgradeStats.combinedStatistics.totalSamePackageRenewals],
      ['Package Upgrade Rate', `${upgradeStats.combinedStatistics.overallUpgradeRate}%`],
      ['Package Renewal Rate', `${upgradeStats.combinedStatistics.overallRenewalRate}%`],
      ['User Return Rate', `${upgradeStats.combinedStatistics.overallReturnRate}%`]
    ];
    
    const patternHeaders = [
      'User ID',
      'User Name',
      'Email',
      'Account Type',
      'Upgrade Pattern',
      'First Subscription Date',
      'First Package Name',
      'First Package Type',
      'Second Subscription Date',
      'Second Package Name'
    ];
    
    const patternRows = (upgradeStats.userUpgradePatterns || []).map(p => [
      p.userId,
      p.userName,
      p.email,
      translateAccountType(p.accountType),
      translateUpgradePattern(p.upgradePattern),
      formatDate(p.firstSubscriptionDate, isExcelFormat),
      p.firstPackageName,
      p.firstPackageType,
      formatDate(p.secondSubscriptionDate, isExcelFormat),
      p.secondPackageName
    ]);
    
    const combinedSection = `COMBINED STATISTICS\n${[combinedHeaders, ...combinedRows].map(row => row.join(',')).join('\n')}`;
    const patternSection = `\n\nUSER UPGRADE PATTERNS\n${[patternHeaders, ...patternRows].map(row => row.join(',')).join('\n')}`;
    
    return `PACKAGE UPGRADE STATISTICS\n${combinedSection}${patternSection}`;
  };

  const formatCurrency = (value, isExcelFormat = false) => {
    if (value === undefined || value === null) return '';
    
    if (isExcelFormat || fileFormat === 'excel') {
      return value.toString();
    }
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  const translateAccountType = (type) => {
    if (!type) return '';
    return type;
  };
  
  const translatePaymentType = (type) => {
    if (!type) return '';
    const types = {
      'CandidateSubscription': 'Candidate Subscription',
      'CompanySubscription': 'Company Subscription'
    };
    return types[type] || type;
  };
  
  const translateUpgradePattern = (pattern) => {
    if (!pattern) return '';
    const patterns = {
      'BasicToBasic': 'Basic Package Renewal',
      'BasicToPremium': 'Upgrade from Basic to Premium',
      'PremiumToPremium': 'Premium Package Renewal'
    };
    return patterns[pattern] || pattern;
  };

  const exportTypeOptions = [
    { value: 'summary', label: 'Revenue Overview', icon: '📊' },
    { value: 'transactions', label: 'Transaction Details', icon: '📝' },
    { value: 'packages', label: 'Service Package Statistics', icon: '📦' },
    { value: 'monthly', label: 'Monthly Revenue', icon: '📅' },
    { value: 'daily', label: 'Daily Revenue', icon: '🗓️' },
    { value: 'users', label: 'Revenue by User', icon: '👥' },
    { value: 'upgrades', label: 'Package Upgrade Statistics', icon: '⬆️' },
    { value: 'full', label: 'Full Report', icon: '📋' }
  ];

  const fileFormatOptions = [
    { value: 'excel', label: 'Excel (CSV)', icon: '📊', description: 'Suitable for Microsoft Excel' },
    { value: 'json', label: 'JSON', icon: '{ }', description: 'Suitable for technical analysis' }
  ];

  const dataTypeInfo = [
    {
      icon: '📊',
      title: 'Revenue Overview',
      description: 'Aggregated revenue metrics such as total revenue, number of transactions, and number of users.'
  },
  {
      icon: '📝',
      title: 'Transaction Details',
      description: 'Detailed information about each transaction, including transaction ID, user, and creation date.'
  },
  {
      icon: '📦',
      title: 'Service Package Statistics',
      description: 'Revenue analysis by service package type and the number of packages sold.'
  },
  {
      icon: '📅',
      title: 'Revenue Over Time',
      description: 'Revenue by month or day, analyzing revenue trends over time.'
  },
  {
      icon: '👥',
      title: 'Revenue by User',
      description: 'Spending per user, categorizing customers by spending level.'
  }
  ];

  const guideSteps = [
    {
      number: 1,
      title: 'Select Data Type to Export',
      description: 'Choose the report type that suits your analysis needs from the dropdown list.'
  },
  {
      number: 2,
      title: 'Select File Format',
      description: 'Excel (CSV) is suitable for opening in Microsoft Excel or Google Sheets. JSON is suitable for technical analysis.'
  },
  {
      number: 3,
      title: 'Open File in Excel',
      description: 'To display Vietnamese text correctly in Excel, after downloading, open with Excel and select "Data > Text to Columns".'
  },
  {
      number: 4,
      title: 'Note on Date Format',
      description: 'The date format in the Excel file is optimized as day/month/year (DD/MM/YYYY) for correct recognition by Excel.'
  }
  ];

  const renderTabContent = () => {
    return (
      <div className="tab-content">
        {dataTypeInfo.map((item, index) => (
          <div key={index} className="info-item">
            <div className="info-icon">
              <span className="emoji">{item.icon}</span>
            </div>
            <div className="info-content">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="export-container">
      <div className="export-header">
        <div className="header-content">
          <div className="header-icon">
            <div className="icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
          </div>
          <div className="header-text">
            <h2>Export Revenue Data</h2>
           
          </div>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
      
      <div className="export-body">
        <div className="main-content">
          <div className="settings-panel">
            <div className="panel-header">
              <h3>⚙️ Data Export Configuration</h3>
            </div>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  <span className="label-icon">📊</span>
                  Data Type
                </label>
                <div className="custom-select">
                  <select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value)}
                  >
                    {exportTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <span className="label-icon">📄</span>
                  File Format
                </label>
                <div className="format-options">
                  {fileFormatOptions.map((format) => (
                    <label key={format.value} className={`format-option ${fileFormat === format.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="fileFormat"
                        value={format.value}
                        checked={fileFormat === format.value}
                        onChange={(e) => setFileFormat(e.target.value)}
                      />
                      <div className="format-content">
                        <span className="format-icon">{format.icon}</span>
                        <span className="format-label">{format.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="setting-group full-width">
                <label className="setting-label">
                  <span className="label-icon">⚙️</span>
                  Additional Options
                </label>
                <div className="options-grid">
                  <label className={`option-card ${includeHeaders ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={includeHeaders}
                      onChange={(e) => setIncludeHeaders(e.target.checked)}
                    />
                    <div className="option-content">
                      <div className="option-icon">📋</div>
                      <div className="option-text">
                        <span className="option-title">Add File Header</span>
                        <span className="option-desc">Include Metadata Information</span>
                      </div>
                    </div>
                    <div className="option-check">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </label>
                  
                  <label className={`option-card ${detailLevel === 'detailed' ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={detailLevel === 'detailed'}
                      onChange={(e) => setDetailLevel(e.target.checked ? 'detailed' : 'standard')}
                    />
                    <div className="option-content">
                      <div className="option-icon">🔍</div>
                      <div className="option-text">
                        <span className="option-title">Export Details</span>
                        <span className="option-desc">Include Extended Information</span>
                      </div>
                    </div>
                    <div className="option-check">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="action-section">
              <button 
                className="export-button"
                onClick={handleExport}
                disabled={exporting}
              >
                <div className="button-content">
                  {exporting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Exporting data...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Export Data</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          <div className="info-panel">
            <div className="panel-header">
              <h3>💡 Useful Information</h3>
            </div>
            
                         <div className="info-content">
               {renderTabContent()}
             </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
                 .export-container {
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #ffffff;
           border-radius: 12px;
           box-shadow: 
             0 6px 20px -4px rgba(0, 0, 0, 0.08),
             0 2px 8px -2px rgba(0, 0, 0, 0.06);
           overflow: hidden;
           margin: 16px 0;
           position: relative;
         }
        
                 .export-header {
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           padding: 20px 24px;
           color: white;
           position: relative;
           overflow: hidden;
         }
        
                 .header-content {
           display: flex;
           align-items: center;
           gap: 16px;
           position: relative;
           z-index: 2;
         }
        
        .header-icon {
          position: relative;
        }
        
                 .icon-bg {
           width: 44px;
           height: 44px;
           background: rgba(255, 255, 255, 0.15);
           backdrop-filter: blur(10px);
           border-radius: 12px;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
           border: 1px solid rgba(255, 255, 255, 0.2);
         }
        
                 .icon-bg svg {
           width: 22px;
           height: 22px;
           color: white;
         }
        
                 .header-text h2 {
           margin: 0 0 4px 0;
           font-weight: 700;
           font-size: 20px;
           letter-spacing: -0.5px;
         }
        
                 .header-text p {
           margin: 0;
           opacity: 0.9;
           font-size: 13px;
           line-height: 1.4;
           max-width: 350px;
         }
        
        .header-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .circle-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          right: -100px;
        }
        
        .circle-2 {
          width: 120px;
          height: 120px;
          top: 20px;
          right: 50px;
          background: rgba(255, 255, 255, 0.08);
        }
        
        .circle-3 {
          width: 60px;
          height: 60px;
          bottom: 20px;
          right: 200px;
          background: rgba(255, 255, 255, 0.1);
        }
        
                 .export-body {
           padding: 24px;
         }
        
                 .main-content {
           display: flex;
           flex-direction: column;
           gap: 20px;
         }
        
                 .settings-panel,
         .info-panel {
           background: #f8fafc;
           border-radius: 12px;
           overflow: hidden;
           box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
           border: 1px solid #e2e8f0;
         }
        
                 .panel-header {
           background: white;
           padding: 16px 20px;
           border-bottom: 1px solid #e2e8f0;
         }
        
                 .panel-header h3 {
           margin: 0;
           font-weight: 600;
           font-size: 16px;
           color: #1e293b;
         }
        
                 .settings-grid {
           padding: 20px;
           display: grid;
           gap: 16px;
         }
        
                 .setting-group {
           display: flex;
           flex-direction: column;
           gap: 8px;
         }
        
        .setting-group.full-width {
          grid-column: 1 / -1;
        }
        
                 .setting-label {
           display: flex;
           align-items: center;
           gap: 6px;
           font-size: 13px;
           font-weight: 600;
           color: #334155;
         }
        
                 .label-icon {
           font-size: 14px;
         }
        
        .custom-select {
          position: relative;
        }
        
                 .custom-select select {
           width: 100%;
           padding: 12px 48px 12px 14px;
           border-radius: 8px;
           border: 2px solid #e2e8f0;
           background: white;
           font-size: 13px;
           color: #1e293b;
           appearance: none;
           cursor: pointer;
           transition: all 0.2s ease;
         }
        
        .custom-select select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        .select-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #64748b;
          pointer-events: none;
        }
        
                 .format-options {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 8px;
         }
        
                 .format-option {
           background: white;
           border: 2px solid #e2e8f0;
           border-radius: 8px;
           padding: 12px;
           cursor: pointer;
           transition: all 0.2s ease;
           position: relative;
           overflow: hidden;
         }
        
        .format-option:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }
        
        .format-option.active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }
        
        .format-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        
        .format-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        
                 .format-icon {
           font-size: 18px;
           margin-bottom: 3px;
         }
        
                 .format-label {
           font-weight: 600;
           color: #1e293b;
           font-size: 12px;
         }
        
                 .options-grid {
           display: grid;
           gap: 10px;
         }
        
                 .option-card {
           background: white;
           border: 2px solid #e2e8f0;
           border-radius: 8px;
           padding: 14px;
           cursor: pointer;
           transition: all 0.2s ease;
           display: flex;
           align-items: center;
           gap: 10px;
           position: relative;
         }
        
        .option-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }
        
        .option-card.active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }
        
        .option-card input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        
        .option-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        
                 .option-icon {
           font-size: 18px;
           width: 32px;
           height: 32px;
           display: flex;
           align-items: center;
           justify-content: center;
           background: rgba(102, 126, 234, 0.1);
           border-radius: 6px;
         }
        
        .option-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
                 .option-title {
           font-weight: 600;
           color: #1e293b;
           font-size: 13px;
         }
        
                 .option-desc {
           font-size: 11px;
           color: #64748b;
         }
        
        .option-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.2s ease;
        }
        
        .option-card.active .option-check {
          opacity: 1;
          transform: scale(1);
        }
        
        .option-check svg {
          width: 14px;
          height: 14px;
        }
        
                 .action-section {
           padding: 0 20px 20px;
         }
        
                 .export-button {
           width: 100%;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           color: white;
           border: none;
           border-radius: 10px;
           padding: 0;
           font-size: 14px;
           font-weight: 600;
           cursor: pointer;
           transition: all 0.3s ease;
           box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
           position: relative;
           overflow: hidden;
         }
        
        .export-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
        }
        
        .export-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .export-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        
                 .button-content {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           padding: 14px 20px;
           position: relative;
           z-index: 2;
         }
        
                 .button-content svg {
           width: 16px;
           height: 16px;
         }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
                 .info-content {
           padding: 16px;
           max-height: 250px;
           overflow-y: auto;
         }
        
                 .tab-content {
           display: flex;
           flex-direction: column;
           gap: 12px;
         }
        
                 .info-item {
           display: flex;
           gap: 10px;
           padding: 10px 0;
           border-bottom: 1px dashed #e2e8f0;
         }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
                 .info-icon {
           width: 28px;
           height: 28px;
           border-radius: 6px;
           background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
           display: flex;
           align-items: center;
           justify-content: center;
           flex-shrink: 0;
         }
        
                 .emoji {
           font-size: 14px;
         }
        
                 .info-content h5 {
           margin: 0 0 2px 0;
           font-size: 13px;
           font-weight: 600;
           color: #1e293b;
         }
        
                 .info-content p {
           margin: 0;
           font-size: 12px;
           color: #64748b;
           line-height: 1.3;
         }
        
        .guide-step {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .guide-step:last-child {
          margin-bottom: 0;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .step-content h5 {
          margin: 0 0 6px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .step-content p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }
        
        
        
        @media (max-width: 768px) {
          .export-header {
            padding: 32px 24px;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          
          .header-text h2 {
            font-size: 28px;
          }
          
          .export-body {
            padding: 32px 24px;
          }
          
          .settings-grid {
            padding: 24px;
          }
          
          .format-options {
            grid-template-columns: 1fr;
          }
          
          
        }
        
        @media (max-width: 480px) {
          .export-container {
            margin: 16px 0;
            border-radius: 16px;
          }
          
          .header-text h2 {
            font-size: 24px;
          }
          
          .header-text p {
            font-size: 14px;
          }
          
          .icon-bg {
            width: 60px;
            height: 60px;
          }
          
          .icon-bg svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExportData;