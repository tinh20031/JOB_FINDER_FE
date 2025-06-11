import React from "react";

const JobOverView2 = ({ job, industryName, levelName, jobTypeName, experienceLevelName }) => {
  if (!job) return null;

  console.log("JobOverView2 - job.addressDetail:", job.addressDetail);

  return (
    <ul>
      <li>
        <i className="icon icon-salary"></i>
        <h5>Salary:</h5>
        <span>{job.salary}</span>
      </li>
      <li>
        <i className="icon icon-briefcase"></i>
        <h5>Industry:</h5>
        <span>{industryName}</span>
      </li>
      <li>
        <i className="icon icon-level"></i>
        <h5>Level:</h5>
        <span>{levelName}</span>
      </li>
      <li>
        <i className="icon icon-type"></i>
        <h5>Job Type:</h5>
        <span>{jobTypeName}</span>
      </li>
      <li>
        <i className="icon icon-experience"></i>
        <h5>Experience Level:</h5>
        <span>{experienceLevelName}</span>
      </li>
      <li>
        <i className="icon icon-expiry"></i>
        <h5>Application Deadline:</h5>
        <span>{job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : 'N/A'}</span>
      </li>
      <li>
        <i className="icon icon-clock"></i>
        <h5>Start Date:</h5>
        <span>{job.timeStart ? new Date(job.timeStart).toLocaleDateString() : 'N/A'}</span>
      </li>
      <li>
        <i className="icon icon-clock"></i>
        <h5>End Date:</h5>
        <span>{job.timeEnd ? new Date(job.timeEnd).toLocaleDateString() : 'N/A'}</span>
      </li>
      <li>
        <i className="icon icon-location"></i>
        <h5>Location:</h5>
        <span>{job.provinceName}</span>
      </li>
      <li>
        <i className="icon icon-location"></i>
        <h5>Address:</h5>
        <span>{job.addressDetail}</span>
      </li>
      <li>
        <i className="icon icon-calendar"></i>
        <h5>Date Posted:</h5>
        <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
      </li>
    </ul>
  );
};

export default JobOverView2;
