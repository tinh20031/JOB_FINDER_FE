import React from "react";

const JobOverView2 = ({ job, industryName, levelName, jobTypeName, experienceLevelName }) => {
  if (!job) return null;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "N/A";

  const renderSalary = () => {
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
        <h5>Experience Level:</h5>
        <span>{experienceLevelName}</span>
      </li>
      <li>
        <span className="icon icon-clock"></span>
        <h5>Start Date:</h5>
        <span>{formatDate(job.timeStart)}</span>
      </li>
      <li>
        <span className="icon icon-clock"></span>
        <h5>End Date:</h5>
        <span>{formatDate(job.timeEnd)}</span>
      </li>
      <li>
        <span className="icon icon-expiry"></span>
        <h5>Application Deadline:</h5>
        <span>{formatDate(job.expiryDate)}</span>
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
