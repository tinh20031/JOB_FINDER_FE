"use client";

import Link from "next/link";
import Image from "next/image.js";
import { useEffect, useState } from "react";
import { jobService } from "../../../../../services/jobService";
import { useRouter } from "next/navigation";
import "./JobListingsTable.css";

const JobListingsTable = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        setCurrentUserId(userId);

        // Fetch all required data in parallel
        const [
          jobsResponse,
          companiesResponse,
        ] = await Promise.all([
          jobService.getJobs(),
          jobService.getCompanies(),
        ]);

        console.log('Raw jobs data from API:', jobsResponse.data);

        // Filter jobs for current company
        const filteredJobs = jobsResponse.data.filter(job => job.companyId === parseInt(userId));
        setJobs(filteredJobs);

        // Set companies data
        const companiesMap = companiesResponse.reduce((acc, company) => {
          acc[company.id] = company.name;
          return acc;
        }, {});
        setCompanies(companiesMap);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewJob = (jobId) => {
    router.push(`/job-single-v3/${jobId}`);
  };

  const formatDateVN = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  const handleEditClick = (job) => {
    router.push(`/dashboard/employers-dashboard/edit-job/${job.id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUserId) {
    return <div>Please login to view your jobs</div>;
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Job Listings</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Applicants</th>
                <th>Created & Expired</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    {/* <!-- Job Block --> */}
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content">
                          <h4>
                            <Link href={`/job-single-v3/${job.id}`}>
                              {job.jobTitle}
                            </Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-briefcase"></span>
                              {companies[job.companyId] || 'Unknown Company'}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>
                              {job.location}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="applied">
                    <Link href={`/employers-dashboard/all-applicants?jobId=${job.id}`}>
                      View Applied
                    </Link>
                  </td>
                  <td>
                    {formatDateVN(job.timeStart)} <br />
                    {formatDateVN(job.timeEnd)}
                  </td>
                  <td className="status">
                    {job.status === 0 ? (
                      <span className="status-pending">Pending</span>
                    ) : job.status === 1 ? (
                      <span className="status-active">Approved</span>
                    ) : job.status === 2 ? (
                      <span className="status-inactive">Rejected</span>
                    ) : (
                      <span className="status-unknown">Unknown</span>
                    )}
                  </td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button 
                            onClick={() => handleViewJob(job.id)}
                            data-text="View Job"
                          >
                            <span className="la la-eye"></span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleEditClick(job)}
                            data-text="Edit Job"
                          >
                            <span className="la la-pencil"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobListingsTable;
