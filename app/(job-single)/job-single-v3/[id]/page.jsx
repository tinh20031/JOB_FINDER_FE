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
import { notFound } from 'next/navigation';
import JobHeader from "@/components/job-single-pages/shared-components/JobHeader";
import JobDetailsBox from "@/components/job-single-pages/shared-components/JobDetailsBox";
import "@/styles/apply-job-modal.css";

const JobSingleDynamicV3 = ({ params }) => {
  const [job, setJob] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [company, setCompany] = useState(null);
  const [fetchError, setFetchError] = useState(null);

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

        if (!jobResponse) {
          notFound();
          return;
        }

        setJob(jobResponse);
        setIndustries(industriesResponse);
        setLevels(levelsResponse);
        setJobTypes(jobTypesResponse);
        setExperienceLevels(experienceLevelsResponse);
        setFetchError(null);

        if (jobResponse?.companyId) {
          ApiService.getCompanyProfileById(jobResponse.companyId)
            .then(setCompany)
            .catch((err) => {
                console.error("Error fetching company profile with ApiService:", err);
                setCompany(null);
            });
        }

      } catch (error) {
        if (error?.response?.status === 403 || error?.response?.status === 404) {
          notFound();
          return;
        }
        setFetchError(error);
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
    if (job && job.jobTitle) {
      document.title = `${job.jobTitle} | JobFinder`;
    } else {
      document.title = 'Job Detail | JobFinder';
    }
  }, [job]);

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

  const levelName = job?.level?.levelName || "N/A";
  const experienceLevelName = job?.experienceLevel?.name || "N/A";
  const industryName = job?.industry?.industryName || "N/A";
  const jobTypeName = job?.jobType?.jobTypeName || 'N/A';

  if (!job && !fetchError) {
    return (
      <>
        <span className="header-span"></span>
        <LoginPopup />
        <DefaulHeader2 />
        <MobileMenu />
        <section className="job-detail-section">
          <div className="job-detail-outer">
            <div className="auto-container">
              <div className="row">
                <div className="content-column col-lg-8 col-md-12 col-sm-12">
                  <div className="job-block-outer">
                    <div className="job-block-seven style-two">
                      <div className="inner-box">
                        <div className="content">
                          <div className="skeleton skeleton-title" />
                          <ul className="job-info">
                            <li><span className="skeleton skeleton-text" /></li>
                            <li><span className="skeleton skeleton-text" /></li>
                            <li><span className="skeleton skeleton-text" /></li>
                            <li><span className="skeleton skeleton-text" /></li>
                          </ul>
                          <ul className="job-other-info">
                            <li className="skeleton skeleton-tag" />
                            <li className="skeleton skeleton-tag" />
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="job-overview-two">
                    <div className="skeleton skeleton-section-title" />
                    <div className="skeleton skeleton-box" style={{height: 120}} />
                  </div>
                  <div className="skeleton skeleton-section-title" style={{width: '40%'}} />
                  <div className="skeleton skeleton-box" style={{height: 180}} />
                  <div className="other-options">
                    <div className="skeleton skeleton-section-title" style={{width: '30%'}} />
                    <div className="skeleton skeleton-box" style={{height: 32, width: 120}} />
                  </div>
                </div>
                <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                  <aside className="sidebar">
                    <div className="btn-box">
                      <div className="skeleton skeleton-btn" />
                      <div className="skeleton skeleton-btn" style={{width: 40, height: 40, borderRadius: '50%'}} />
                    </div>
                    <div className="sidebar-widget company-widget">
                      <div className="widget-content">
                        <div className="company-title" style={{display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', paddingLeft: 0}}>
                          <div className="skeleton skeleton-avatar" />
                          <div>
                            <div className="skeleton skeleton-text" style={{width: 100, height: 20, marginBottom: 8}} />
                            <div className="skeleton skeleton-link" style={{width: 80, height: 16}} />
                          </div>
                        </div>
                        <div className="skeleton skeleton-box" style={{height: 60}} />
                        <div className="btn-box">
                          <div className="skeleton skeleton-btn" style={{width: 160, height: 36}} />
                        </div>
                      </div>
                    </div>
                    <div className="sidebar-widget contact-widget">
                      <h4 className="widget-title">Contact Us</h4>
                      <div className="widget-content">
                        <div className="default-form">
                          <Contact companyId={job?.companyId} jobId={job?.id} jobTitle={job?.jobTitle} />
                        </div>
                        {/* End .default-form */}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </section>
        <FooterDefault footerStyle="alternate5" />
        <style jsx global>{`
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
            background-size: 400% 100%;
            animation: skeleton-loading 1.4s ease infinite;
            border-radius: 4px;
            margin-bottom: 12px;
          }
          @keyframes skeleton-loading {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
          }
          .skeleton-title { width: 60%; height: 32px; margin-bottom: 20px; }
          .skeleton-section-title { width: 30%; height: 24px; margin-bottom: 16px; }
          .skeleton-text { width: 80%; height: 16px; margin-bottom: 10px; }
          .skeleton-tag { width: 60px; height: 24px; display: inline-block; margin-right: 8px; }
          .skeleton-btn { width: 120px; height: 36px; margin-bottom: 10px; }
          .skeleton-avatar { width: 54px; height: 53px; border-radius: 8px; background: #e0e0e0; }
          .skeleton-link { width: 80px; height: 16px; background: #e0e0e0; }
          .skeleton-box { width: 100%; height: 40px; margin-bottom: 16px; }
        `}</style>
      </>
    );
  }

  if (fetchError) {
    return <div>System error, please try again later!</div>;
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
            <JobHeader job={{
              ...job,
              jobTypeName,
              industryName,
              levelName,
              experienceLevelName,
              addressDetail: job?.addressDetail,
              provinceName: job?.provinceName,
              minSalary: job?.minSalary,
              maxSalary: job?.maxSalary,
              isSalaryNegotiable: job?.isSalaryNegotiable,
              createdAt: job?.createdAt,
              title: job?.title
            }} company={company} />
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-overview-two">
                  <h4>Job Overview</h4>
                  <JobOverView2
                    job={job}
                    industryName={industryName}
                    levelName={levelName}
                    jobTypeName={jobTypeName}
                    experienceLevelName={experienceLevelName}
                  />
                </div>
                {/* <!-- job-overview-two --> */}

                <JobDetailsBox job={job} />
                {/* End job-details */}

                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <SocialTwo />
                  </div>
                </div>
                {/* <!-- Other Options --> */}

                <div className="related-jobs">
                  <RelatedJobs2 job={job} />
                </div>
                {/* End related-jobs */}
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
                    className="modal fade apply-job-modal"
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

                      <CompnayInfo company={company} industries={industries} />

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
                        <Contact 
                          companyId={job?.companyId} 
                          jobId={job?.id} 
                          companyName={company?.companyName}
                          industry={industryName}
                          urlCompanyLogo={company?.urlCompanyLogo}
                        />
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
