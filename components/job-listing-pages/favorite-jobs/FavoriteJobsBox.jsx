'use client';
import React, { useEffect, useState } from "react";
import { getUserFavorites } from "../../../services/favoriteJobService";
import { jobService } from "../../../services/jobService";
import Image from "next/image";

const FavoriteJobsBox = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;

  useEffect(() => {
    const fetchFavoriteJobs = async () => {
      try {
        setLoading(true);
        const res = await getUserFavorites(userId);
        let jobsData = [];
        if (res.data.length > 0 && res.data[0].job) {
          jobsData = res.data.map(fav => fav.job);
        } else {
          jobsData = await Promise.all(res.data.map(async fav => {
            const job = await jobService.getJobById(fav.jobId);
            return job;
          }));
        }
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch favorite jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchFavoriteJobs();
  }, [userId]);

  return (
    <>
      <h3 style={{marginBottom: 24}}>Your Favorite Jobs</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : jobs.length === 0 ? (
        <div>No favorite jobs found.</div>
      ) : (
        <div className="row">
          {jobs.map((item, index) => (
            <div key={item.id || index} className="job-block col-12 mb-4">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo" style={{
                    display: 'inline-block',
                    width: 54,
                    height: 54,
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    marginRight: 18,
                    verticalAlign: 'middle',
                  }}>
                    {(() => {
                      const logoSrc = item.company?.urlCompanyLogo || '/images/company-logo/default-logo.png';
                      const companyName = item.company?.companyName || 'Company';
                      return <Image width={54} height={54} src={logoSrc} alt={companyName} style={{ objectFit: 'cover', width: 54, height: 54, display: 'block' }} />;
                    })()}
                  </span>
                  <h4>{item.jobTitle}</h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {item.company?.companyName || item.companyId}
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {item.provinceName || 'Province N/A'}
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span>
                      {item.createdAt ? (() => {
                        const diff = Math.floor((Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60));
                        return diff < 24 ? `${diff} hours ago` : `${Math.floor(diff / 24)} days ago`;
                      })() : 'N/A'}
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span>
                      {item.isSalaryNegotiable
                        ? 'Negotiable Salary'
                        : (item.minSalary && item.maxSalary
                            ? `$${item.minSalary.toLocaleString()} - $${item.maxSalary.toLocaleString()}`
                            : 'Salary N/A')}
                    </li>
                  </ul>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {item.jobType?.jobTypeName && (
                      <span style={{ background: '#e0edff', color: '#2563eb', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.jobType.jobTypeName}
                      </span>
                    )}
                    {item.industry?.industryName && (
                      <span style={{ background: '#e6f4ea', color: '#1dbf73', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.industry.industryName}
                      </span>
                    )}
                    {item.level?.levelName && (
                      <span style={{ background: '#fff4e6', color: '#ffb200', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.level.levelName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteJobsBox; 