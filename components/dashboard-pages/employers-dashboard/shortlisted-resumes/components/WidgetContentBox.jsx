"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandidateAppliedJobsTable from "./CandidateAppliedJobsTable";
import { applicationService } from "@/services/applicationService";

const WidgetContentBox = ({ searchTitle = "", filterTime = "Newest" }) => {
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
            router.push(`/job-detail/${JobId}`);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  // Khi mount, đọc page từ query string
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);
  // Khi đổi trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };
  // Filter jobs theo tên job
  let filteredJobs = searchTitle.trim()
    ? jobs.filter(job => (job.Title || job.title || "").toLowerCase().includes(searchTitle.trim().toLowerCase()))
    : jobs;
  // Filter jobs theo thời gian
  if (filterTime !== "Newest") {
    const now = new Date();
    filteredJobs = filteredJobs.filter(job => {
      const appliedDate = new Date(job.SubmittedAt || job.submittedAt);
      let diff = (now - appliedDate) / (1000 * 60 * 60 * 24); // số ngày
      if (filterTime === "7d" && diff > 7) return false;
      if (filterTime === "30d" && diff > 30) return false;
      if (filterTime === "3m" && diff > 92) return false;
      if (filterTime === "6m" && diff > 183) return false;
      if (filterTime === "12m" && diff > 365) return false;
      if (filterTime === "3y" && diff > 1095) return false;
      if (filterTime === "5y" && diff > 1825) return false;
      return true;
    });
  }
  const paginatedJobs = filteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

  return (
    <div className="widget-content">
      <CandidateAppliedJobsTable jobs={paginatedJobs} loading={loading} error={error} onJobClick={handleJobClick} />
      {/* Pagination UI động */}
      {filteredJobs.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => handleSetPage(currentPage - 1)}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}
          >&#8592;</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handleSetPage(i + 1)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: currentPage === i + 1 ? '#1967d2' : 'none',
                color: currentPage === i + 1 ? '#fff' : '#444',
                border: 'none',
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                transition: 'background 0.2s, color 0.2s'
              }}
            >{i + 1}</button>
          ))}
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handleSetPage(currentPage + 1)}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}
          >&#8594;</button>
        </div>
      )}
    </div>
  );
};

export default WidgetContentBox;
