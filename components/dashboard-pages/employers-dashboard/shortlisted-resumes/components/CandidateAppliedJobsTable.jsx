import React from "react";
import { useRouter } from "next/navigation";

// Hàm loại bỏ thẻ HTML
function stripHtmlTags(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
}

// Định dạng ngày/giờ: dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
const formatDateVN = (str) => {
  if (!str) return '';
  const dateObj = new Date(str);
  dateObj.setHours(dateObj.getHours() + 7);
  return dateObj.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const CandidateAppliedJobsTable = ({ jobs, loading, error, onJobClick }) => {
  const router = useRouter();
  // Lọc unique theo JobId hoặc jobId để tránh duplicate key
  const uniqueJobs = jobs && Array.isArray(jobs)
    ? jobs
        .filter((job, idx, arr) => {
          const id = job.JobId || job.jobId;
          return arr.findIndex(j => (j.JobId || j.jobId) === id) === idx;
        })
    : [];

  const handleViewAllApplications = (jobId) => {
            // Chuyển sang trang mới, ví dụ: /company-dashboard/all-applications-by-job?jobId=...
    router.push(`/company-dashboard/all-applications-by-job?jobId=${jobId}`);
  };

  const TableSkeleton = () => (
    <div className="table-outer">
      <table className="default-table manage-job-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Applicants</th>
            <th>Last Applied</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={"skeleton-" + idx}>
              <td colSpan={3}>
                <div className="skeleton-line long" style={{ height: 18, marginBottom: 8, borderRadius: 6 }}></div>
                <div className="skeleton-line medium" style={{ height: 14, width: '60%', borderRadius: 6 }}></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
        }
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="widget-content">
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !uniqueJobs || uniqueJobs.length === 0 ? (
        <div>No jobs found for this candidate in your company.</div>
      ) : (
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Applicants</th>
                <th>Last Applied</th>
              </tr>
            </thead>
            <tbody>
              {uniqueJobs.map((job, idx) => {
                const jobId = job.JobId || job.jobId;
                const allApplications = jobs.filter(j => (j.JobId || j.jobId) === jobId);
                // Sắp xếp theo thời gian giảm dần (mới nhất trước)
                const sortedApplications = [...allApplications].sort((a, b) => new Date(b.SubmittedAt || b.submittedAt) - new Date(a.SubmittedAt || a.submittedAt));
                // Tìm lần apply cuối cùng
                const lastApplication = sortedApplications[0] || null;
                return (
                  <tr key={jobId || `job-idx-${idx}`}
                      style={{ cursor: onJobClick ? 'pointer' : 'default' }}
                      onClick={() => onJobClick && onJobClick(jobId)}
                  >
                    <td>
                      <span style={{ fontWeight: 600 }}>{job.Title || job.title}</span>
                      <div style={{ color: '#888', fontSize: 14 }}>
                        {stripHtmlTags(job.Description || job.description)?.slice(0, 40) || 'N/A'}...
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          color: '#1967d2',
                          fontWeight: 500,
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        onClick={e => { e.stopPropagation(); handleViewAllApplications(jobId); }}
                      >
                        {allApplications.length} Applied
                      </span>
                    </td>
                    <td>
                      {lastApplication && (lastApplication.SubmittedAt || lastApplication.submittedAt)
                        ? formatDateVN(lastApplication.SubmittedAt || lastApplication.submittedAt)
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CandidateAppliedJobsTable; 