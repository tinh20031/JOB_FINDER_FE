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
        
        // Use the refactored service method
        const data = await ApiService.getRevenueSummary();
        
        
        // Use the exact data from the API response
        setSummaryData({
          totalRevenue: data.totalRevenue,
          candidateRevenue: data.candidateRevenue,
          companyRevenue: data.companyRevenue,
          totalPayments: data.totalPayments,
          candidatePayments: data.candidatePayments,
          companyPayments: data.companyPayments
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
      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-blue">
          <div className="left">
            <i className="icon la la-dollar"></i>
          </div>
          <div className="right">
            <h4>{formatCurrency(summaryData.totalRevenue)}</h4>
            <p>Total Revenue</p>
            <small>{formatNumber(summaryData.totalPayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-green">
          <div className="left">
            <i className="icon la la-user"></i>
          </div>
          <div className="right">
            <h4>{formatCurrency(summaryData.candidateRevenue)}</h4>
            <p>Candidate Revenue</p>
            <small>{formatNumber(summaryData.candidatePayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-yellow">
          <div className="left">
            <i className="icon la la-building"></i>
          </div>
          <div className="right">
            <h4>{formatCurrency(summaryData.companyRevenue)}</h4>
            <p>Company Revenue</p>
            <small>{formatNumber(summaryData.companyPayments)} transactions</small>
          </div>
        </div>
      </div>

      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-red">
          <div className="left">
            <i className="icon la la-percentage"></i>
          </div>
          <div className="right">
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
    </>
  );
};

export default RevenueSummaryCards; 