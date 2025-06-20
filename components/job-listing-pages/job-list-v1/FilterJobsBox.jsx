'use client'


import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addPerPage,
  addSalary,
  addSort,
  addTag,
  clearExperience,
  clearJobType,
} from "../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearExperienceToggle,
  clearJobTypeToggle,
} from "../../../features/job/jobSlice";
import Image from "next/image";
import { jobService } from "../../../services/jobService";
import { toast } from "react-toastify";
import "./FilterJobsBox.css"; // Thêm import CSS
import { useSearchParams } from 'next/navigation';
import { getUserFavorites, addFavoriteJob, removeFavoriteJob } from '../../../services/favoriteJobService';
import { useFavoriteJobs } from '../../../contexts/FavoriteJobsContext';

// Thêm CSS styles
const styles = {
  bookmarkBtn: {
    position: 'absolute',
    right: '20px',
    top: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    transition: 'all 0.3s ease',
  },
  bookmarkBtnActive: {
    color: '#ff5a5f',
  },
  bookmarkIcon: {
    fontSize: '20px',
  }
};

const FilterJobsBox = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [displayCount, setDisplayCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Thêm state để lưu dữ liệu lookup
  const [companies, setCompanies] = useState([]);
  const [jobTypesData, setJobTypesData] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [industries, setIndustries] = useState([]);

  const { jobList, jobSort } = useSelector((state) => state.filter);
  const {
    keyword,
    location,
    destination,
    category,
    jobType,
    datePosted,
    experience,
    salary,
    tag,
  } = jobList || {};

  const { sort } = jobSort;
  const dispatch = useDispatch();

  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  const searchParams = useSearchParams();
  const industryId = searchParams.get('industryId');
  const provinceName = searchParams.get('provinceName');
  const levelId = searchParams.get('levelId');
  const jobTypeId = searchParams.get('jobTypeId');
  const experienceLevelId = searchParams.get('experienceLevelId');
  const excludeJobId = searchParams.get('excludeJobId');

  const { favoriteJobIds, updateFavoriteJobs, fetchFavoriteJobs } = useFavoriteJobs();
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;

  // Fetch jobs khi filters hoặc pagination thay đổi
  useEffect(() => {
    console.log('useEffect in FilterJobsBox triggered');
    // Fetch dữ liệu lookup khi component mount
    const fetchLookupData = async () => {
      try {
        // Fetch từng loại dữ liệu lookup độc lập để xử lý lỗi riêng
        const companiesRes = await jobService.getCompanies().catch(err => {
          console.error('Failed to fetch companies data', err);
          return [];
        });
        const jobTypesRes = await jobService.getJobTypes().catch(err => {
          console.error('Failed to fetch job types data', err);
          return [];
        });
        const expLevelsRes = await jobService.getExperienceLevels().catch(err => {
          console.error('Failed to fetch experience levels data', err);
          return [];
        });
        const industriesRes = await jobService.getIndustries().catch(err => {
          console.error('Failed to fetch industries data', err);
          return [];
        });

        setCompanies(companiesRes);
        setJobTypesData(jobTypesRes);
        setExperienceLevels(expLevelsRes);
        setIndustries(industriesRes);
      } catch (err) {
        console.error('An unexpected error occurred during lookup data fetching', err);
      }
    };

    // Gọi API lấy tất cả job active (status === 1)
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobs = await jobService.getActiveJobs();
        setJobs(jobs);
        setTotalJobs(jobs.length);
        setError(null);
      } catch (err) {
        console.error('Error in fetchJobs:', err);
        setError('Failed to fetch jobs');
        setJobs([]);
        setTotalJobs(0);
      } finally { 
        setLoading(false);
      }
    };

    fetchLookupData();
    fetchJobs();
  }, [keyword, location, destination, category, jobType, datePosted, experience, salary, tag, sort, currentPage, itemsPerPage, industryId, provinceName, levelId, jobTypeId, experienceLevelId, excludeJobId]);

  // Thêm useEffect để lấy danh sách công ty đã bookmark
  useEffect(() => {
    const fetchFavoriteCompanies = async () => {
      try {
        setIsLoadingBookmarks(true);
        const favorites = await jobService.getFavoriteCompanies();
        // Ép kiểu userId về number để so sánh chính xác
        setBookmarkedCompanies(favorites.map(company => Number(company.userId)));
      } catch (error) {
        console.error("Error fetching favorite companies:", error);
      } finally {
        setIsLoadingBookmarks(false);
      }
    };
    fetchFavoriteCompanies();
  }, []);

  useEffect(() => {
    if (userId) {
      getUserFavorites(userId)
        .then((res) => {
          setFavoriteJobIds(res.data.map((item) => item.jobId));
        })
        .catch((err) => console.error(err));
    }
  }, [userId]);

  // Helper function để tìm tên từ ID trong dữ liệu lookup
  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const company = companies.find(c => Number(c.id) === Number(companyId));
    return company ? company.name : 'N/A';
  };

  const getJobTypeName = (jobTypeId) => {
      const type = jobTypesData.find(jt => jt.id === jobTypeId);
      // Dữ liệu API JobType có trường jobTypeName
      return type ? type.jobTypeName : 'N/A';
  };

  const getIndustryName = (industryId) => {
      const industry = industries.find(i => i.industryId === industryId);
      // Dữ liệu API Industry có trường industryName
      return industry ? industry.industryName : 'N/A';
  };

  const getExperienceLevelName = (expLevelId) => {
      const level = experienceLevels.find(el => el.id === expLevelId);
       // Dữ liệu API ExperienceLevels có trường name
      return level ? level.name : 'N/A';
  };

  // keyword filter on title
  const keywordFilter = (item) =>
    keyword ? item.title.toLowerCase().includes(keyword.toLowerCase()) : true;


  // location filter
  const locationFilter = (item) =>
    location ? item?.industryId?.toLowerCase().includes(location.toLowerCase()) : true;


  // destination filter
  const destinationFilter = (item) =>
    destination?.min === 0 && destination?.max === 100 ? true :
    item?.destination?.min >= destination?.min && item?.destination?.max <= destination?.max;


  // category filter
  const categoryFilter = (item) =>
    category ? item?.industryId?.toLowerCase() === category.toLowerCase() : true;


  // job-type filter
  const jobTypeFilter = (item) =>
    jobType?.length ? jobType.includes(item.jobTypeId) : true;


  // date-posted filter
  const datePostedFilter = (item) =>
    datePosted && datePosted !== "all" ?
    item?.createdAt?.toLowerCase().split(" ").join("-").includes(datePosted) : true;


  // experience level filter
  const experienceFilter = (item) =>
    experience?.length ? experience.includes(item.experienceId) : true;


  // salary filter
  const salaryFilter = (item) =>
    salary?.min === 0 && salary?.max === 20000 ? true :
    item.salary >= salary?.min && item.salary <= salary?.max;


  // tag filter
  const tagFilter = (item) => tag ? item?.industryId === tag : true;


  // sort filter
  const sortFilter = (a, b) =>
    sort === "CreatedAtDesc" ? a.id > b.id && -1 : a.id < b.id && -1;

  // Thêm handler cho nút Show More
  const handleShowMore = () => {
    // Tăng số lượng hiển thị, kích hoạt fetch data mới
    setDisplayCount(prev => prev + 10);
  };

  // Cập nhật hàm xử lý bookmark
  const handleToggleFavorite = (jobId) => {
    if (favoriteJobIds.includes(jobId)) {
      removeFavoriteJob(userId, jobId)
        .then(() => {
          const newIds = favoriteJobIds.filter((id) => id !== jobId);
          updateFavoriteJobs(newIds);
        })
        .catch((err) => console.error(err));
    } else {
      addFavoriteJob(userId, jobId)
        .then(() => {
          const newIds = [...favoriteJobIds, jobId];
          updateFavoriteJobs(newIds);
        })
        .catch((err) => console.error(err));
    }
  };

  // Lọc job active và áp dụng filter từ query string
  const filteredActiveJobs = jobs
    .filter(job => job.status === 1)
    .filter(job => !industryId || String(job.industryId) === String(industryId))
    .filter(job => !provinceName || job.provinceName === provinceName)
    .filter(job => !levelId || String(job.levelId) === String(levelId))
    .filter(job => !jobTypeId || String(job.jobTypeId) === String(jobTypeId))
    .filter(job => !experienceLevelId || String(job.experienceLevelId) === String(experienceLevelId));
  const totalActiveJobs = filteredActiveJobs.length;
  const totalPages = Math.ceil(totalActiveJobs / itemsPerPage);
  // Phân trang trên mảng đã lọc
  const jobsToShow = filteredActiveJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="ls-switcher">
        <div className="show-result">
          <div className="show-1023">
            <button
              type="button"
              className="theme-btn toggle-filters"
              data-bs-toggle="offcanvas"
              data-bs-target="#filter-sidebar"
            >
              <span className="icon icon-filter"></span> Filter
            </button>
          </div>
          {/* Collapsible sidebar button */}


          <div className="text">
            Show <strong>{jobsToShow.length || 0}</strong> of <strong>{totalActiveJobs || 0}</strong> jobs
          </div>
        </div>
        {/* End show-result */}


        <div className="sort-by">
          {keyword !== "" ||
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
          itemsPerPage !== 8 ? (
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
                setItemsPerPage(8);
                setDisplayCount(10);
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
          {/* End select */}


          <select
            onChange={(e) => {
              const limit = Number(e.target.value);
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
            className="chosen-single form-select ms-3"
            value={itemsPerPage}
          >
            <option value="8">8 Per Page</option>
            <option value="16">16 Per Page</option>
            <option value="24">24 Per Page</option>
            <option value="40">40 Per Page</option>
          </select>
          {/* End select */}
        </div>
      </div>
      {/* End ls-switcher */}

      {loading ? (
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
        </div>
      ) : error ? (
        <div className="text-center py-5 text-danger">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5">
          <h3>No suitable job found</h3>
          <p>Please try again with different filters</p>
        </div>
      ) : (
        <div className="row">
          {jobsToShow.map((item, index) => (
            <div key={item.id || index} className="job-block">
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
                      const company = companies.find(c => c.id === item.companyId);
                      const logoSrc = company?.logo || item.company?.urlCompanyLogo || '/images/company-logo/default-logo.png';
                      const companyName = company?.name || item.company?.companyName || 'Company';
                      return <Image width={54} height={54} src={logoSrc} alt={companyName} style={{ objectFit: 'cover', width: 54, height: 54, display: 'block' }} />;
                    })()}
                  </span>
                  <h4>
                    <Link href={`/job-single-v3/${item.id}`}>{item.jobTitle}</Link>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {item.company?.companyName || getCompanyName(item.companyId)}
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
                    {/* Job Type Tag */}
                    {item.jobType?.jobTypeName && (
                      <span style={{ background: '#e0edff', color: '#2563eb', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.jobType.jobTypeName}
                      </span>
                    )}
                    {/* Industry Tag */}
                    {item.industry?.industryName && (
                      <span style={{ background: '#e6f4ea', color: '#1dbf73', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.industry.industryName}
                      </span>
                    )}
                    {/* Level Tag */}
                    {item.level?.levelName && (
                      <span style={{ background: '#fff4e6', color: '#ffb200', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14 }}>
                        {item.level.levelName}
                      </span>
                    )}
                  </div>
                  <button
                    className={`bookmark-btn ${favoriteJobIds.includes(item.id) ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(item.id)}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      transition: 'all 0.3s ease',
                      color: favoriteJobIds.includes(item.id) ? '#ff5a5f' : '#666',
                    }}
                  >
                    {favoriteJobIds.includes(item.id) ? (
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}>
          &#8592;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: currentPage === i + 1 ? '#2563eb' : 'none',
              color: currentPage === i + 1 ? '#fff' : '#444',
              border: 'none',
              fontWeight: 600,
              fontSize: 18,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'none',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            {i + 1}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages ? '#ccc' : '#444' }}>
          &#8594;
        </button>
      </div>
    </>
  );
};


export default FilterJobsBox;