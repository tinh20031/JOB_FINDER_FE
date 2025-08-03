# Revenue Statistics Dashboard

## Overview
The Revenue Statistics Dashboard is a comprehensive admin tool for monitoring and analyzing revenue data from the Job Finder platform. It provides detailed insights into revenue streams, transaction history, and subscription performance.

## Features

### 1. Revenue Summary Cards
- **Total Revenue**: Overall revenue for the selected period
- **Candidate Revenue**: Revenue from candidate subscriptions
- **Company Revenue**: Revenue from company subscriptions
- **Revenue Share**: Percentage breakdown between candidate and company revenue

### 2. Date Range Filtering
- **Quick Select**: Predefined periods (7 days, 30 days, 90 days)
- **Custom Range**: Manual date selection for specific analysis
- **Year Selector**: For monthly revenue analysis

### 3. Revenue Charts
- **Revenue Trend**: Visual representation of revenue over time
- **Monthly Breakdown**: Monthly revenue comparison for selected year
- **Revenue Distribution**: Percentage breakdown between user types

### 4. Package Type Analysis
- **Candidate Packages**: Revenue breakdown by candidate subscription types
- **Company Packages**: Revenue breakdown by company subscription types
- **Payment Counts**: Number of transactions per package type

### 5. Recent Transactions
- **Transaction Details**: Recent payment records with user information
- **Payment Types**: Categorized by candidate or company subscriptions
- **Real-time Updates**: Latest transaction data

### 6. Export Functionality
- **Summary Export**: Key metrics in CSV format
- **Transaction Export**: Detailed transaction records
- **Full Report**: Complete revenue analysis

## API Endpoints Used

### 1. GET /api/RevenueStatistics/summary
- **Purpose**: Get revenue summary for a specified time period
- **Parameters**: 
  - `startDate` (optional): Start date for analysis
  - `endDate` (optional): End date for analysis
- **Response**: Total revenue, candidate/company breakdown, payment counts

### 2. GET /api/RevenueStatistics/monthly
- **Purpose**: Get monthly revenue breakdown for a specific year
- **Parameters**: 
  - `year` (optional): Year for analysis (defaults to current year)
- **Response**: Monthly revenue data with candidate/company breakdown

### 3. GET /api/RevenueStatistics/by-package-type
- **Purpose**: Get revenue breakdown by subscription package types
- **Parameters**: 
  - `startDate` (optional): Start date for analysis
  - `endDate` (optional): End date for analysis
- **Response**: Revenue and payment counts by package type

### 4. GET /api/RevenueStatistics/recent-transactions
- **Purpose**: Get recent payment transactions
- **Parameters**: 
  - `count` (optional): Number of transactions to retrieve (default: 10)
- **Response**: Recent transaction details with user information

### 5. GET /api/RevenueStatistics/dashboard
- **Purpose**: Get comprehensive dashboard statistics
- **Response**: Today, week, month, year revenue + subscription counts

### 6. GET /api/RevenueStatistics/export
- **Purpose**: Export detailed revenue data for analysis
- **Parameters**: 
  - `startDate` (optional): Start date for export
  - `endDate` (optional): End date for export
- **Response**: Summary and detailed transaction data

## Components Structure

```
components/dashboard-pages/admin-dashboard/revenue-statistics/
├── index.jsx                           # Main dashboard component
└── components/
    ├── DateRangeFilter.jsx             # Date selection controls
    ├── RevenueSummaryCards.jsx         # Key metrics cards
    ├── RevenueChart.jsx                # Revenue trend visualization
    ├── MonthlyRevenueChart.jsx         # Monthly breakdown chart
    ├── PackageTypeBreakdown.jsx        # Package analysis
    ├── RecentTransactions.jsx          # Transaction list
    └── ExportData.jsx                  # Export functionality
```

## Usage

### Accessing the Dashboard
1. Navigate to Admin Dashboard
2. Click on "Revenue Statistics" in the sidebar
3. The dashboard will load with default 30-day view

### Filtering Data
1. Use quick select buttons for common time periods
2. Or select custom date range using date inputs
3. Choose year for monthly revenue analysis
4. All components update automatically based on selected filters

### Exporting Data
1. Select export type (Summary, Transactions, or Full Report)
2. Click "Export Data" button
3. CSV file will download automatically
4. File includes selected date range in filename

## Data Visualization

### Color Coding
- **Green**: Candidate-related data
- **Orange/Yellow**: Company-related data
- **Blue**: General metrics and totals

### Interactive Elements
- **Hover Effects**: Additional information on chart elements
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Visual feedback during data fetching

## Security
- **Admin Only**: All endpoints require admin role authentication
- **Data Privacy**: Only authorized users can access revenue data
- **Audit Trail**: All data access is logged for security purposes

## Performance Considerations
- **Caching**: API responses are cached to improve performance
- **Lazy Loading**: Components load data only when needed
- **Error Handling**: Graceful error handling with user feedback
- **Loading States**: Visual indicators during data fetching

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Optimized for tablet and mobile devices
- **JavaScript Required**: Requires JavaScript for full functionality

## Troubleshooting

### Common Issues
1. **No Data Displayed**: Check date range and ensure data exists for selected period
2. **Export Fails**: Verify network connection and try again
3. **Charts Not Loading**: Refresh page and check browser console for errors

### Error Messages
- **"Failed to load revenue data"**: API connection issue
- **"No recent transactions found"**: No transaction data for selected period
- **"Export failed"**: Network or server error during export

## Future Enhancements
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Trend analysis and forecasting
- **Custom Reports**: User-defined report templates
- **Data Visualization**: More chart types and interactive graphs
- **Email Reports**: Scheduled report delivery via email 