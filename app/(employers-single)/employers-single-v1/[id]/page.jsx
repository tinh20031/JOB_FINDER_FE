"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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

const EmployersSingleV1 = ({ params }) => {
  const id = params.id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

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
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployersSingleV1), {
  ssr: false,
});
