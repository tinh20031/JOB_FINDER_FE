'use client';
import React, { useEffect, useState } from "react";
import { getUserFavorites, removeFavoriteJob } from "../../../services/favoriteJobService";
import { jobService } from "../../../services/jobService";
import Image from "next/image";
import { useFavoriteJobs } from "../../../contexts/FavoriteJobsContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addSalary,
  addSort,
  addTag,
  clearJobType,
} from "../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearExperienceToggle,
  clearJobTypeToggle,
} from "../../../features/job/jobSlice";

const FavoriteJobsBox = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;
  const { updateFavoriteJobs, favoriteJobIds } = useFavoriteJobs();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [jobsPerPage, setJobsPerPage] = useState(8);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

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

  // Lấy filter từ Redux
  const { jobList, jobSort } = useSelector((state) => state.filter);
  const { keyword, location, destination, category, jobType, datePosted, experience, salary, tag } = jobList || {};
  const { sort } = jobSort;

  // Các hàm filter giống FilterJobsBox
  const keywordFilter = (item) => keyword ? item.jobTitle?.toLowerCase().includes(keyword.toLowerCase()) : true;
  const locationFilter = (item) => location ? item?.provinceName?.toLowerCase().includes(location.toLowerCase()) || item?.location?.toLowerCase().includes(location.toLowerCase()) : true;
  const categoryFilter = (item) => category ? String(item?.industryId) === String(category) : true;
  const jobTypeFilter = (item) => jobType?.length ? jobType.includes(item.jobTypeId) : true;
  const datePostedFilter = (item) => {
    if (!datePosted || datePosted === "all") return true;
    const now = new Date();
    const created = new Date(item.createdAt);
    switch (datePosted) {
      case "last-hour":
        return (now - created) <= 60 * 60 * 1000;
      case "last-24-hour":
        return (now - created) <= 24 * 60 * 60 * 1000;
      case "last-7-days":
        return (now - created) <= 7 * 24 * 60 * 60 * 1000;
      case "last-14-days":
        return (now - created) <= 14 * 24 * 60 * 60 * 1000;
      case "last-30-days":
        return (now - created) <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  };
  const experienceFilter = (item) => experience?.length ? experience.includes(item.experienceLevelId) : true;
  const salaryFilter = (item) => salary?.min === 0 && salary?.max === 20000 ? true : item.minSalary >= salary?.min && item.maxSalary <= salary?.max;
  const tagFilter = (item) => tag ? String(item?.industryId) === String(tag) : true;
  const sortFilter = (a, b) => {
    if (sort === "CreatedAtDesc") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "CreatedAtAsc") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  };

  // Lọc danh sách job yêu thích trước khi phân trang
  const filteredJobs = jobs
    .filter(keywordFilter)
    .filter(locationFilter)
    .filter(categoryFilter)
    .filter(jobTypeFilter)
    .filter(datePostedFilter)
    .filter(experienceFilter)
    .filter(salaryFilter)
    .filter(tagFilter)
    .sort(sortFilter);

  // Đảm bảo dùng jobsPerPage thay cho số cứng khi phân trang
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage-1)*jobsPerPage, currentPage*jobsPerPage);

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

  return (
    <>
      <h3 style={{marginBottom: 24}}>Your Favorite Jobs</h3>
      <div className="ls-switcher" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="show-result">
          Show <strong>{paginatedJobs.length}</strong> of <strong>{filteredJobs.length}</strong> jobs
        </div>
        <div className="sort-by" style={{ display: "flex", gap: 8 }}>
          {(keyword !== "" ||
            location !== "" ||
            destination?.min !== 0 ||
            destination?.max !== 100 ||
            category !== "" ||
            jobType?.length !== 0 ||
            datePosted !== "" ||
            experience?.length !== 0 ||
            salary?.min !== 0 ||
            salary?.max !== 20000 ||
            tag !== "" ||
            sort !== "" ||
            currentPage !== 1 ||
            jobsPerPage !== 8) ? (
            <button
              onClick={() => {
                dispatch(addKeyword(""));
                dispatch(addLocation(""));
                dispatch(addDestination({ min: 0, max: 100 }));
                dispatch(addCategory(""));
                dispatch(clearJobType());
                dispatch(clearJobTypeToggle());
                dispatch(addDatePosted(""));
                dispatch(clearDatePostToggle());
                dispatch(clearExperience());
                dispatch(clearExperienceToggle());
                dispatch(addSalary({ min: 0, max: 20000 }));
                dispatch(addTag(""));
                dispatch(addSort(""));
                setCurrentPage(1);
                setJobsPerPage(8);
              }}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            value={sort}
            className="chosen-single form-select"
            onChange={(e) => {
              dispatch(addSort(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="">Sort by (default)</option>
            <option value="CreatedAtAsc">Newest</option>
            <option value="CreatedAtDesc">Oldest</option>
          </select>
        </div>
      </div>
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
        <>
        <div className="row">
          {paginatedJobs.map((item, index) => (
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
                      let logoSrc = item.company?.urlCompanyLogo;
                      if (
                        !logoSrc ||
                        typeof logoSrc !== "string" ||
                        logoSrc.trim().toLowerCase() === "string" ||
                        logoSrc.trim() === "" ||
                        !(logoSrc.startsWith("/") || logoSrc.startsWith("http"))
                      ) {
                        logoSrc = "/images/company-logo/default-logo.png";
                      }
                      const companyName = item.company?.companyName || 'Company';
                      return <Image width={54} height={54} src={logoSrc} alt={companyName} style={{ objectFit: 'cover', width: 54, height: 54, display: 'block' }} />;
                    })()}
                  </span>
                  <h4>
                    <Link href={`/job-detail/${item.id}`}>{item.jobTitle}</Link>
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
                title="Remove from favorites"
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
        {/* Pagination UI */}
        {jobs.length > 0 && (
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
        </>
      )}
    </>
  );
};

export default FavoriteJobsBox; 