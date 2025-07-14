import React, { useState, useEffect } from 'react';
import { cvMatchingService } from '@/services/cvMatchingService';
import { toast } from 'react-toastify';
import { getToken } from '@/services/authService';

const CvMatchingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await cvMatchingService.getMyTryMatchHistory();
      setHistory(response || []);
    } catch (error) {
      console.error('Error fetching history:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                  <div key={record.tryMatchId || record.tryMatchID || record.id} className="history-item">
                    <div className="history-header">
                      <div className="job-info">
                        <h5 style={{fontWeight: 700, fontSize: 20, marginBottom: 2}}>{record.job?.title || record.jobTitle}</h5>
                        {/* Company name or other info can go here if needed */}
                        <span className="date" style={{fontSize: 14, color: '#888'}}>{formatDate(record.createdAt)}</span>
                      </div>
                      <div className="score-info" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                        <div 
                          className="score-badge"
                          style={{ backgroundColor: getScoreColor(record.similarityScore), color: '#fff', fontWeight: 700, fontSize: 22, width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}
                        >
                          {Math.round(record.similarityScore)}%
                        </div>
                        <span className="score-text" style={{fontSize: 14, color: getScoreColor(record.similarityScore), fontWeight: 600}}>{getScoreText(record.similarityScore)}</span>
                      </div>
                    </div>
                    <div className="history-actions" style={{display: 'flex', gap: 10, marginTop: 8}}>
                      <button
                        className="theme-btn btn-style-one"
                        style={{fontWeight: 600, fontSize: 16, padding: '8px 20px', borderRadius: 6}}
                        onClick={() => handleViewDetail(record)}
                      >
                        <i className="flaticon-eye" style={{marginRight: 6}}></i>
                        View Details
                      </button>
                      <a
                        href={`/job-single-v3/${record.jobId || record.job?.jobId}`}
                        className="theme-btn btn-style-three"
                        style={{fontWeight: 500, fontSize: 15, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, background: '#f5f8ff', color: '#2563eb', border: '1.5px solid #e3e6ee'}} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="flaticon-briefcase"></i>
                        View Job
                      </a>
                      {record.cv && record.cv.fileUrl && (
                        <a
                          href={record.cv.fileUrl}
                          className="theme-btn btn-style-three"
                          style={{fontWeight: 500, fontSize: 15, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, background: '#f5f8ff', color: '#2563eb', border: '1.5px solid #e3e6ee'}} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="flaticon-file"></i>
                          View CV
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: 600, width: '95vw'}}>
            <div className="modal-header">
              <h4>CV Match Details</h4>
              <button 
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                <i className="flaticon-close"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-header" style={{marginBottom: 18, textAlign: 'center'}}>
                <h5 style={{marginBottom: 4, fontWeight: 700, fontSize: 22}}>{selectedRecord.job?.title || selectedRecord.jobTitle}</h5>
                <div style={{fontSize: 14, color: '#888', marginBottom: 4}}>{formatDate(selectedRecord.createdAt)}</div>
              </div>
              <div className="score-section" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 18}}>
                <div className="score-badge" style={{background: getScoreColor(selectedRecord.similarityScore), fontSize: 32, width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, marginBottom: 2}}>
                  {/* Hiển thị % đúng chuẩn */}
                  {typeof selectedRecord.similarityScore === 'number' ? Math.round(selectedRecord.similarityScore * 100) + '%' : selectedRecord.similarityScore}
                </div>
                <div style={{fontSize: 16, color: getScoreColor(selectedRecord.similarityScore), fontWeight: 600}}>{getScoreText(typeof selectedRecord.similarityScore === 'number' ? selectedRecord.similarityScore * 100 : selectedRecord.similarityScore)}</div>
              </div>
              <div className="suggestions-section">
                <h5 style={{fontWeight: 700, fontSize: 18, marginBottom: 10}}>Suggestions to Improve</h5>
                {/* Xử lý suggestions là mảng string hoặc mảng object */}
                {(() => {
                  let suggestions = selectedRecord.suggestions;
                  if (typeof suggestions === 'string') {
                    try {
                      suggestions = JSON.parse(suggestions);
                    } catch (e) {
                      // Nếu không parse được thì để nguyên
                    }
                  }
                  if (Array.isArray(suggestions) && suggestions.length > 0) {
                    // Nếu là mảng string
                    if (typeof suggestions[0] === 'string') {
                      return suggestions.map((s, idx) => (
                        <div key={idx} className="suggestion-item" style={{marginBottom: 16, background: '#f8f9ff', borderRadius: 8, padding: 14, boxShadow: '0 2px 8px rgba(102,126,234,0.04)'}}>
                          <div className="suggestion-header" style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#2563eb', fontSize: 15, marginBottom: 4}}>
                            <i className="flaticon-lightbulb"></i>
                            <span>Suggestion</span>
                          </div>
                          <p className="suggestion-description" style={{margin: 0, color: '#444', fontSize: 15, lineHeight: 1.7}}>{s}</p>
                        </div>
                      ));
                    } else {
                      // Nếu là mảng object như cũ
                      return suggestions.map((suggestion, idx) => (
                        <div key={idx} className="suggestion-item" style={{marginBottom: 16, background: '#f8f9ff', borderRadius: 8, padding: 14, boxShadow: '0 2px 8px rgba(102,126,234,0.04)'}}>
                          <div className="suggestion-header" style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#2563eb', fontSize: 15, marginBottom: 4}}>
                            <i className="flaticon-lightbulb"></i>
                            <span>{suggestion.category}</span>
                          </div>
                          <p className="suggestion-description" style={{margin: 0, color: '#444', fontSize: 15, lineHeight: 1.7}}>{suggestion.description}</p>
                          {suggestion.specificActions && (
                            <ul className="suggestion-actions" style={{margin: '10px 0 0 0', paddingLeft: 18, color: '#555', fontSize: 14, lineHeight: 1.6}}>
                              {suggestion.specificActions.map((action, i) => (
                                <li key={i}><i className="flaticon-check" style={{marginRight: 6, color: '#28a745'}}></i>{action}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ));
                    }
                  } else {
                    return <div style={{color: '#888'}}>No suggestions available.</div>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

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
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
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

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .history-actions {
            flex-direction: column;
          }

          .modal-content {
            margin: 10px;
            max-height: 90vh;
          }

          .modal-header,
          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default CvMatchingHistory; 