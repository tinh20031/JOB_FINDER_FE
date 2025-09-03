import React from 'react';
import Link from 'next/link';

const QuickMatchingCard = () => {
  return (
    <div className="quick-matching-card">
      <div className="card-header">
        <div className="header-icon">
          <i className="flaticon-search"></i>
        </div>
        <div className="header-content">
          <h4>Thử khớp CV</h4>
          <p>Kiểm tra độ phù hợp CV với công việc</p>
        </div>
      </div>

      <div className="card-content">
        <div className="feature-list">
          <div className="feature-item">
            <i className="flaticon-check"></i>
            <span>Phân tích độ tương đồng</span>
          </div>
          <div className="feature-item">
            <i className="flaticon-check"></i>
            <span>Gợi ý cải thiện CV</span>
          </div>
          <div className="feature-item">
            <i className="flaticon-check"></i>
            <span>Lịch sử thử khớp</span>
          </div>
        </div>

        <div className="action-buttons">
          <Link href="/job-list" className="theme-btn btn-style-one">
            <i className="flaticon-briefcase"></i>
            Tìm việc làm
          </Link>
          <Link href="/candidates-dashboard/cv-matching-history" className="theme-btn btn-style-three">
            <i className="flaticon-history"></i>
            Xem lịch sử
          </Link>
        </div>
      </div>

      <style jsx>{`
        .quick-matching-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .quick-matching-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .header-content h4 {
          margin: 0 0 4px 0;
          font-weight: 600;
          font-size: 18px;
        }

        .header-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature-item i {
          color: #4ade80;
          font-size: 16px;
        }

        .feature-item span {
          font-size: 14px;
          opacity: 0.95;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-buttons .theme-btn {
          flex: 1;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .action-buttons .btn-style-one {
          background: white;
          color: #667eea;
          border: 2px solid white;
        }

        .action-buttons .btn-style-one:hover {
          background: transparent;
          color: white;
        }

        .action-buttons .btn-style-three {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .action-buttons .btn-style-three:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 768px) {
          .quick-matching-card {
            padding: 20px;
          }

          .card-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons .theme-btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickMatchingCard; 