"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ApiService from "@/services/api.service";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import MainHeader from "@/components/header/MainHeader";
import MobileMenu from "@/components/header/MobileMenu";
import JobDetailsDescriptions from "@/components/employer-single-pages/shared-components/JobDetailsDescriptions";
import RelatedJobs from "@/components/employer-single-pages/related-jobs/RelatedJobs";
import MapJobFinder from "@/components/job-listing-pages/components/MapJobFinder";
import Social from "@/components/employer-single-pages/social/Social";
import PrivateMessageBox from "@/components/employer-single-pages/shared-components/PrivateMessageBox";
import Image from "next/image";
import { toast } from "react-toastify";
import jobService from "@/services/jobService";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EmployersSingleV1 = ({ params }) => {
  const id = params.id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [highlightJobs, setHighlightJobs] = useState([]);
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth) || {};

  useEffect(() => {
    setLoading(true);
    ApiService.getCompanyProfileById(id)
      .then((data) => {
        setCompany(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const fetchFavorite = async () => {
      try {
        const favorites = await jobService.getFavoriteCompanies();
        setIsFavorite(favorites.some(c => Number(c.userId) === Number(company.userId)));
      } catch (e) {
        setIsFavorite(false);
      }
    };
    if (company?.userId) fetchFavorite();
  }, [company?.userId]);

  useEffect(() => {
    if (company?.userId) {
      jobService.getCompanyHighlightJobs(company.userId)
        .then(data => setHighlightJobs(data.jobs || []));
    }
  }, [company?.userId]);

  useEffect(() => {
    if (company && company.companyName) {
      document.title = `${company.companyName} | JobFinder`;
    } else {
      document.title = 'Company Detail | JobFinder';
    }
  }, [company]);

  const handleBookmark = async () => {
    try {
      setIsLoadingFavorite(true);
      if (isFavorite) {
        await jobService.unfavoriteCompany(company.userId);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await jobService.favoriteCompany(company.userId);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Login session expired, please login again");
      } else {
        toast.error("An error occurred while processing favorites");
      }
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!company) return <div>No company found.</div>;

  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <MainHeader />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Job Detail Section --> */}
      <section className="job-detail-section">
        {/* <!-- Upper Box --> */}
        <div className="upper-box" style={{ background: 'none', paddingTop: 0, marginTop: 0 }}>
          {/* Cover Image - full width, near header, logo overlapping down, info on the right like Facebook */}
          {company.imageLogoLgr && (
            <div
              style={{
                width: '100vw',
                height: 340,
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                overflow: 'visible',
                zIndex: 1,
                background: '#f5f6fa',
              }}
            >
              <img
                src={company.imageLogoLgr}
                alt="cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Flex row: logo on left, info on right */}
              <div
                style={{
                  position: 'absolute',
                  left: 150,
                  bottom: -120,
                  width: 'auto',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 32,
                }}
              >
                <span className="company-logo" style={{zIndex: 2}}>
                  <Image
                    width={180}
                    height={180}
                    src={company.urlCompanyLogo || "/no-logo.png"}
                    alt="logo"
                    style={{
                      borderRadius: 20,
                      border: '1px solid #e5e7eb',
                      objectFit: 'cover',
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'block',
                    }}
                  />
                </span>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 320}}>
                  <h4 style={{marginBottom: 20, fontWeight: 1000}}>{company.companyName}</h4>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    {/* <button
                      className={`bookmark-btn${isFavorite ? " active" : ""}`}
                      title={isFavorite ? "Remove from favorites" : "Save company"}
                      onClick={handleBookmark}
                      disabled={isLoadingFavorite}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: isFavorite ? "#ffc107" : "#666",
                        fontSize: 15,
                        marginLeft: 0,
                        opacity: 1,
                        visibility: "visible",
                      }}
                    >
                      <i className="flaticon-bookmark"></i>
                    </button> */}
                  </div>
                  <ul className="job-other-info" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, margin: 0, padding: 0, listStyle: 'none'}}>
                    <li className="time" style={{fontWeight: 700}}>{company.industryName}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="upper-box" style={{ background: 'none', paddingTop: 0, marginTop: 0 }}></div>
        </div>
        {/* <!-- Upper Box --> */}

        {/* Divider line before About Company */}
        {/* <div style={{height: 1, background: '#000000', width: '80%', borderRadius: 1}}></div> */}
        <div
  style={{
    height: 1,
    background: '#000000',
    width: '80%',
    borderRadius: 1,
    margin: '20px auto 14px auto'
  }}
></div>
        {/* <!-- job-detail-outer--> */}
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {/*  job-detail */}
                <JobDetailsDescriptions description={company.companyProfileDescription} />
                {/* End job-detail */}

                {/* Hot Jobs Section */}
                {highlightJobs.length > 0 && (
                  <div className="hot-jobs-section" style={{ marginTop: 40 }}>
                    <h3 className="section-title" style={{ 
                      fontSize: 24, 
                      fontWeight: 700, 
                      marginBottom: 24,
                      color: '#1967d2',
                      textAlign: 'center'
                    }}>
                      Hot Jobs 
                    </h3>
                    <div className="row">
                      {highlightJobs.map((job, index) => (
                        <div className="job-block col-12 mb-4" key={job.jobId}>
                          <div 
                            className="inner-box job-block-hover"
                            style={{
                              position: 'relative',
                              padding: 24,
                              borderRadius: 16,
                              background: '#fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              border: '1px solid #e9ecef',
                              minHeight: 180,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              animation: `slideInUp 0.6s ease ${index * 0.1}s both`
                            }}
                            onClick={() => {
                              const params = new URLSearchParams({
                                IndustryId: job.industryId,
                                LevelId: job.levelId,
                                JobTypeId: job.jobTypeId,
                                ProvinceName: job.provinceName || '',
                                SkillIds: job.skills?.map(s => s.skillId).join(',') || ''
                              });
                              window.location.href = `/job-list?${params.toString()}`;
                            }}
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
                                  src={job.company?.urlCompanyLogo || '/images/resource/company-6.png'}
                                  alt={job.company?.companyName || 'Company'}
                                  style={{
                                    objectFit: "cover",
                                    width: 54,
                                    height: 54,
                                    display: "block",
                                  }}
                                />
                              </span>
                              <h4>
                                <Link href={`/job-detail/${job.jobId}`} style={{ color: '#1967d2', textDecoration: 'none' }}>
                                  {job.title}
                                </Link>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span>
                                  {job.company?.companyName}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span>
                                  {job.provinceName || "Province N/A"}
                                </li>
                                <li>
                                  <span className="icon flaticon-clock-3"></span>
                                  {job.createdAt
                                    ? (() => {
                                        const diff = Math.floor(
                                          (Date.now() - new Date(job.createdAt)) /
                                            (1000 * 60 * 60)
                                        );
                                        return diff < 24
                                          ? `${diff} hours ago`
                                          : `${Math.floor(diff / 24)} days ago`;
                                      })()
                                    : "N/A"}
                                </li>
                                <li>
                                  <span className="icon flaticon-money"></span>
                                  {isLoggedIn ? (
                                    job.isSalaryNegotiable
                                      ? "Negotiable Salary"
                                      : job.minSalary && job.maxSalary
                                      ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`
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
                                        onClick={(e) => e.preventDefault()}
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
                                {job.jobType?.jobTypeName && (
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
                                    {job.jobType.jobTypeName}
                                  </span>
                                )}
                                {/* Industry Tag */}
                                {job.industry?.industryName && (
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
                                    {job.industry.industryName}
                                  </span>
                                )}
                                {/* Level Tag */}
                                {job.level?.levelName && (
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
                                    {job.level.levelName}
                                  </span>
                                )}
                              </div>
                              <div style={{ 
                                position: "absolute",
                                right: "20px",
                                top: "20px",
                                color: '#1967d2',
                                fontSize: 20,
                                opacity: 0.7,
                                transition: 'all 0.3s ease',
                                transform: 'translateX(0)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.opacity = '0.7';
                              }}
                              >
                                <i className="la la-arrow-right"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* <!-- Related Jobs --> */}
                <div className="related-jobs">
                  {/* <RelatedJobs companyId={company.userId} /> */}
                </div>
                {/* <!-- Related Jobs --> */}
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      {/*  compnay-info */}
                      <ul className="company-info mt-0">
                        <li>
                          Company name: <span>{company.companyName}</span>
                        </li>
                        <li>
                          Industry: <span>{company.industryName}</span>
                        </li>
                        <li>
                          Location: <span>{company.location}</span>
                        </li>
                        <li>
                          Company size: <span>{company.teamSize}</span>
                        </li>
                          <li>
                            Contact: <span>{company.contact}</span>
                          </li>
                        {/* <li>
                          Social media:
                          <Social />
                        </li> */}
                      </ul>
                      {/* End compnay-info */}

                      <div className="btn-box">
                        {company?.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            Visit company website
                          </a>
                        )}
                      </div>
                      {/* btn-box */}
                    </div>
                  </div>
                  {/* End company-widget */}
                </aside>
                {/* End .sidebar */}
              </div>
              {/* End .sidebar-column */}
            </div>
          </div>
        </div>
        {/* <!-- job-detail-outer--> */}
      </section>
      {/* <!-- End Job Detail Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .hot-jobs-section .section-title {
          position: relative;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .hot-jobs-section .section-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #1967d2, #42a5f5);
          border-radius: 2px;
          animation: shimmer 2s ease-in-out infinite;
        }

        .job-block-hover .inner-box {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .job-block-hover .inner-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(25, 103, 210, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .job-block-hover:hover .inner-box::before {
          left: 100%;
        }

        .job-block-hover:hover .inner-box {
          box-shadow: 0 8px 32px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-4px);
          border-color: #1967d2;
        }

        .job-block-hover:hover h4 a {
          color: #2563eb;
          text-decoration: underline;
        }

        .job-block-hover:hover .company-logo {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(37,99,235,0.2);
        }

        .company-logo {
          transition: all 0.3s ease;
        }

        .job-info li {
          transition: all 0.3s ease;
        }

        .job-block-hover:hover .job-info li {
          transform: translateX(4px);
        }

        .job-block-hover:hover .job-info li:nth-child(1) { transition-delay: 0.1s; }
        .job-block-hover:hover .job-info li:nth-child(2) { transition-delay: 0.2s; }
        .job-block-hover:hover .job-info li:nth-child(3) { transition-delay: 0.3s; }
        .job-block-hover:hover .job-info li:nth-child(4) { transition-delay: 0.4s; }

        .hot-jobs-section {
          position: relative;
        }

        .hot-jobs-section::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
        }

        .hot-jobs-section::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
        }
      `}</style>
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployersSingleV1), {
  ssr: false,
});
