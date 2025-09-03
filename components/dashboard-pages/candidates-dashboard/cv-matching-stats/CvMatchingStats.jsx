import React, { useState, useEffect } from 'react';
import { cvMatchingService } from '@/services/cvMatchingService';
import { toast } from 'react-toastify';

const CvMatchingStats = () => {
  const [stats, setStats] = useState({
    totalMatches: 0,
    averageScore: 0,
    bestScore: 0,
    recentMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Mock data - trong thực tế sẽ gọi API
      const mockStats = {
        totalMatches: 15,
        averageScore: 72.5,
        bestScore: 89.2,
        recentMatches: 3
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
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

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="cv-matching-stats">
      <div className="stats-header">
      <h4>CV matching statistics</h4>
      <p>Overview of your CV matching performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="flaticon-search"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalMatches}</h3>
            <p>Total number of matches</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="flaticon-chart"></i>
          </div>
          <div className="stat-content">
            <h3 style={{ color: getScoreColor(stats.averageScore) }}>
              {stats.averageScore.toFixed(1)}%
            </h3>
            <p>Average score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="flaticon-trophy"></i>
          </div>
          <div className="stat-content">
            <h3 style={{ color: getScoreColor(stats.bestScore) }}>
              {stats.bestScore.toFixed(1)}%
            </h3>
            <p>Highest score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="flaticon-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.recentMatches}</h3>
            <p>Try recent matches</p>
          </div>
        </div>
      </div>

      <div className="stats-insights">
        <h5>Comment</h5>
        <div className="insights-content">
          {stats.averageScore >= 80 ? (
            <div className="insight positive">
              <i className="flaticon-check"></i>
              <div>
              <strong>Excellent!</strong>
              <p>Your CV is highly relevant to the job. Keep up the good work!</p>
              </div>
            </div>
          ) : stats.averageScore >= 60 ? (
            <div className="insight neutral">
              <i className="flaticon-info"></i>
              <div>
              <strong>Fair</strong>
              <p>Your CV has an average level of relevance. There is room for improvement to increase your chances.</p>
              </div>
            </div>
          ) : (
            <div className="insight negative">
              <i className="flaticon-warning"></i>
              <div>
              <strong>Needs Improvement</strong>
              <p>Your CV needs to be optimized to increase its relevance to jobs.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cv-matching-stats {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stats-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .stats-header h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .stats-header p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .stat-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .stats-insights {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .stats-insights h5 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .insights-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insight {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          background: white;
        }

        .insight.positive {
          border-left: 4px solid #28a745;
        }

        .insight.neutral {
          border-left: 4px solid #ffc107;
        }

        .insight.negative {
          border-left: 4px solid #dc3545;
        }

        .insight i {
          font-size: 20px;
          margin-top: 2px;
        }

        .insight.positive i {
          color: #28a745;
        }

        .insight.neutral i {
          color: #ffc107;
        }

        .insight.negative i {
          color: #dc3545;
        }

        .insight strong {
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .insight p {
          margin: 0;
          color: #495057;
          line-height: 1.5;
        }

        .stats-loading {
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

        @media (max-width: 768px) {
          .cv-matching-stats {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .stat-content h3 {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CvMatchingStats; 