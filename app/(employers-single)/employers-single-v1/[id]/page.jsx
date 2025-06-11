"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ApiService from "@/services/api.service";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
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

  const handleBookmark = async () => {
    try {
      setIsLoadingFavorite(true);
      if (isFavorite) {
        await jobService.unfavoriteCompany(company.userId);
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await jobService.favoriteCompany(company.userId);
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        toast.error("Có lỗi xảy ra khi xử lý yêu thích");
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

      <DefaulHeader2 />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Job Detail Section --> */}
      <section className="job-detail-section">
        {/* <!-- Upper Box --> */}
        <div className="upper-box">
          <div className="auto-container">
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <Image
                      width={100}
                      height={100}
                      src={company.urlCompanyLogo || "/no-logo.png"}
                      alt="logo"
                    />
                  </span>
                  <h4>{company.companyName}</h4>

                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {company.location}
                    </li>
                    {/* compnay info */}
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {company.teamSize}
                    </li>
                    {/* location info */}
                    <li>
                      <span className="icon flaticon-mail"></span>
                      {company.website}
                    </li>
                    {/* salary info */}
                  </ul>
                  {/* End .job-info */}

                  <ul className="job-other-info">
                    <li className="time">{company.industryName}</li>
                  </ul>
                  {/* End .job-other-info */}
                </div>
                {/* End .content */}

                <div className="btn-box">
                  <button
                    className="theme-btn btn-style-one"
                    data-bs-toggle="modal"
                    data-bs-target="#privateMessage"
                  >
                    Private Message
                  </button>
                  <button
                    className={`bookmark-btn${isFavorite ? " active" : ""}`}
                    title={isFavorite ? "Bỏ yêu thích" : "Lưu công ty"}
                    onClick={handleBookmark}
                    disabled={isLoadingFavorite}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: isFavorite ? "#ffc107" : "#666",
                      fontSize: 20,
                      marginLeft: 16,
                      opacity: 1,
                      visibility: "visible",
                    }}
                  >
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
                {/* End btn-box */}

                {/* <!-- Modal --> */}
                <div
                  className="modal fade"
                  id="privateMessage"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">
                          Send message to {company.companyName}
                        </h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      {/* End modal-header */}

                      <PrivateMessageBox />
                      {/* End PrivateMessageBox */}
                    </div>
                    {/* End .send-private-message-wrapper */}
                  </div>
                </div>
                {/* End .modal */}
              </div>
            </div>
            {/* <!-- Job Block --> */}
          </div>
        </div>
        {/* <!-- Upper Box --> */}

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
                  <div className="title-box">
                    <h3>3 Others jobs available</h3>
                    <div className="text">
                      2020 jobs live - 293 added today.
                    </div>
                  </div>
                  {/* End .title-box */}

                  <RelatedJobs />
                  {/* End RelatedJobs */}
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
