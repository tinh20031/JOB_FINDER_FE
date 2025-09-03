"use client";
import React from "react";
import Image from "next/image";
import { useSelector } from "react-redux";

const JobHeader = ({ job, company }) => {
  const { isLoggedIn } = useSelector((state) => state.auth) || {};
  // Format ngày/tháng hoặc số ngày/tháng/năm trước
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    if (years === 1) return '1 year ago';
    return `${years} years ago`;
  };

  // Định dạng ngày/giờ: dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Lương
  const renderSalary = () => {
    if (!isLoggedIn) {
      return (
        <>
          <span style={{ filter: 'blur(4px)' }}>Login required</span>
          <a
            href="#"
            className="theme-btn btn-style-three call-modal"
            data-bs-toggle="modal"
            data-bs-target="#loginPopupModal"
            style={{ marginLeft: 10, padding: '2px 10px', fontSize: 12 }}
            onClick={(e) => e.preventDefault()}
          >
            Login to view
          </a>
        </>
      );
    }
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
              {formatDateVN(job.createdAt)}
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