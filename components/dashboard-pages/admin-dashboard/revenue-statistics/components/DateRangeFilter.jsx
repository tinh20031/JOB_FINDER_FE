'use client'

import { useState } from 'react';

const DateRangeFilter = ({ dateRange, setDateRange, selectedYear, setSelectedYear }) => {
  const [activeTab, setActiveTab] = useState('custom');

  const handleQuickDateSelect = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates as YYYY-MM-DD
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="date-filter-container">
      <div className="date-filter-header">
        <h5>Date Range Filter</h5>
      </div>
      
      <div className="date-filter-content">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="filter-section quick-select">
              <h6>
                <i className="bi bi-calendar-event"></i>
                Quick Select
              </h6>
              <div className="quick-buttons">
                <button 
                  type="button" 
                  className="quick-button"
                  onClick={() => handleQuickDateSelect(7)}
                >
                  Last 7 Days
                </button>
                <button 
                  type="button" 
                  className="quick-button"
                  onClick={() => handleQuickDateSelect(30)}
                >
                  Last 30 Days
                </button>
                <button 
                  type="button" 
                  className="quick-button"
                  onClick={() => handleQuickDateSelect(90)}
                >
                  Last 90 Days
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="filter-section custom-range">
              <h6>
                <i className="bi bi-calendar-range"></i>
                Custom Range
              </h6>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="date-input-container">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="date-input"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="date-input-container">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="date-input"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .date-filter-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .date-filter-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #4a6bff, #2541b8);
          color: white;
        }
        
        .date-filter-header h5 {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .date-filter-content {
          padding: 20px;
        }
        
        .filter-section {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          height: 100%;
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }
        
        .filter-section:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
          transform: translateY(-2px);
        }
        
        .filter-section h6 {
          margin-bottom: 15px;
          font-weight: 600;
          color: #334155;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .filter-section i {
          font-size: 1rem;
          color: #4a6bff;
        }
        
        .quick-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .quick-button {
          background-color: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
        }
        
        .quick-button:hover {
          background-color: #4a6bff;
          color: white;
          border-color: #4a6bff;
        }
        
        .date-input-container {
          display: flex;
          flex-direction: column;
        }
        
        .date-input-container label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #495057;
          margin-bottom: 8px;
        }
        
        .date-input {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.9rem;
          background-color: white;
          color: #333;
          transition: all 0.2s;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .date-input:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.15);
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default DateRangeFilter;