'use client'

import { useState } from 'react';

const DateRangeFilter = ({ dateRange, setDateRange, selectedYear, setSelectedYear }) => {
  const [activeTab, setActiveTab] = useState('custom');
  const [selectedQuick, setSelectedQuick] = useState(null);

  const handleQuickDateSelect = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates as YYYY-MM-DD
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    setSelectedQuick(days);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="date-filter-container">
      <div className="date-filter-header">
        <div className="header-row">
          <h5 className="animate-pop">Date Range Filter</h5>
          <div className="range-preview animate-fade">
            <div className="preview-item">
              <span>Start</span>
              <strong>{dateRange.startDate || '—'}</strong>
            </div>
            <div className="preview-sep">→</div>
            <div className="preview-item">
              <span>End</span>
              <strong>{dateRange.endDate || '—'}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div className="date-filter-content">
        <div className="row g-4 animate-in">
          <div className="col-md-6">
            <div className="filter-section quick-select">
              <h6>
                <i className="bi bi-calendar-event"></i>
                Quick Select
              </h6>
              <div className="quick-buttons">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`quick-button ${selectedQuick === d ? 'active' : ''}`}
                    onClick={(e) => {
                      e.currentTarget.classList.remove('ripple');
                      void e.currentTarget.offsetWidth;
                      e.currentTarget.classList.add('ripple');
                      handleQuickDateSelect(d);
                    }}
                  >
                    {`Last ${d} Days`}
                  </button>
                ))}
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
                    onChange={(e) => { setSelectedQuick(null); setDateRange(prev => ({ ...prev, startDate: e.target.value })); }}
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
                    onChange={(e) => { setSelectedQuick(null); setDateRange(prev => ({ ...prev, endDate: e.target.value })); }}
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
          animation: card-in .4s ease both;
        }
        
        .date-filter-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #4a6bff, #2541b8);
          color: white;
        }
        
        .header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .date-filter-header h5 {
          margin: 0;
          font-weight: 700;
          font-size: 1.15rem;
          letter-spacing: .2px;
        }
        .range-preview { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); padding: 6px 10px; border-radius: 999px; backdrop-filter: blur(6px); }
        .preview-item { display: flex; gap: 6px; align-items: center; }
        .preview-item span { opacity: .9; font-size: 12px; }
        .preview-item strong { font-size: 12px; }
        .preview-sep { opacity: .8; }
        
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
          animation: fade-up .45s ease both;
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
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #344054;
          transition: all 0.25s ease;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }
        
        .quick-button:hover { background-color: #4a6bff; color: white; border-color: #4a6bff; transform: translateY(-1px); box-shadow: 0 8px 22px rgba(74, 107, 255, 0.18); }
        .quick-button.active { background: #4a6bff; color: #fff; border-color: #4a6bff; }
        .quick-button.ripple::after { content: ''; position: absolute; left: 50%; top: 50%; width: 5px; height: 5px; background: rgba(255,255,255,.6); border-radius: 50%; transform: translate(-50%, -50%); animation: ripple .6s ease-out forwards; }
        
        .date-input-container {
          display: flex;
          flex-direction: column;
          animation: fade-up .45s ease both;
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
          position: relative;
        }
        
        .date-input:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.15), 0 10px 24px rgba(13, 110, 253, 0.06);
          outline: none;
        }

        .animate-in { animation: fade-up .5s ease both; }
        .animate-pop { animation: pop .45s ease both; }
        .animate-fade { animation: fade-in .6s ease both; }

        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop { 0% { transform: scale(.96); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes card-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ripple { to { width: 220%; height: 220%; opacity: 0; } }
      `}</style>
    </div>
  );
};

export default DateRangeFilter;