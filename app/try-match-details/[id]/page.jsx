"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ApiService from "@/services/api.service";
import MainHeader from "@/components/header/MainHeader";
import DashboardCandidatesSidebar from "@/components/header/DashboardCandidatesSidebar";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import MobileMenu from "@/components/header/MobileMenu";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";
import { useRouter } from "next/navigation";
import notificationHubService from "@/services/notificationHub";

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

export default function TryMatchDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await ApiService.get(`/application/try-match-details/${id}`);
        // Lấy đúng trường data, kiểm tra success/Success
        const result = res.data || res.Data || res.result || res;
        if (res.success || res.Success) setData(result);
        else setError(res.errorMessage || res.ErrorMessage || "Not found");
      } catch (e) {
        setError(e?.message || "Failed to load detail");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();

    // Lắng nghe notification real-time + polling lại sau notification
    let token = null;
    let userId = null;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token || user.accessToken;
          userId = user.id || user.userId;
        } catch {}
      }
    }
    if (token && userId) {
      notificationHubService.start(token, userId, (notification) => {
        if (notification && (String(notification.tryMatchId) === String(id) || String(notification.TryMatchId) === String(id))) {
          fetchDetail(); // Gọi ngay khi nhận notification
          setTimeout(fetchDetail, 1500); // Gọi lại sau 1.5s để chắc chắn lấy được data mới nhất
        }
      });
      // Không stop notificationHubService ở đây nếu đã được start ở layout/header
    }
  }, [id]);

  const getStatusColor = (status) => {
    if (status === "Completed") return "#28a745";
    if (status === "Processing") return "#2563eb";
    if (status === "Failed") return "#dc3545";
    return "#888";
  };

  if (loading) return <div className="trymatch-detail-loading">Loading...</div>;
  if (error) return <div className="trymatch-detail-error">{error}</div>;
  if (!data) return <div className="trymatch-detail-empty">No detail found for this try-match record.</div>;

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <MainHeader />
      <MobileMenu />
      <DashboardCandidatesSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="CV Match Detail" />
          <div className="row">
            <div className="col-lg-12">
              {/* Card detail giữ nguyên như cũ */}
              <div className="trymatch-detail-wrapper">
                <div className="trymatch-detail-card">
                  <button className="back-btn" onClick={() => router.push('/candidates-dashboard/cv-matching-history')}>
                    <i className="flaticon-left-arrow" style={{marginRight:6}}></i> Back to History
                  </button>
                  <div className="trymatch-header-row">
                    <h2 className="trymatch-title">{data.jobTitle || "Job"}</h2>
                    <span className={`status-badge status-${data.status?.toLowerCase() || ''}`}>{data.status}</span>
                  </div>
                  <div className="trymatch-meta">
                    <span>Matched at: {data.createdAt ? formatDate(data.createdAt) : "-"}</span>
                  </div>
                  {data.similarityScore !== null && data.similarityScore !== undefined && (
                    <div className="trymatch-score-section">
                      <div className="score-label">Similarity Score</div>
                      <div className="score-circle" style={{ background: Math.round(data.similarityScore) >= 50 ? '#28a745' : '#e53935' }}>
                        <span>{Math.round(data.similarityScore)}</span>
                      </div>
                    </div>
                  )}
                  {data.status === "Failed" && (
                    <div className="trymatch-error-section">
                      <i className="flaticon-close"></i>
                      {data.errorMessage || "Processing failed."}
                    </div>
                  )}
                  {data.suggestions && data.suggestions.length > 0 && (
                    <div className="trymatch-suggestions-section">
                      <div className="suggestions-title">Suggestions</div>
                      <ul className="suggestions-list">
                        {data.suggestions.map((s, idx) => (
                          <li key={idx}><i className="flaticon-lightbulb"></i> <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} /></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="trymatch-links">
                    {data.cvFileUrl && (
                      <a href={data.cvFileUrl} target="_blank" rel="noopener noreferrer" className="theme-btn btn-style-three">View CV</a>
                    )}
                    {data.jobId && (
                      <a href={`/job-detail/${data.jobId}`} target="_blank" rel="noopener noreferrer" className="theme-btn btn-style-three">View Job</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CopyrightFooter />
      <style jsx>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          background: #f5f8ff;
          color: #2563eb;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          padding: 8px 18px;
          margin-bottom: 18px;
          margin-left: 0;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .back-btn:hover {
          background: #e3f2fd;
          color: #1976d2;
        }
        .trymatch-detail-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 60vh;
          background: #f8fafd;
          padding: 32px 0;
        }
        .trymatch-detail-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(102,126,234,0.13);
          padding: 36px 48px 28px 48px;
          max-width: 100%;
          width: 100%;
          margin: 0 auto;
        }
        .trymatch-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .trymatch-title {
          margin: 0;
          font-weight: 700;
          font-size: 22px;
          color: #222;
          flex: 1;
        }
        .status-badge {
          margin-left: 16px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 18px;
          border-radius: 8px;
          min-width: 90px;
          text-align: center;
          background: #f5f8ff;
          color: #2563eb;
        }
        .status-badge.status-completed {
          background: #e6f9ea;
          color: #219653;
        }
        .status-badge.status-processing {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status-badge.status-failed {
          background: #ffebee;
          color: #c62828;
        }
        .trymatch-meta {
          margin: 2px 0 18px 0;
          color: #888;
          font-size: 13px;
        }
        .trymatch-score-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 22px;
        }
        .score-label {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
          color: #444;
        }
        .score-circle {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
        }
        .trymatch-error-section {
          color: #dc3545;
          font-weight: 600;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trymatch-suggestions-section {
          margin-bottom: 18px;
        }
        .suggestions-title {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .suggestions-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 8px 32px;
          padding-left: 0;
          color: #444;
          font-size: 14px;
          list-style: none;
        }
        .suggestions-list li {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .suggestions-list li i {
          color: #ffc107;
          font-size: 18px;
        }
        .trymatch-links {
          display: flex;
          gap: 16px;
          margin-top: 22px;
        }
        @media (max-width: 900px) {
          .trymatch-detail-card { padding: 18px 6px; }
          .suggestions-list { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .trymatch-detail-card { padding: 8px 2px; }
          .trymatch-title { font-size: 15px; }
          .score-circle { width: 44px; height: 44px; font-size: 15px; }
        }
      `}</style>
    </div>
  );
} 