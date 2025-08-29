"use client";

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
  addLevel,
  addJobType,
  clearJobType,
} from "../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearJobTypeToggle,
} from "../../../features/job/jobSlice";
import Image from "next/image";
import { jobService } from "../../../services/jobService";
import { toast } from "react-toastify";
import "./FilterJobsBox.css";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getUserFavorites,
  addFavoriteJob,
  removeFavoriteJob,
} from "../../../services/favoriteJobService";
import { useFavoriteJobs } from "../../../contexts/FavoriteJobsContext";
import ClickableBox from "../../common/ClickableBox";
import { useMemo } from "react";

// Thêm import axios để gọi API trending
import axios from "axios";

// Thêm CSS styles
const styles = {
  bookmarkBtn: {
    position: "absolute",
    right: "20px",
    top: "20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    transition: "all 0.3s ease",
  },
  bookmarkBtnActive: {
    color: "#ff5a5f",
  },
  bookmarkIcon: {
    fontSize: "20px",
  },
};

// Hook kiểm tra responsive
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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
  const [industries, setIndustries] = useState([]);
  const [urlFiltersApplied, setUrlFiltersApplied] = useState(false);

  // Trending jobs state
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState(null);

  const { jobList, jobSort } = useSelector((state) => state.filter);
  const {
    keyword,
    location,
    destination,
    category,
    jobType,
    datePosted,
    salary,
    tag,
    levelId,
  } = jobList || {};

  const { sort } = jobSort;
  const dispatch = useDispatch();

  const router = useRouter();
  const searchParams = useSearchParams();
  const industryId = searchParams.get("industryId");
  const provinceName = searchParams.get("provinceName");
  const jobTypeId = searchParams.get("jobTypeId");
  const excludeJobId = searchParams.get("excludeJobId");

  const { favoriteJobIds, updateFavoriteJobs, fetchFavoriteJobs } =
    useFavoriteJobs() || {};
  const userId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId"))
      : null;

  const isMobile = useIsMobile();
  const { isLoggedIn } = useSelector((state) => state.auth) || {};

  // Fetch jobs khi filters hoặc pagination thay đổi
  useEffect(() => {
    // Fetch dữ liệu lookup khi component mount
    const fetchLookupData = async () => {
      try {
        // Fetch từng loại dữ liệu lookup độc lập để xử lý lỗi riêng
        const companiesRes = await jobService.getCompanies().catch((err) => {
          console.error("Failed to fetch companies data", err);
          return [];
        });
        const jobTypesRes = await jobService.getJobTypes().catch((err) => {
          console.error("Failed to fetch job types data", err);
          return [];
        });

        const industriesRes = await jobService.getIndustries().catch((err) => {
          console.error("Failed to fetch industries data", err);
          return [];
        });

        setCompanies(companiesRes);
        setJobTypesData(jobTypesRes);

        setIndustries(industriesRes);
      } catch (err) {
        console.error(
          "An unexpected error occurred during lookup data fetching",
          err
        );
      }
    };

    // Gọi API lấy tất cả job active (status === 2)
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobs = await jobService.getActiveJobs();
        setJobs(jobs);
        setTotalJobs(jobs.length);
        setError(null);
      } catch (err) {
        console.error("Error in fetchJobs:", err);
        setError("Failed to fetch jobs");
        setJobs([]);
        setTotalJobs(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLookupData();
    fetchJobs();
  }, [
    keyword,
    location,
    destination,
    category,
    jobType,
    datePosted,
    salary,
    tag,
    sort,
    currentPage,
    itemsPerPage,
    industryId,
    provinceName,
    levelId,
    jobTypeId,
    excludeJobId,
  ]);

  // Gọi API trending khi mount
  useEffect(() => {
    setLoadingTrending(true);
    jobService
      .getTrendingJobs({ role: "candidate", page: 1, pageSize: 10 })
      .then((trending) => {
        setTrendingJobs(trending.jobs || []);
        setErrorTrending(null);
      })
      .catch((err) => {
        setErrorTrending("Failed to fetch trending jobs");
        setTrendingJobs([]);
      })
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    if (userId) {
      getUserFavorites(userId)
        .then((res) => {
          updateFavoriteJobs(res.data.map((item) => item.jobId));
        })
        .catch((err) => console.error(err));
    }
  }, [userId]);

  // Đọc page từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Đọc và áp dụng filter từ URL khi mount
  useEffect(() => {
    if (urlFiltersApplied) return; // Chỉ áp dụng một lần

    const industryIdParam = searchParams.get("IndustryId");
    const levelIdParam = searchParams.get("LevelId");
    const jobTypeIdParam = searchParams.get("JobTypeId");
    const provinceNameParam = searchParams.get("ProvinceName");
    const skillIdsParam = searchParams.get("SkillIds");

    // Áp dụng filter từ URL vào Redux state
    if (industryIdParam) {
      dispatch(addTag(industryIdParam));
    }
    if (levelIdParam) {
      dispatch(addLevel(Number(levelIdParam)));
    }
    if (jobTypeIdParam) {
      dispatch(addJobType(Number(jobTypeIdParam))); // Bỏ array wrapper
    }
    if (provinceNameParam) {
      dispatch(addLocation(provinceNameParam));
    }
    // SkillIds có thể cần xử lý riêng tùy vào cấu trúc filter

    setUrlFiltersApplied(true);
  }, [searchParams, dispatch, urlFiltersApplied]);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

  // Helper function để tìm tên từ ID trong dữ liệu lookup
  const getCompanyName = (companyId) => {
    if (!companyId) return "N/A";
    const company = companies.find((c) => Number(c.id) === Number(companyId));
    return company ? company.name : "N/A";
  };

  const getJobTypeName = (jobTypeId) => {
    const type = jobTypesData.find((jt) => jt.id === jobTypeId);
    // Dữ liệu API JobType có trường jobTypeName
    return type ? type.jobTypeName : "N/A";
  };

  const getIndustryName = (industryId) => {
    const industry = industries.find((i) => i.industryId === industryId);
    // Dữ liệu API Industry có trường industryName
    return industry ? industry.industryName : "N/A";
  };

  // keyword filter on title
  const keywordFilter = (item) =>
    keyword ? item.jobTitle?.toLowerCase().includes(keyword.toLowerCase()) : true;

  // location filter
  const locationFilter = (item) =>
    location
      ? item?.provinceName?.toLowerCase().includes(location.toLowerCase()) ||
        item?.location?.toLowerCase().includes(location.toLowerCase())
      : true;

  // destination filter
  const destinationFilter = (item) =>
    destination?.min === 0 && destination?.max === 100
      ? true
      : item?.destination?.min >= destination?.min &&
        item?.destination?.max <= destination?.max;

  // category filter
  const categoryFilter = (item) =>
    category ? String(item?.industryId) === String(category) : true;

  // job-type filter
  const jobTypeFilter = (item) => {
    const result = jobType?.length ? jobType.includes(item.jobTypeId) : true;
    return result;
  };

  // date-posted filter
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

  // salary filter
  const salaryFilter = (item) =>
    salary?.min === 0 && salary?.max === 20000
      ? true
      : item.minSalary >= salary?.min && item.maxSalary <= salary?.max;

  // tag filter
  const tagFilter = (item) => {
    const result = tag ? String(item?.industryId) === String(tag) : true;
    return result;
  };

  // sort filter
  const sortFilter = (a, b) => {
    if (sort === "CreatedAtDesc") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === "CreatedAtAsc") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  };

  // Thêm handler cho nút Show More
  const handleShowMore = () => {
    // Tăng số lượng hiển thị, kích hoạt fetch data mới
    setDisplayCount((prev) => prev + 10);
  };

  // Cập nhật hàm xử lý bookmark
  const handleToggleFavorite = (jobId) => {
    if (!isLoggedIn || !userId) {
      toast.error("Please log in to use this feature");
      return;
    }
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

  // Chuẩn hóa dữ liệu trending job về giống all job
  const normalizeTrendingJob = (job) => ({
    id: job.jobId || job.id,
    jobTitle: job.title || job.jobTitle,
    description: job.description,
    companyId: job.companyId,
    company: job.company
      ? {
          id: job.company.userId || job.company.id,
          fullName: job.company.fullName,
          email: job.company.email,
          companyName: job.company.companyName,
          location: job.company.location,
          urlCompanyLogo: job.company.urlCompanyLogo,
        }
      : null,
    provinceName: job.provinceName,
    isSalaryNegotiable: job.isSalaryNegotiable,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    logo:
      (job.company && job.company.urlCompanyLogo) ||
      "/images/company-logo/default-logo.png",
    industryId: job.industryId,
    industry: job.industry
      ? {
          industryId: job.industry.industryId,
          industryName: job.industry.industryName,
        }
      : null,
    jobTypeId: job.jobTypeId,
    jobType: job.jobType
      ? {
          id: job.jobType.jobTypeId || job.jobType.id,
          jobTypeName: job.jobType.jobTypeName,
        }
      : null,
    levelId: job.levelId,
    level: job.level
      ? {
          id: job.level.levelId || job.level.id,
          levelName: job.level.levelName,
        }
      : null,
    quantity: job.quantity ?? 1,
    expiryDate: job.expiryDate,
    timeStart: job.timeStart,
    timeEnd: job.timeEnd,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    status: job.status,
    addressDetail: job.addressDetail,
    skills: job.skills || [],
    descriptionWeight: job.descriptionWeight ?? null,
    skillsWeight: job.skillsWeight ?? null,
    experienceWeight: job.experienceWeight ?? null,
    educationWeight: job.educationWeight ?? null,
    deactivatedByAdmin: job.deactivatedByAdmin,
    isTrending: job.isTrending || job.IsTrending,
    trendingRank: job.trendingRank || null, // Thêm ranking từ API trending
  });

  // Gộp và sắp xếp jobs: trending jobs lên đầu với ranking, sau đó là all jobs
  const mergedJobs = useMemo(() => {
    const normalizedTrendingJobs = trendingJobs.map((job, index) => {
      const normalized = normalizeTrendingJob(job);
      // Đảm bảo tất cả trending jobs đều có ranking
      if (normalized.isTrending && !normalized.trendingRank) {
        normalized.trendingRank = index + 1;
      }
      return normalized;
    });
    const allJobs = jobs.filter(job => job.status === 2 && !job.deactivatedByAdmin && job.status !== 4);
    
    // Lấy danh sách ID của trending jobs để tránh trùng lặp
    const trendingJobIds = new Set(normalizedTrendingJobs.map(job => job.id));
    
    // Lọc ra các job không phải trending từ all jobs
    const nonTrendingJobs = allJobs.filter(job => !trendingJobIds.has(job.id));
    
    // Gộp trending jobs (với ranking) và non-trending jobs
    const merged = [...normalizedTrendingJobs, ...nonTrendingJobs];
    
    return merged;
  }, [trendingJobs, jobs]);

  // Lọc job active và áp dụng tất cả các filter


  const filteredActiveJobs = mergedJobs
    // Filter từ query string
    .filter(
      (job) => !industryId || String(job.industryId) === String(industryId)
    )
    .filter((job) => !provinceName || job.provinceName === provinceName)
    .filter((job) => !levelId || String(job.levelId) === String(levelId))
    .filter((job) => !jobTypeId || String(job.jobTypeId) === String(jobTypeId))

    // Filter từ Redux state
    .filter(keywordFilter)
    .filter(locationFilter)
    .filter(destinationFilter)
    .filter(categoryFilter)
    .filter(jobTypeFilter)
    .filter(datePostedFilter)
    .filter(salaryFilter)
    .filter(tagFilter)
    // Sort
    .sort(sortFilter);

  const totalActiveJobs = filteredActiveJobs.length;
  const totalPages = Math.ceil(totalActiveJobs / itemsPerPage);
  // Phân trang trên mảng đã lọc
  const jobsToShow = filteredActiveJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Định dạng ngày/giờ: dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDateVN = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            Show <strong>{jobsToShow.length || 0}</strong> of{" "}
            <strong>{totalActiveJobs || 0}</strong> jobs
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
          salary?.min !== 0 ||
          salary?.max !== 20000 ||
          tag !== "" ||
          sort !== "" ||
          currentPage !== 1 ||
          itemsPerPage !== 8 ||
          levelId !== null ? (
            <button
              onClick={() => {
                dispatch(addKeyword(""));
                dispatch(addLocation(""));
                dispatch(addDestination({ min: 0, max: 100 }));
                dispatch(addCategory(""));
                dispatch(clearJobType()); // Reset filter jobType trong redux
                dispatch(clearJobTypeToggle());
                dispatch(addDatePosted(""));
                dispatch(clearDatePostToggle());
                dispatch(addLevel(null));
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
        </div>
      </div>
      {/* End ls-switcher */}

      {loading || loadingTrending ? (
        <div className="row">
          {[...Array(6)].map((_, idx) => (
            <div className="job-block col-12 mb-4" key={idx}>
              <div
                className="inner-box"
                style={{ minHeight: 180, position: "relative", padding: 24 }}
              >
                <div
                  className="skeleton"
                  style={{
                    width: 54,
                    height: 53,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
                <div
                  className="skeleton"
                  style={{ width: "60%", height: 24, marginBottom: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "40%", height: 16, marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "80%", height: 16, marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "30%", height: 16, marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    position: "absolute",
                    right: 20,
                    top: 20,
                  }}
                />
              </div>
            </div>
          ))}
          <style jsx>{`
            .skeleton {
              background: linear-gradient(
                90deg,
                #f0f0f0 25%,
                #e0e0e0 37%,
                #f0f0f0 63%
              );
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
      ) : error || errorTrending ? (
        <div className="text-center py-5 text-danger">{error || errorTrending}</div>
      ) : jobsToShow.length === 0 ? (
        <div className="text-center py-5">
          <h3>No suitable job found</h3>
          <p>Please try again with different filters</p>
        </div>
      ) : (
        <div className="row">
          {jobsToShow.map((item, index) => {
            // Handler chuyển trang khi click JobBox
            const handleJobBoxClick = () => {
              window.location.href = `/job-detail/${item.id}`;
            };
            return (
                             <ClickableBox
                 key={item.id || index}
                 onClick={handleJobBoxClick}
                 style={{ position: "relative" }}
               >
                                   {/* Hiển thị ranking cho trending jobs - nằm trên viền ngoài của job card */}
                  {item.isTrending && (item.trendingRank || 0) <= 3 && (
                    (() => {
                      const rank = item.trendingRank || 0;
                      const isSuper = rank === 1;
                      const background = isSuper
                        ? "linear-gradient(135deg,#ef4444 0%,#f97316 100%)"
                        : "linear-gradient(135deg,#fb923c 0%,#f59e0b 100%)";
                      return (
                        <div style={{ position: "absolute", top: -18, right: -10, zIndex: 25 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 999,
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 12,
                              letterSpacing: 0.3,
                              background,
                              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                              whiteSpace: "nowrap",
                              border: "1px solid rgba(255,255,255,0.6)",
                            }}
                          >
                            <span style={{ fontSize: 12 }}>🔥</span>
                            <span>{isSuper ? "SUPER HOT" : "HOT"}</span>
                          </div>
                        </div>
                      );
                    })()
                  )}
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
                    {(() => {
                      const company = companies.find(
                        (c) => c.id === item.companyId
                      );
                      const logoSrc =
                        company?.logo ||
                        item.company?.urlCompanyLogo ||
                        "/images/company-logo/default-logo.png";
                      const companyName =
                        company?.name || item.company?.companyName || "Company";
                      return (
                        <Image
                          width={54}
                          height={54}
                          src={logoSrc}
                          alt={companyName}
                          style={{
                            objectFit: "cover",
                            width: 54,
                            height: 54,
                            display: "block",
                          }}
                        />
                      );
                    })()}
                  </span>
                  <h4>
                    <Link href={`/job-detail/${item.id}`}>
                      {item.jobTitle}
                    </Link>
                    {/* Hiển thị badge Trending nếu có */}
                    {item.isTrending && (
                      <span
                        style={{
                          background: "#ffedd5",
                          color: "#f97316",
                          borderRadius: 12,
                          padding: "2px 12px",
                          fontWeight: 600,
                          fontSize: 13,
                          marginLeft: 10,
                          verticalAlign: "middle",
                        }}
                      >
                        Trending
                      </span>
                    )}
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {item.company?.companyName ||
                        getCompanyName(item.companyId)}
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {item.provinceName || "Province N/A"}
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span>
                      {item.createdAt
                        ? (() => {
                            const now = Date.now();
                            const createdAt = new Date(item.createdAt).getTime();
                            const diffMs = now - createdAt;
                            const diffMinutes = Math.floor(diffMs / (1000 * 60));
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            
                            if (diffMinutes < 1) {
                              return "Just now";
                            } else if (diffMinutes < 60) {
                              return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                            } else if (diffHours < 24) {
                              return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                            } else if (diffDays < 7) {
                              return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                            } else if (diffDays < 30) {
                              const weeks = Math.floor(diffDays / 7);
                              return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                            } else if (diffDays < 365) {
                              const months = Math.floor(diffDays / 30);
                              return `${months} month${months > 1 ? 's' : ''} ago`;
                            } else {
                              const years = Math.floor(diffDays / 365);
                              return `${years} year${years > 1 ? 's' : ''} ago`;
                            }
                          })()
                        : "N/A"}
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span>
                      {isLoggedIn ? (
                        item.isSalaryNegotiable
                          ? "Negotiable Salary"
                          : item.minSalary && item.maxSalary
                          ? `$${item.minSalary.toLocaleString()} - $${item.maxSalary.toLocaleString()}`
                          : "Salary N/A"
                      ) : (
                        <>
                          <span style={{ filter: 'blur(4px)' }}>Login required</span>
                          <a
                            href="#"
                            className="theme-btn btn-style-three call-modal"
                            data-bs-toggle="modal"
                            data-bs-target="#loginPopupModal"
                            style={{ marginLeft: 10, padding: '2px 10px', fontSize: 12 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const modalEl = document.getElementById('loginPopupModal');
                              if (modalEl && typeof window !== 'undefined') {
                                try {
                                  const Modal = window.bootstrap && window.bootstrap.Modal;
                                  if (Modal) {
                                    Modal.getOrCreateInstance(modalEl).show();
                                  } else {
                                    // Fallback: basic show if Bootstrap API not available
                                    modalEl.classList.add('show');
                                    modalEl.style.display = 'block';
                                    modalEl.removeAttribute('aria-hidden');
                                  }
                                } catch {}
                              }
                            }}
                          >
                            Login to view
                          </a>
                        </>
                      )}
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
                    {item.jobType?.jobTypeName && (
                      <span
                        style={{
                          background: "#e0edff",
                          color: "#2563eb",
                          borderRadius: 16,
                          padding: "4px 16px",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.jobType.jobTypeName}
                      </span>
                    )}
                    {/* Industry Tag */}
                    {item.industry?.industryName && (
                      <span
                        style={{
                          background: "#e6f4ea",
                          color: "#1dbf73",
                          borderRadius: 16,
                          padding: "4px 16px",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.industry.industryName}
                      </span>
                    )}
                    {/* Level Tag */}
                    {item.level?.levelName && (
                      <span
                        style={{
                          background: "#fff4e6",
                          color: "#ffb200",
                          borderRadius: 16,
                          padding: "4px 16px",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.level.levelName}
                      </span>
                    )}
                  </div>
                  <button
                    className={`bookmark-btn ${
                      (favoriteJobIds || []).includes(item.id) ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id);
                    }}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "20px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "5px",
                      transition: "all 0.3s ease",
                      color: (favoriteJobIds || []).includes(item.id)
                        ? "#ff5a5f"
                        : "#666",
                    }}
                  >
                    {(favoriteJobIds || []).includes(item.id) ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#2563eb"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          display: "inline-block",
                          verticalAlign: "middle",
                        }}
                      >
                        <path d="M6 2a2 2 0 0 0-2 2v18l8-5.333L20 22V4a2 2 0 0 0-2-2H6z" />
                      </svg>
                    ) : (
                      <span
                        className="flaticon-bookmark"
                        style={{
                          fontSize: "24px",
                          display: "inline-block",
                          verticalAlign: "middle",
                        }}
                      ></span>
                    )}
                  </button>
                </div>
              </ClickableBox>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          margin: "24px 0",
        }}
      >
        <button
          disabled={currentPage === 1}
          onClick={() => handleSetPage(currentPage - 1)}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: currentPage === 1 ? "#ccc" : "#444",
          }}
        >
          &#8592;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handleSetPage(i + 1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: currentPage === i + 1 ? "#2563eb" : "none",
              color: currentPage === i + 1 ? "#fff" : "#444",
              border: "none",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              outline: "none",
              boxShadow: "none",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => handleSetPage(currentPage + 1)}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: currentPage === totalPages || totalPages === 0 ? "#ccc" : "#444",
          }}
        >
          &#8594;
        </button>
      </div>
    </>
  );
};

export default FilterJobsBox;