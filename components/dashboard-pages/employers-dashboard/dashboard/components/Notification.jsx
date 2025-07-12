import { useState, useEffect } from "react";

const jobAlerts = [
  {
    id: 1,
    type: "expiring",
    jobTitle: "Frontend Developer",
    expireDate: "2024-06-10",
    daysLeft: 2,
  },
  {
    id: 2,
    type: "upcoming",
    jobTitle: "UI/UX Designer",
    startDate: "2024-06-12",
    daysToStart: 4,
  },
  {
    id: 3,
    type: "live",
    jobTitle: "Backend Engineer",
    publishedAt: "2024-06-08",
  },
];

const Notification = () => {
  const [activeTab, setActiveTab] = useState("job");
  const [applicantAlerts, setApplicantAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobLoading, setJobLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "job") {
      setJobLoading(true);
      // Giả lập loading 500ms, hoặc thay bằng fetch API nếu có
      const timer = setTimeout(() => setJobLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "applicant") return;
    setLoading(true);
    setError("");
    // Lấy companyId từ localStorage key 'user'
    let companyId = null;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          companyId = user.companyId || user.id || user.userId;
        } catch {}
      }
    }
    if (!companyId) {
      setError("Không tìm thấy companyId");
      setLoading(false);
      return;
    }
    fetch(`/api/Application/company/${companyId}/recent-applicants`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu ứng viên");
        return res.json();
      })
      .then((data) => {
        setApplicantAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Lỗi không xác định");
        setLoading(false);
      });
  }, [activeTab]);

  // Skeleton loading cho notification
  const NotificationSkeleton = () => (
    <ul className="notification-list">
      {[...Array(5)].map((_, idx) => (
        <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="icon flaticon-briefcase" style={{ opacity: 0.3 }}></span>
          <div style={{
            background: "#e5e9ec",
            height: 16,
            width: "60%",
            borderRadius: 4,
            animation: "skeleton-loading 1.2s infinite linear alternate"
          }} />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 16, marginTop: 0 }}>
        <button
          onClick={() => setActiveTab("job")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderBottom: activeTab === "job" ? "2px solid #007bff" : "2px solid transparent",
            background: "none",
            fontWeight: activeTab === "job" ? 600 : 400,
            color: activeTab === "job" ? "#007bff" : "#333",
            cursor: "pointer",
          }}
        >
          Job Alerts
        </button>
        <button
          onClick={() => setActiveTab("applicant")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderBottom: activeTab === "applicant" ? "2px solid #007bff" : "2px solid transparent",
            background: "none",
            fontWeight: activeTab === "applicant" ? 600 : 400,
            color: activeTab === "applicant" ? "#007bff" : "#333",
            cursor: "pointer",
          }}
        >
          Applicant Alerts
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "job" && (
        jobLoading ? <NotificationSkeleton /> : (
          <ul className="notification-list">
            {jobAlerts.map((alert) => (
              <li key={alert.id}>
                <span className="icon flaticon-briefcase"></span>
                {alert.type === "expiring" && (
                  <>
                    <strong className="notification-job-title" title={alert.jobTitle}>{alert.jobTitle}</strong> is expiring soon -
                    <span className="job-alert-expiring-text"> {alert.daysLeft} days left</span>
                  </>
                )}
                {alert.type === "upcoming" && (
                  <>
                    <strong className="notification-job-title" title={alert.jobTitle}>{alert.jobTitle}</strong> will be published in
                    <span className="job-alert-upcoming-text"> {alert.daysToStart} days</span>
                  </>
                )}
                {alert.type === "live" && (
                  <>
                    <strong className="notification-job-title" title={alert.jobTitle}>{alert.jobTitle}</strong> has just been published
                    <span className="job-alert-live-text"> (now live)</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )
      )}
      {activeTab === "applicant" && (
        <div>
          {loading && <NotificationSkeleton />}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {!loading && !error && (
            <ul className="notification-list">
              {applicantAlerts.length === 0 && <li>Chưa có ứng viên nào apply gần đây.</li>}
              {applicantAlerts.map((alert, idx) => (
                <li key={alert.applicationId || `${alert.userId}-${alert.jobId}-${idx}`}>
                  <span className="icon flaticon-briefcase"></span>
                  <strong>{alert.fullName}</strong> applied for a job
                  <span className="colored"> {alert.jobTitle}</span>
                  <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
                    {alert.submittedAt ? new Date(alert.submittedAt).toLocaleString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default Notification;
