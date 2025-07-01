"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandidateAppliedJobsTable from "./CandidateAppliedJobsTable";
import { applicationService } from "@/services/applicationService";

const WidgetContentBox = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const UserId = searchParams.get("userId");
  const CompanyProfileId = searchParams.get("companyId");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      if (!UserId || !CompanyProfileId) return;
      setLoading(true);
      try {
        const jobs = await applicationService.getJobsAppliedByUserInCompany(UserId, CompanyProfileId);
        setJobs(jobs);
        setError("");
      } catch (err) {
        setError("Failed to fetch jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [UserId, CompanyProfileId]);

  const handleJobClick = (JobId) => {
    router.push(`/job-single-v3/${JobId}`);
  };

  return (
    <div className="widget-content">
      <CandidateAppliedJobsTable jobs={jobs} loading={loading} error={error} onJobClick={handleJobClick} />
      {/* Pagination giữ nguyên nếu muốn */}
      <nav className="ls-pagination mb-5">
        <ul>
          <li className="prev">
            <a href="#">
              <i className="fa fa-arrow-left"></i>
            </a>
          </li>
          <li>
            <a href="#">1</a>
          </li>
          <li>
            <a href="#" className="current-page">
              2
            </a>
          </li>
          <li>
            <a href="#">3</a>
          </li>
          <li className="next">
            <a href="#">
              <i className="fa fa-arrow-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default WidgetContentBox;
