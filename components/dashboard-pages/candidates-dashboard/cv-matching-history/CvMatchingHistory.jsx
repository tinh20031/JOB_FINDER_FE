import React, { useState, useEffect } from 'react';
import { cvMatchingService } from '@/services/cvMatchingService';
import { toast } from 'react-toastify';
import { getToken } from '@/services/authService';
import { useRouter } from 'next/navigation';

const CvMatchingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await cvMatchingService.getMyTryMatchHistory();
      setHistory(response || []);
    } catch (error) {
      toast.error('Failed to load CV match history');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Low';
  };

  // Parse chuỗi ngày/giờ dạng '2025-07-20 18:25:18.2477163' hoặc '2025-07-20 18:25:18' thành Date đúng giờ Việt Nam
  const parseVietnamDatetime = (str) => {
    if (!str) return null;
    const [datePart, timePart] = str.split(' ');
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const timeParts = timePart.split(':');
    const hour = Number(timeParts[0]);
    const minute = Number(timeParts[1]);
    const second = Number(timeParts[2]?.split('.')[0]) || 0; // Lấy phần giây, bỏ mili giây nếu có
    // Tạo Date theo giờ Việt Nam (GMT+7), sau đó chuyển về UTC để JS hiểu đúng
    return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));
  };

  // Định dạng ngày/giờ: HH:mm dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDate = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7); // Cộng thêm 7 tiếng
    return dateObj.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>CV Match History</h4>
          </div>
          <div className="widget-content">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>CV Match History</h4>
          </div>
          <div className="widget-content">
            {history.length === 0 ? (
              <div className="empty-state">
                <i className="flaticon-search"></i>
                <h5>No CV match history yet</h5>
                <p>You haven't tried matching your CV with any job. Try it now!</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((record) => (
                  <div
                    key={record.tryMatchId || record.tryMatchID || record.id}
                    className="history-item modern-card"
                    onClick={() => router.push(`/try-match-details/${record.tryMatchId || record.tryMatchID || record.id}`)}
                    style={{cursor:'pointer'}}
                  >
                    <div className="history-row">
                      <div className="history-left">
                        <h5 className="job-title">{record.job?.title || record.jobTitle}</h5>
                        <span className="date">{formatDate(record.createdAt)}</span>
                      </div>
                      <div className="history-right">
                        {record.status === "Processing" ? (
                          <div className="score-processing">
                            <div className="spinner"></div>
                            <span>Processing...</span>
                          </div>
                        ) : record.status === "Failed" ? (
                          <div className="score-failed">
                            <i className="flaticon-close"></i>
                            Failed
                          </div>
                        ) : (
                          <div className="score-completed">
                            <div className="score-badge" style={{ backgroundColor: Math.round(record.similarityScore) >= 50 ? '#28a745' : '#e53935' }}>{Math.round(record.similarityScore)}</div>
                        </div>
                        )}
                        <div className={`status-badge status-${record.status?.toLowerCase() || ''}`}>{record.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .job-info h5 {
          margin: 0 0 4px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .company-name {
          margin: 0 0 4px 0;
          color: #6c757d;
          font-size: 14px;
        }

        .date {
          color: #adb5bd;
          font-size: 12px;
        }

        .score-info {
          text-align: center;
        }

        .score-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .score-text {
          display: block;
          font-size: 12px;
          color: #6c757d;
        }

        .history-actions {
          display: flex;
          gap: 12px;
        }

        .history-actions .theme-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 14px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .empty-state i {
          font-size: 48px;
          color: #dee2e6;
          margin-bottom: 16px;
        }

        .empty-state h5 {
          margin: 0 0 8px 0;
          color: #495057;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px 20px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .modal-overlay {
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
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h4 {
          margin: 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .detail-header h5 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .score-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .score-content {
          background: white;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .score-number {
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1;
        }

        .score-text {
          font-size: 10px;
          color: #6c757d;
          text-align: center;
          margin-top: 2px;
        }

        .suggestions-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .suggestions-section h5 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .suggestion-item {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
        }

        .suggestion-item:last-child {
          margin-bottom: 0;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #667eea;
          font-weight: 600;
        }

        .suggestion-description {
          margin: 0 0 12px 0;
          color: #495057;
          line-height: 1.5;
        }

        .suggestion-actions {
          margin: 0;
          padding-left: 20px;
        }

        .suggestion-actions li {
          margin-bottom: 6px;
          color: #6c757d;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .suggestion-actions li i {
          color: #28a745;
          font-size: 12px;
          margin-top: 2px;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #888;
          background: #f5f8ff;
        }

        .status-badge.status-processing {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.status-failed {
          background: #ffebee;
          color: #c62828;
        }

        .modern-card {
          background: #fff;
          border-radius: 16px;
          margin-bottom: 18px;
          padding: 18px 16px 12px 16px;
          border: none;
          box-shadow: 0 2px 12px rgba(102,126,234,0.07);
          transition: box-shadow 0.2s, background 0.2s;
        }
        .modern-card:hover {
          box-shadow: 0 6px 32px rgba(102,126,234,0.13);
          background: #f5f8ff;
        }
        .status-badge {
          font-size: 13px;
          font-weight: 600;
          padding: 5px 16px;
          border-radius: 8px;
          background: #f5f8ff;
          color: #2563eb;
          min-width: 70px;
          text-align: center;
        }
        .status-badge.status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-badge.status-processing {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status-badge.status-failed {
          background: #ffebee;
          color: #c62828;
        }
        .score-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .score-completed {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .score-badge {
          background: #dc3545;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(220,53,69,0.08);
        }
        .score-text {
          font-size: 13px;
          color: #dc3545;
          font-weight: 600;
        }
        .score-processing {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
        }
        .score-failed {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #c62828;
          font-weight: 600;
          font-size: 13px;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .history-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .history-left {
          flex: 1;
          display: flex;
            flex-direction: column;
          gap: 2px;
        }
        .history-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          min-width: 90px;
        }
        .job-title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
          color: #222;
        }
        .date {
          font-size: 12px;
          color: #888;
        }
        .score-completed {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .score-badge {
          background: #dc3545;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(220,53,69,0.08);
          }
        .score-text {
          font-size: 13px;
          color: #dc3545;
          font-weight: 600;
        }
        .score-processing {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
        }
        .score-failed {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #c62828;
          font-weight: 600;
          font-size: 13px;
        }
        .status-badge {
          font-size: 13px;
          font-weight: 600;
          padding: 5px 16px;
          border-radius: 8px;
          background: #f5f8ff;
          color: #2563eb;
          min-width: 70px;
          text-align: center;
        }
        .status-badge.status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-badge.status-processing {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status-badge.status-failed {
          background: #ffebee;
          color: #c62828;
        }
        @media (max-width: 768px) {
          .modern-card { padding: 8px 2px; }
          .job-title { font-size: 13px; }
          .score-badge { width: 22px; height: 22px; font-size: 11px; }
          .history-right { min-width: 60px; }
        }
      `}</style>
    </>
  );
};

export default CvMatchingHistory; 