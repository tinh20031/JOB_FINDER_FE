import React from "react";
import Image from "next/image";

const JobHeader = ({ job, company }) => {
  // Format ngày/tháng hoặc số ngày/tháng/năm trước
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hôm nay';
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    const years = Math.floor(months / 12);
    return `${years} năm trước`;
  };

  // Lương
  const renderSalary = () => {
    if (job.isSalaryNegotiable) return "Negotiable Salary";
    if (job.minSalary && job.maxSalary)
      return `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`;
    if (job.minSalary) return `$${job.minSalary.toLocaleString()}+`;
    if (job.maxSalary) return `Up to $${job.maxSalary.toLocaleString()}`;
    return "Unknown";
  };

  // Tag loại hình
  const jobTypeTag = job.jobTypeName ? (
    <ul className="job-other-info">
      <li className="parttime-tag">{job.jobTypeName}</li>
    </ul>
  ) : null;

  return (
    <div className="job-block-seven style-two" style={{marginBottom: 32}}>
      <div className="inner-box">
        <div className="content">
          <h4>{job.title}</h4>
          <ul className="job-info">
            <li>
              <span className="icon flaticon-briefcase"></span>
              {company?.companyName || "N/A"}
            </li>
            <li>
              <span className="icon flaticon-map-locator"></span>
              {job.addressDetail ? `${job.addressDetail}, ` : ""}{job.provinceName}
            </li>
            <li>
              <span className="icon flaticon-clock-3"></span>
              {formatDate(job.createdAt)}
            </li>
            <li>
              <span className="icon flaticon-money"></span>
              {renderSalary()}
            </li>
          </ul>
          {jobTypeTag}
        </div>
      </div>
    </div>
  );
};

export default JobHeader; 