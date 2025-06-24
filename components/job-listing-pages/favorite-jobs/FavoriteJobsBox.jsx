'use client';
import React, { useEffect, useState } from "react";
import { getUserFavorites, removeFavoriteJob } from "../../../services/favoriteJobService";
import { jobService } from "../../../services/jobService";
import Image from "next/image";
import { useFavoriteJobs } from "../../../contexts/FavoriteJobsContext";
import Link from "next/link";

const FavoriteJobsBox = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;
  const { updateFavoriteJobs, favoriteJobIds } = useFavoriteJobs();

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

  const handleUnfavorite = async (jobId) => {
    try {
      await removeFavoriteJob(userId, jobId);
      updateFavoriteJobs(favoriteJobIds.filter(id => id !== jobId));
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <>
      <h3 style={{marginBottom: 24}}>Your Favorite Jobs</h3>
      {loading ? (
        <>
          <div className="row">
            {[...Array(6)].map((_, idx) => (
              <div className="job-block col-12 mb-4" key={idx}>
                <div className="inner-box" style={{ minHeight: 180, position: 'relative', padding: 24 }}>
                  <div className="skeleton" style={{ width: 54, height: 53, borderRadius: 8, marginBottom: 16 }} />
                  <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 12 }} />
                  <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '80%', height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '30%', height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', position: 'absolute', right: 20, top: 20 }} />
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            .skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
              background-size: 400% 100%;
              animation: skeleton-loading 1.4s ease infinite;
            }
            @keyframes skeleton-loading {
              0% { background-position: 100% 50%; }
              100% { background-position: 0 50%; }
            }
          `}</style>
        </>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : jobs.length === 0 ? (
        <div>No favorite jobs found.</div>
      ) : (
        <div className="row">
          {jobs.map((item, index) => (
            <div key={item.id || index} className="job-block col-12 mb-4" style={{ position: 'relative' }}>
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
                  <h4>
                    <Link href={`/job-single-v3/${item.id}`}>{item.jobTitle}</Link>
                  </h4>
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
              <button
                className={`bookmark-btn ${(favoriteJobIds || []).includes(item.id) ? 'active' : ''}`}
                onClick={() => handleUnfavorite(item.id)}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  transition: 'all 0.3s ease',
                  color: (favoriteJobIds || []).includes(item.id) ? '#2563eb' : '#666',
                }}
                title="Bỏ yêu thích"
              >
                {(favoriteJobIds || []).includes(item.id) ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#2563eb"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  >
                    <path d="M6 2a2 2 0 0 0-2 2v18l8-5.333L20 22V4a2 2 0 0 0-2-2H6z"/>
                  </svg>
                ) : (
                  <span className="flaticon-bookmark" style={{ fontSize: '24px', display: 'inline-block', verticalAlign: 'middle' }}></span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteJobsBox; 