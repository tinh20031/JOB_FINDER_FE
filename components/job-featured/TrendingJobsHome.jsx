"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { jobService } from "../../services/jobService";
import ClickableBox from "../common/ClickableBox";

const TrendingJobsHome = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchTrendingJobs = async () => {
      try {
        setLoading(true);
        // Fetch companies data
        const companiesRes = await jobService.getCompanies().catch(err => {
          console.error('Failed to fetch companies data in TrendingJobsHome', err);
          return [];
        });
        setCompanies(companiesRes);

        // Gọi API trending jobs
        const response = await jobService.getTrendingJobs({ role: "candidate", page: 1, pageSize: 6 });
        const trendingJobs = response.jobs || [];
        // Map về format giống JobFeatured1
        const mappedJobs = trendingJobs.map(job => ({
          id: job.jobId || job.id,
          jobTitle: job.title || job.jobTitle,
          companyId: job.companyId,
          companyName: job.company?.companyName || "N/A",
          provinceName: job.provinceName || "N/A",
          salary: job.isSalaryNegotiable ? "Negotiable" : (job.minSalary && job.maxSalary ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}` : "N/A"),
          industryName: job.industry?.industryName,
          jobTypeName: job.jobType?.jobTypeName,
          experienceLevelName: job.level?.levelName,
        }));
        setJobs(mappedJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching trending jobs:', err);
        setError('Failed to fetch trending jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingJobs();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="text-center py-5">No trending jobs available</div>;
  }

  return (
    <>
      {jobs.map((item) => (
        <div className="col-lg-6 col-md-12 col-sm-12" key={item.id}>
                          <ClickableBox onClick={() => window.location.href = `/job-detail/${item.id}` }>
            <div className="content">
              <span className="company-logo">
                {(() => {
                  const company = companies.find(c => c.id === item.companyId);
                  const logoSrc = company?.logo || '/images/resource/company-logo/default-logo.png';
                  const companyName = company?.name || 'Company Logo';
                  return (
                    <Image
                      width={50}
                      height={49}
                      src={logoSrc}
                      alt={companyName}
                    />
                  );
                })()}
              </span>
              <h4>
                <Link href={`/job-detail/${item.id}`}>{item.jobTitle}</Link>
              </h4>

              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {item.companyName}
                </li>
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {item.provinceName}
                </li>
                <li>
                  <span className="icon flaticon-money"></span>
                  {item.salary}
                </li>
              </ul>

              <ul className="job-other-info">
                {item.industryName && (
                  <li className="time">{item.industryName}</li>
                )}
                {item.jobTypeName && (
                  <li className="privacy">{item.jobTypeName}</li>
                )}
                {item.experienceLevelName && (
                  <li className="required">{item.experienceLevelName}</li>
                )}
              </ul>

              <button className="bookmark-btn" onClick={e => e.stopPropagation()}>
                <span className="flaticon-bookmark"></span>
              </button>
            </div>
          </ClickableBox>
        </div>
      ))}
    </>
  );
};

export default TrendingJobsHome; 