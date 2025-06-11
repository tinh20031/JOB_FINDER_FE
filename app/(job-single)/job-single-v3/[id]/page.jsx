"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { jobService } from "@/services/jobService";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import CompnayInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import Contact from "@/components/job-single-pages/shared-components/Contact";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import RelatedJobs2 from "@/components/job-single-pages/related-jobs/RelatedJobs2";
import JobOverView2 from "@/components/job-single-pages/job-overview/JobOverView2";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";
import { companyService } from "@/services/companyService";
import { companyProfileService } from "@/services/companyProfileService";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import ApiService from "@/services/api.service";
import API_CONFIG from "@/config/api.config";

const JobSingleDynamicV3 = ({ params }) => {
  const [job, setJob] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobResponse, industriesResponse, levelsResponse, jobTypesResponse, experienceLevelsResponse] = await Promise.all([
          jobService.getJobById(params.id),
          ApiService.get(API_CONFIG.ENDPOINTS.INDUSTRY),
          ApiService.get(API_CONFIG.ENDPOINTS.LEVEL),
          ApiService.get(API_CONFIG.ENDPOINTS.JOB_TYPE),
          ApiService.get(API_CONFIG.ENDPOINTS.EXPERIENCE_LEVEL),
        ]);

        setJob(jobResponse);
        setIndustries(industriesResponse);
        setLevels(levelsResponse);
        setJobTypes(jobTypesResponse);
        setExperienceLevels(experienceLevelsResponse);

        if (jobResponse?.companyId) {
          companyProfileService.getCompanyProfile(jobResponse.companyId)
            .then(setCompany)
            .catch((err) => {
                console.error("Error fetching company profile:", err);
                setCompany(null);
            });
        }

      } catch (error) {
        console.error("Error fetching job details or related data:", error);
        setJob(null);
        setIndustries([]);
        setLevels([]);
        setJobTypes([]);
        setExperienceLevels([]);
        setCompany(null);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    console.log("Job data in page.jsx:", job);
    console.log("Industries in page.jsx:", industries);
    console.log("Levels in page.jsx:", levels);
    console.log("Job Types in page.jsx:", jobTypes);
    console.log("Experience Levels in page.jsx:", experienceLevels);
  }, [job, industries, levels, jobTypes, experienceLevels]);

  const getIndustryName = (id) => industries.find(i => i.industryId === id)?.industryName || "N/A";
  const getLevelName = (id) => levels.find(l => l.id === id)?.levelName || "N/A";
  const getJobTypeName = (id) => jobTypes.find(jt => jt.id === id)?.jobTypeName || "N/A";
  const getExperienceLevelName = (id) => experienceLevels.find(el => el.id === id)?.name || "N/A";  
  const getCompanyName = (companyId) => {
    // Ensure companies data is available and then find the company
    // This will likely need to be fetched separately if `companies` is not a global state.
    // For now, assuming `company` state is sufficient.
    return company?.companyName || "N/A";
  };

  // Build jobTypeList for tag màu (nhiều tag, mỗi tag một màu)
  const styleClassMap = {
    "Full-time": "fulltime-tag",
    "Full Time": "fulltime-tag",
    "Private": "private-tag",
    "Urgent": "urgent-tag",
    "Part-time": "parttime-tag"
  };

  const jobTypeList = job && jobTypes.length
    ? jobTypes
        .filter(jt => jt.id === job.jobTypeId)
        .map(jt => ({
          type: jt.jobTypeName,
          styleClass: styleClassMap[jt.jobTypeName] || "default-tag"
        }))
    : [];

  const levelName = job?.levelId
    ? levels.find(l => l.id === job.levelId)?.levelName || "N/A"
    : "N/A";

  if (!job || industries.length === 0 || levels.length === 0 || jobTypes.length === 0 || experienceLevels.length === 0) {
    return <div>Loading job details...</div>;
  }

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
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  <div className="job-block-seven style-two">
                    <div className="inner-box">
                      <div className="content">
                        <h4>{job?.title}</h4>

                        <ul className="job-info">
                          <li>
                            <span className="icon flaticon-briefcase"></span>
                            {company?.companyName  || "N/A"}
                          </li>
                          {/* company info */}
                          <li>
                            <span className="icon flaticon-map-locator"></span>
                            {job?.location}
                          </li>
                          {/* location info */}
                          <li>
                            <span className="icon flaticon-clock-3"></span>{" "}
                            {job?.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}
                          </li>
                          {/* time info */}
                          <li>
                            <span className="icon flaticon-money"></span>{" "}
                            {job?.salary}
                          </li>
                          {/* salary info */}
                        </ul>
                        {/* End .job-info */}

                        <ul className="job-other-info">
                          {jobTypeList.map((val, i) => (
                            <li key={i} className={val.styleClass}>{val.type}</li>
                          ))}
                        </ul>
                        {/* End .job-other-info */}
                      </div>
                      {/* End .content */}
                    </div>
                  </div>
                  {/* <!-- Job Block --> */}
                </div>
                {/* <!-- job block outer --> */}

                <div className="job-overview-two">
                  <h4>Job Overview</h4>
                  <JobOverView2
                    job={job}
                    industryName={getIndustryName(job?.industryId)}
                    levelName={levelName}
                    jobTypeName={getJobTypeName(job?.jobTypeId)}
                    experienceLevelName={getExperienceLevelName(job?.experienceLevelId)}
                  />
                </div>
                {/* <!-- job-overview-two --> */}

                <JobDetailsDescriptions jobId={params.id} />
                {/* End job-details */}

                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <SocialTwo />
                  </div>
                </div>
                {/* <!-- Other Options --> */}
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="btn-box">
                    <a
                      href="#"
                      className="theme-btn btn-style-one"
                      data-bs-toggle="modal"
                      data-bs-target="#applyJobModal"
                    >
                      Apply For Job
                    </a>
                    <button className="bookmark-btn">
                      <i className="flaticon-bookmark"></i>
                    </button>
                  </div>
                  {/* End apply for job btn */}

                  {/* <!-- Modal --> */}
                  <div
                    className="modal fade"
                    id="applyJobModal"
                    tabIndex="-1"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div className="apply-modal-content modal-content">
                        <div className="text-center">
                          <h3 className="title">Apply for this job</h3>
                          <button
                            type="button"
                            className="closed-modal"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        {/* End modal-header */}

                        <ApplyJobModalContent jobId={params.id} />
                        {/* End PrivateMessageBox */}
                      </div>
                      {/* End .send-private-message-wrapper */}
                    </div>
                  </div>
                  {/* End .modal */}

                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div
                        className="company-title"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          textAlign: "left",
                          paddingLeft: 0,
                        }}
                      >
                        {company?.urlCompanyLogo && (
                          <Image
                            width={54}
                            height={53}
                            src={company.urlCompanyLogo}
                            alt={company.companyName}
                            style={{ borderRadius: "8px", objectFit: "contain", background: "#fff" }}
                          />
                        )}
                        <div>
                          <h5 className="company-name" style={{ margin: 0 }}>{company?.companyName}</h5>
                          <a
                            href={`/employers-single-v1/${company?.userId}`}
                            className="profile-link"
                          >
                            View company profile
                          </a>
                        </div>
                      </div>
                      {/* End company title */}

                      <CompnayInfo companyId={job?.companyId} />

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
                      {/* End btn-box */}
                    </div>
                  </div>
                  {/* End .company-widget */}

                  <div className="sidebar-widget contact-widget">
                    <h4 className="widget-title">Contact Us</h4>
                    <div className="widget-content">
                      <div className="default-form">
                        <Contact />
                      </div>
                      {/* End .default-form */}
                    </div>
                  </div>
                  {/* End contact-widget */}
                </aside>
                {/* End .sidebar */}
              </div>
              {/* End .sidebar-column */}
            </div>
            {/* End .row  */}

            <div className="related-jobs">
              <div className="title-box">
                <h3>Related Jobs</h3>
                <div className="text">2020 jobs live - 293 added today.</div>
              </div>
              {/* End title box */}

              <div className="row">
                <RelatedJobs2 />
              </div>
              {/* End .row */}
            </div>
            {/* <!-- Related Jobs --> */}
          </div>
          {/* End auto-container */}
        </div>
        {/* <!-- job-detail-outer--> */}
      </section>
      {/* <!-- End Job Detail Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}

      <style jsx global>{`
      .fulltime-tag {
        background: #e3f0ff;
        color: #2a6ee0;
        border-radius: 20px;
        padding: 4px 16px;
        margin-right: 8px;
        display: inline-block;
        font-weight: 500;
      }
      .private-tag {
        background: #e6f7ec;
        color: #1bbf83;
        border-radius: 20px;
        padding: 4px 16px;
        margin-right: 8px;
        display: inline-block;
        font-weight: 500;
      }
      .urgent-tag {
        background: #fff4e6;
        color: #ff8c00;
        border-radius: 20px;
        padding: 4px 16px;
        margin-right: 8px;
        display: inline-block;
        font-weight: 500;
      }
      .parttime-tag {
        background: #f0f7ff;
        color: #007bff;
        border-radius: 20px;
        padding: 4px 16px;
        margin-right: 8px;
        display: inline-block;
        font-weight: 500;
      }
      .default-tag {
        background: #f0f0f0;
        color: #333;
        border-radius: 20px;
        padding: 4px 16px;
        margin-right: 8px;
        display: inline-block;
        font-weight: 500;
      }
      `}</style>
    </>
  );
};

export default dynamic(() => Promise.resolve(JobSingleDynamicV3), {
  ssr: false,
});
