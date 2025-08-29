"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import ClickableBox from "../../../../common/ClickableBox";
import { jobService } from "@/services/jobService";

const JobApplied = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndLookups = async () => {
      try {
        const [response, companiesRes, jobTypesRes, industriesRes, levelsRes] = await Promise.all([
          applicationService.getAppliedJobs(),
          jobService.getCompanies(),
          jobService.getJobTypes(),
          jobService.getIndustries(),
          jobService.getExperienceLevels(),
        ]);
        // response là mảng application, mỗi application có thể có trường job hoặc jobId
        // Lấy ra các job, loại trùng lặp theo jobId
        const jobMap = {};
        response.forEach(app => {
          const job = app.job || app;
          if (job && job.jobId && !jobMap[job.jobId]) {
            jobMap[job.jobId] = job;
          }
        });
        const jobsArr = Object.values(jobMap).slice(0, 6);
        setJobs(jobsArr);
        setCompanies(companiesRes);
        setJobTypes(jobTypesRes);
        setIndustries(industriesRes);
        setLevels(levelsRes);
      } catch (err) {
        setJobs([]);
        setCompanies([]);
        setJobTypes([]);
        setIndustries([]);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobsAndLookups();
  }, []);

  // Helper: lấy logo và tên công ty giống FilterJobsBox
  const getCompanyInfo = (item) => {
    const company = companies.find((c) => Number(c.id) === Number(item.companyId));
    return {
      logoSrc:
        company?.logo ||
        item.company?.urlCompanyLogo ||
        "/images/company-logo/default-logo.png",
      companyName: company?.name || item.company?.companyName || "Company",
    };
  };

  // Helper: lấy tên từ ID nếu object không có
  const getJobTypeName = (item) => {
    if (item.jobType?.jobTypeName) return item.jobType.jobTypeName;
    if (item.jobTypeId) {
      const jt = jobTypes.find(j => j.id === item.jobTypeId);
      return jt?.jobTypeName || null;
    }
    return null;
  };
  const getIndustryName = (item) => {
    if (item.industry?.industryName) return item.industry.industryName;
    if (item.industryId) {
      const ind = industries.find(i => i.industryId === item.industryId);
      return ind?.industryName || null;
    }
    return null;
  };
  const getLevelName = (item) => {
    if (item.level?.levelName) return item.level.levelName;
    if (item.levelId) {
      const lv = levels.find(l => l.id === item.levelId);
      return lv?.name || null;
    }
    return null;
  };

  if (loading) return (
    <div className="row">
      {[...Array(3)].map((_, idx) => (
        <div className="job-block col-lg-6 col-md-12 col-sm-12" key={idx}>
          <div className="content" style={{ minHeight: 120, position: 'relative', padding: 24 }}>
            <div
              className="skeleton"
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                marginBottom: 16,
                display: 'inline-block',
                marginRight: 18,
                verticalAlign: 'middle',
              }}
            />
            <div
              className="skeleton"
              style={{ width: '60%', height: 24, marginBottom: 12, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: '40%', height: 16, marginBottom: 8, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: '80%', height: 16, marginBottom: 8, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: '30%', height: 16, marginBottom: 8, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                position: 'absolute',
                right: 20,
                top: 20,
              }}
            />
          </div>
        </div>
      ))}
      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
        }
        @keyframes skeleton-loading {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </div>
  );
  if (!jobs.length) return <div>No jobs applied yet.</div>;

  return (
    <>
      {jobs.map((item) => {
        const { logoSrc, companyName } = getCompanyInfo(item);
        const jobTypeName = getJobTypeName(item);
        const industryName = getIndustryName(item);
        const levelName = getLevelName(item);
        return (
          <ClickableBox
            key={item.jobId || item.id}
                            onClick={() => window.location.href = `/job-detail/${item.jobId || item.id}`}
            className="job-block col-lg-6 col-md-12 col-sm-12"
          >
            <div className="content">
              <span
                className="company-logo"
                style={{
                  display: "inline-block",
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  marginRight: 18,
                  verticalAlign: "middle",
                }}
              >
                <Image
                  width={54}
                  height={54}
                  src={logoSrc}
                  alt={companyName}
                  style={{
                    objectFit: "cover",
                    width: 54,
                    height: "auto",
                    display: "block",
                  }}
                />
              </span>
              <h4>
                <Link href={`/job-detail/${item.jobId || item.id}`}>
                  {item.jobTitle || item.title}
                </Link>
              </h4>
              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {companyName}
                </li>
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {item.provinceName || item.location || "Province N/A"}
                </li>
              </ul>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                {/* Job Type Tag */}
                {jobTypeName && (
                  <span
                    style={{
                      background: "#e0edff",
                      color: "#2563eb",
                      borderRadius: 16,
                      padding: "4px 16px",
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {jobTypeName}
                  </span>
                )}
                {/* Industry Tag */}
                {industryName && (
                  <span
                    style={{
                      background: "#e6f4ea",
                      color: "#1dbf73",
                      borderRadius: 16,
                      padding: "4px 16px",
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {industryName}
                  </span>
                )}
                {/* Level Tag */}
                {levelName && (
                  <span
                    style={{
                      background: "#fff4e6",
                      color: "#ffb200",
                      borderRadius: 16,
                      padding: "4px 16px",
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {levelName}
                  </span>
                )}
              </div>
              <button
                className="bookmark-btn"
                onClick={e => e.stopPropagation()}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  transition: "all 0.3s ease",
                  color: "#666",
                }}
              >
                <span
                  className="flaticon-bookmark"
                  style={{
                    fontSize: "24px",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                ></span>
              </button>
            </div>
          </ClickableBox>
        );
      })}
    </>
  );
};

export default JobApplied;
