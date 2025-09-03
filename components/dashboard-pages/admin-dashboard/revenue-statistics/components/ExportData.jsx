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
      
      const toIsoDateTime = (value, isEnd = false) => {
        if (!value) return undefined;
        if (typeof value === 'string' && value.includes('T')) return value;
        return isEnd ? `${value}T23:59:59.999Z` : `${value}T00:00:00Z`;
      };

      const response = await ApiService.exportRevenueData(
        toIsoDateTime(dateRange.startDate, false),
        toIsoDateTime(dateRange.endDate, true),
        detailLevel === 'detailed'
      );

      // Dynamically import SheetJS only on client
      let XLSX;
      try {
        const XLSXMod = await import('xlsx');
        XLSX = XLSXMod.default || XLSXMod;
      } catch (e) {
        alert('Thiếu thư viện xlsx. Vui lòng cài đặt bằng: npm i xlsx hoặc yarn add xlsx');
        setExporting(false);
        return;
      }

      // Build workbook
      const workbook = XLSX.utils.book_new();

      const addSheetFromAOA = (name, aoa) => {
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(workbook, ws, name);
      };

      // Optional metadata sheet
      if (includeHeaders) {
        const meta = [
          ['REVENUE REPORT'],
          ['Export Date', new Date().toLocaleString('vi-VN')],
          ['Date Range', `${formatDate(response.summary?.startDate, true)} to ${formatDate(response.summary?.endDate, true)}`],
          ['Report Type', getExportTypeDisplayName()],
          ['Detail Level', detailLevel === 'detailed' ? 'Detailed' : 'Standard']
        ];
        addSheetFromAOA('Metadata', meta);
      }

      const include = (type) => exportType === 'full' || exportType === type;

      if (include('summary') && response.summary) {
        const s = response.summary;
        const aoa = [
          ['Metric', 'Value', 'Start Date', 'End Date'],
          ['Total Revenue', s.totalRevenue, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Candidate Revenue', s.candidateRevenue, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Company Revenue', s.companyRevenue, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Total Transactions', s.totalTransactions, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Candidate Transactions', s.candidateTransactions, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Company Transactions', s.companyTransactions, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Unique Users', s.uniqueUsers, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Unique Candidates', s.uniqueCandidates, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Unique Companies', s.uniqueCompanies, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Average Transaction Value', s.averageTransactionValue, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Median Transaction Value', s.medianTransactionValue, formatDate(s.startDate, true), formatDate(s.endDate, true)],
          ['Most Popular Payment Method', `${s.topPaymentProvider?.provider} (${s.topPaymentProvider?.count} transactions)`, formatDate(s.startDate, true), formatDate(s.endDate, true)]
        ];
        addSheetFromAOA('Summary', aoa);
      }

      if (include('transactions') && Array.isArray(response.transactions)) {
        const headers = ['Transaction ID','Order Code','Amount','User ID','Email','User Name','Account Type','Payment Type','Package Name','Package Type','Package Price','Created Date','Completed Date','Payment Method'];
        const rows = response.transactions.map(t => [
          t.transactionId,
          t.orderCode,
          t.amount,
          t.userId,
          t.userEmail,
          t.userName,
          translateAccountType(t.accountType),
          translatePaymentType(t.paymentType),
          t.packageName,
          t.packageType,
          t.packagePrice,
          formatDate(t.createdAt, true),
          formatDate(t.completedAt, true),
          t.paymentProvider
        ]);
        addSheetFromAOA('Transactions', [headers, ...rows]);
      }

      if (include('packages') && response.packageStatistics) {
        const cps = response.packageStatistics.candidatePackages || [];
        const cmp = response.packageStatistics.companyPackages || [];
        const ch = ['Package ID','Package Name','Package Type','Price','Revenue','Payment Count'];
        const cr = cps.map(p => [p.packageId, p.packageName, p.packageType, p.price, p.revenue, p.paymentCount]);
        addSheetFromAOA('Candidate Packages', [ch, ...cr]);
        const coh = ['Package ID','Package Name','Package Type','Price','Job Post Limit','CV View Limit','Revenue','Payment Count'];
        const cor = cmp.map(p => [p.packageId, p.packageName, p.packageType, p.price, p.jobPostLimit, p.cvMatchLimit, p.revenue, p.paymentCount]);
        addSheetFromAOA('Company Packages', [coh, ...cor]);
      }

      if (include('monthly') && Array.isArray(response.monthlyRevenue)) {
        const headers = ['Month','Month Name','Total Revenue','Candidate Revenue','Company Revenue','Total Transactions','Candidate Transactions','Company Transactions'];
        const rows = response.monthlyRevenue.map(m => [m.month, m.monthName, m.totalRevenue, m.candidateRevenue, m.companyRevenue, m.transactionCount, m.candidateTransactions, m.companyTransactions]);
        addSheetFromAOA('Monthly Revenue', [headers, ...rows]);
      }

      if (include('daily') && Array.isArray(response.dailyRevenue)) {
        const headers = ['Date','Total Revenue','Candidate Revenue','Company Revenue','Transaction Count'];
        const rows = response.dailyRevenue.map(d => [formatDate(d.date, true), d.totalRevenue, d.candidateRevenue, d.companyRevenue, d.transactionCount]);
        addSheetFromAOA('Daily Revenue', [headers, ...rows]);
      }

      if (include('users') && Array.isArray(response.userRevenue)) {
        const headers = ['User ID','Email','Name','Account Type','Total Spent','Transaction Count','First Purchase','Last Purchase'];
        const rows = response.userRevenue.map(u => [u.userId, u.email, u.name, translateAccountType(u.accountType), u.totalSpent, u.transactionCount, formatDate(u.firstPurchase, true), formatDate(u.lastPurchase, true)]);
        addSheetFromAOA('User Revenue', [headers, ...rows]);
      }

      if (include('upgrades') && response.upgradeStatistics) {
        const cs = response.upgradeStatistics.combinedStatistics || {};
        const up = response.upgradeStatistics.userUpgradePatterns || [];
        const combined = [
          ['Metric','Value'],
          ['Total Packages Purchased', cs.totalPackagePayments],
          ['Total Basic Packages Purchased', cs.totalBasicPackagePayments],
          ['Total Premium Packages Purchased', cs.totalPremiumPackagePayments],
          ['Total Package Upgrades', cs.totalUpgrades],
          ['Total Same Package Renewals', cs.totalSamePackageRenewals],
          ['Package Upgrade Rate', `${cs.overallUpgradeRate}%`],
          ['Package Renewal Rate', `${cs.overallRenewalRate}%`],
          ['User Return Rate', `${cs.overallReturnRate}%`]
        ];
        addSheetFromAOA('Combined Stats', combined);

        const headers = ['User ID','User Name','Email','Account Type','Upgrade Pattern','First Subscription Date','First Package Name','First Package Type','Second Subscription Date','Second Package Name'];
        const rows = up.map(p => [p.userId, p.userName, p.email, translateAccountType(p.accountType), translateUpgradePattern(p.upgradePattern), formatDate(p.firstSubscriptionDate, true), p.firstPackageName, p.firstPackageType, formatDate(p.secondSubscriptionDate, true), p.secondPackageName]);
        addSheetFromAOA('Upgrade Patterns', [headers, ...rows]);
      }

      // Fallback: if no sheet was added, dump raw JSON
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        try {
          const flat = [{ note: 'No structured sheets generated. Dumping raw response JSON.' }];
          const ws = XLSX.utils.json_to_sheet(flat);
          XLSX.utils.book_append_sheet(workbook, ws, 'Data');
        } catch {}
      }

      // Write workbook and download
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const today = new Date();
      const formattedToday = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const fileName = `revenue_export_${exportType}_${formattedToday}.xlsx`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Data export failed. Please try again.');
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

  // Removed JSON export to only support Excel (CSV)

  // Removed CSV content generator; using XLSX workbook instead

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
    { value: 'excel', label: 'Excel (.xlsx)', icon: '📊', description: 'Suitable for Microsoft Excel and Google Sheets' }
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
          box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          margin: 16px 0;
        }

        .export-header {
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          padding: 16px 20px;
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon .icon-bg {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .icon-bg svg { width: 20px; height: 20px; color: white; }

        .header-text h2 { margin: 0 0 2px 0; font-weight: 700; font-size: 18px; letter-spacing: -0.2px; }
        .header-text p { margin: 0; opacity: 0.9; font-size: 12px; }

        .export-body { padding: 18px; }
        .main-content { display: flex; flex-direction: column; gap: 14px; }

        .settings-panel, .info-panel {
          background: #f8fafc;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
        }

        .panel-header { background: white; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
        .panel-header h3 { margin: 0; font-weight: 600; font-size: 14px; color: #1e293b; }

        .settings-grid { padding: 16px; display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .setting-group { display: flex; flex-direction: column; gap: 6px; }
        .setting-group.full-width { grid-column: 1 / -1; }

        .setting-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #334155; }
        .label-icon { font-size: 14px; }
        .custom-select { position: relative; }
        .custom-select select {
          width: 100%; padding: 10px 42px 10px 12px; border-radius: 8px; border: 2px solid #e2e8f0; background: white; font-size: 13px; color: #1e293b; appearance: none; cursor: pointer; transition: all 0.2s ease;
        }
        .custom-select select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12); }
        .select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #64748b; pointer-events: none; }

        .format-options { display: flex; gap: 8px; flex-wrap: wrap; }
        .format-option { background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .format-option:hover { border-color: #6366f1; }
        .format-option.active { border-color: #6366f1; background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(124,58,237,0.08) 100%); }
        .format-option input { position: absolute; opacity: 0; pointer-events: none; }
        .format-content { display: flex; align-items: center; gap: 8px; }
        .format-icon { font-size: 16px; }
        .format-label { font-weight: 600; color: #1e293b; font-size: 12px; }

        .options-grid { display: grid; gap: 8px; }
        .option-card { background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 10px; position: relative; }
        .option-card:hover { border-color: #6366f1; }
        .option-card.active { border-color: #6366f1; background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(124,58,237,0.08) 100%); }
        .option-card input { position: absolute; opacity: 0; pointer-events: none; }
        .option-content { display: flex; align-items: center; gap: 12px; flex: 1; }
        .option-icon { font-size: 16px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(99,102,241,0.12); border-radius: 6px; }
        .option-text { display: flex; flex-direction: column; gap: 2px; }
        .option-title { font-weight: 600; color: #1e293b; font-size: 12px; }
        .option-desc { font-size: 11px; color: #64748b; }
        .option-check { width: 20px; height: 20px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.9); transition: all 0.2s ease; }
        .option-card.active .option-check { opacity: 1; transform: scale(1); }
        .option-check svg { width: 12px; height: 12px; }

        .action-section { padding: 0 16px 16px; }
        .export-button { width: 100%; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; border: none; border-radius: 10px; padding: 0; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35); }
        .export-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(99, 102, 241, 0.4); }
        .export-button:active:not(:disabled) { transform: translateY(0); }
        .export-button:disabled { opacity: 0.7; cursor: not-allowed; }

        .button-content { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; }
        .button-content svg { width: 16px; height: 16px; }
        .spinner { width: 18px; height: 18px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .info-content { padding: 12px; }
        .tab-content { display: grid; gap: 8px; }
        .info-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
        .info-item:last-child { border-bottom: none; }
        .info-icon { width: 26px; height: 26px; border-radius: 6px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; }
        .emoji { font-size: 13px; }
        .info-content h5 { margin: 0 0 2px 0; font-size: 12px; font-weight: 600; color: #1e293b; }
        .info-content p { margin: 0; font-size: 12px; color: #64748b; }

        @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .export-body { padding: 16px; } .header-content { flex-direction: column; text-align: center; gap: 10px; } }
      `}</style>
    </div>
  );
};

export default ExportData;