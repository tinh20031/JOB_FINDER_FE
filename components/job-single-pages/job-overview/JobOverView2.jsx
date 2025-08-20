"use client";
import React from "react";
import { useSelector } from "react-redux";

const JobOverView2 = ({ job, industryName, levelName, jobTypeName }) => {
  if (!job) return null;
  const { isLoggedIn } = useSelector((state) => state.auth) || {};

  // Định dạng ngày/giờ: dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDateVN = (dateStr) => {
    if (!dateStr) return 'N/A';
    const dateObj = new Date(dateStr);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
            onClick={(e) => {
              e.preventDefault();
              const modalEl = document.getElementById('loginPopupModal');
              if (modalEl && typeof window !== 'undefined') {
                try {
                  const Modal = window.bootstrap && window.bootstrap.Modal;
                  if (Modal) {
                    Modal.getOrCreateInstance(modalEl).show();
                  } else {
                    modalEl.classList.add('show');
                    modalEl.style.display = 'block';
                    modalEl.removeAttribute('aria-hidden');
                  }
                } catch {}
              }
            }}
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

  return (
    <ul className="job-overview-list">
      <li>
        <span className="icon icon-user-2"></span>
        <h5>Industry:</h5>
        <span>{industryName}</span>
      </li>
      <li>
        <span className="icon icon-user-2"></span>
        <h5>Level:</h5>
        <span>{levelName}</span>
      </li>
      <li>
        <span className="icon icon-user-2"></span>
        <h5>Number of positions:</h5>
        <span>{job.quantity}</span>
      </li>
      <li>
        <span className="icon icon-clock"></span>
        <h5>Start Date:</h5>
        <span>{formatDateVN(job.timeStart)}</span>
      </li>
      <li>
        <span className="icon icon-clock"></span>
        <h5>End Date:</h5>
        <span>{formatDateVN(job.timeEnd)}</span>
      </li>
      <li>
        <span className="icon icon-expiry"></span>
        <h5>Application Deadline:</h5>
        <span>{formatDateVN(job.expiryDate)}</span>
      </li>
      <li>
        <span className="icon icon-salary"></span>
        <h5>Salary:</h5>
        <span>{renderSalary()}</span>
      </li>
      <li className="address-item">
        <span className="icon icon-location"></span>
        <h5>Address:</h5>
        <span>
          {job.addressDetail
            ? `${job.addressDetail}, ${job.provinceName}`
            : job.provinceName}
        </span>
      </li>
    </ul>
  );
};

export default JobOverView2;
