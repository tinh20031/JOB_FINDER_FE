"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import jobService from "../../../../../services/jobService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500',
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#666',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#666',
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
};

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

const ProfileChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  // Lấy danh sách job cho dropdown
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let companyId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        companyId = user.companyId || user.id || user.userId;
      } catch {}
    }
    if (!companyId) return;
    jobService.getJobsByCompanyId(companyId).then((data) => {
      setJobs(data);
    });
  }, []);

  // Fetch dữ liệu chart khi filter thay đổi
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let companyId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        companyId = user.companyId || user.id || user.userId;
      } catch {}
    }
    if (!companyId) {
      setError("Không tìm thấy companyId");
      setLoading(false);
      return;
    }
    setLoading(true);
    if (selectedJob === "all") {
      // All jobs: gọi API company, filter theo thời gian
      jobService.getCompanyStatistics(companyId, formatDate(startDate), formatDate(endDate))
        .then((data) => {
          const labels = data.jobs.map((job) => job.title);
          const viewCounts = data.jobs.map((job) => job.viewCount);
          const applyCounts = data.jobs.map((job) => job.applyCount);
          setChartData({
            labels,
            datasets: [
              {
                label: "Views",
                data: viewCounts,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
              {
                label: "Applications",
                data: applyCounts,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: "#f59e0b",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
            ],
          });
          setError("");
        })
        .catch(() => setError("Error retrieving statistical data"))
        .finally(() => setLoading(false));
    } else {
      // 1 job: gọi API filter theo khoảng thời gian
      jobService
        .getJobStatisticsFiltered(
          selectedJob,
          formatDate(startDate),
          formatDate(endDate)
        )
        .then((data) => {
          const labels = data.dailyViewStats.map((d) => d.date);
          // Map view và apply theo ngày
          const viewMap = {};
          data.dailyViewStats.forEach((d) => (viewMap[d.date] = d.viewCount));
          const applyMap = {};
          data.dailyApplyStats.forEach((d) => (applyMap[d.date] = d.applyCount));
          // Đảm bảo labels đồng nhất cho cả 2 dataset
          const applyData = labels.map((date) => applyMap[date] || 0);
          const viewData = labels.map((date) => viewMap[date] || 0);
          setChartData({
            labels,
            datasets: [
              {
                label: "Views",
                data: viewData,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
              {
                label: "Applications",
                data: applyData,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: "#f59e0b",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
            ],
          });
          setError("");
        })
        .catch(() => setError("Lỗi lấy dữ liệu thống kê"))
        .finally(() => setLoading(false));
    }
  }, [selectedJob, startDate, endDate]);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="chart-container">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <span>No statistics available.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">📈 View and Application Statistics</h4>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Job Selection:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="job-select"
            >
              <option value="all">🏢 All Jobs</option>
              {jobs.map((job) => (
                <option key={job.jobId || job.id} value={job.jobId || job.id}>
                  {job.title || job.jobTitle}
                </option>
              ))}
            </select>
          </div>

          {selectedJob !== "all" && (
            <div className="date-filter-group">
              <label className="filter-label">📅 Time Period:</label>
              <div className="date-inputs">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  dateFormat="yyyy-MM-dd"
                  className="date-picker"
                  placeholderText="Start date"
                />
                <span className="date-separator">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="date-picker"
                  placeholderText="End date"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chart-content">
        <Line options={options} data={chartData} />
      </div>

      <style jsx>{`
        .chart-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chart-header {
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .chart-title {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 200px;
        }

        .date-filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .job-select {
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          background: #ffffff;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .job-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .job-select:hover {
          border-color: #cbd5e1;
        }

        .date-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .date-picker {
          padding: 10px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          background: #ffffff;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 140px;
        }

        .date-picker:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-picker:hover {
          border-color: #cbd5e1;
        }

        .date-separator {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .chart-content {
          padding: 24px;
          height: 400px;
          background: #ffffff;
        }

        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 16px;
          color: #64748b;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-state {
          color: #dc2626;
        }

        .error-icon,
        .empty-icon {
          font-size: 48px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .chart-header {
            padding: 16px 16px 0 16px;
          }

          .chart-content {
            padding: 16px;
            height: 300px;
          }

          .filter-controls {
            flex-direction: column;
            gap: 16px;
          }

          .filter-group {
            min-width: 100%;
          }

          .date-inputs {
            flex-direction: column;
            align-items: stretch;
          }

          .date-picker {
            width: 100%;
          }

          .chart-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileChart;