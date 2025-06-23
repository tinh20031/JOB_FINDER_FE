"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import ApiService from "@/services/api.service";
import { jobService } from "@/services/jobService";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return null; // Invalid URL
};

const ApplicantModal = ({ applicationId, show, onClose }) => {
  const [application, setApplication] = useState(null);
  useEffect(() => {
    if (show && applicationId) {
      fetch(`/api/Application/${applicationId}`)
        .then(res => res.json())
        .then(data => setApplication(data))
        .catch(() => setApplication(null));
    }
  }, [show, applicationId]);
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Applicant</h2>
          <button onClick={onClose} style={{ fontSize: 24, border: "none", background: "none" }}>×</button>
        </div>
        {!application ? (
          <div className="skeleton-modal">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-line" style={{ width: 120 }}></div>
            <div className="skeleton-line" style={{ width: 200 }}></div>
            <div className="skeleton-line" style={{ width: 80 }}></div>
          </div>
        ) : (
          <>
            <div style={{ margin: "16px 0" }}>
              <label><b>Cover Letter:</b></label>
              <div style={{
                background: "#f8f9fa",
                borderRadius: 4,
                padding: 12,
                minHeight: 80,
                marginTop: 4,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                {application.coverLetter || "No cover letter"}
              </div>
            </div>
            <div style={{ margin: "16px 0", textAlign: 'center', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button
                className="cancel-btn"
                style={{
                  background: '#f0f0f0',
                  color: '#555',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={onClose}
                onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
                onMouseOut={e => e.currentTarget.style.background = '#f0f0f0'}
              >
                Cancel
              </button>
              <button
                className="theme-btn btn-style-one"
                onClick={() => window.open(application.resumeUrl, "_blank")}
              >
                View CV (PDF)
              </button>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          position: relative;
        }
        .skeleton-modal { padding: 24px; }
        .skeleton-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: #e0e0e0; margin-bottom: 16px;
        }
        .skeleton-line {
          height: 16px; background: #e0e0e0; border-radius: 4px;
          margin-bottom: 12px;
          animation: skeleton-blink 1.2s infinite linear alternate;
        }
        @keyframes skeleton-blink {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const WidgetContentBox = ({ jobId }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(applicants.length / itemsPerPage);
  const applicantsToShow = applicants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    console.log("WidgetContentBox: useEffect triggered for jobId:", jobId);
    const fetchData = async () => {
      if (!jobId) {
        console.log("WidgetContentBox: jobId is null or undefined.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        console.log("WidgetContentBox: Attempting to fetch job details for jobId:", jobId);
        const jobDetails = await jobService.getJobById(jobId);
        if (jobDetails && jobDetails.title) {
          setJobTitle(jobDetails.title);
        } else {
          setJobTitle(`Job ID: ${jobId}`);
        }
        console.log("WidgetContentBox: Job details fetched.", jobDetails);

        console.log("WidgetContentBox: Attempting to fetch applicants for jobId:", jobId);
        const response = await applicationService.getJobApplicants(jobId);
        console.log("WidgetContentBox: API Response data (applications only):", response);

        if (response && response.length > 0) {
          const applicantsWithAllDetails = await Promise.allSettled(
            response.map(async (applicant) => {
              let candidateProfileDetails = null;
              let userDetails = null;

              try {
                candidateProfileDetails = await ApiService.getCandidateProfileById(applicant.userId);

                if (candidateProfileDetails && candidateProfileDetails.avatar === "string") {
                  candidateProfileDetails.avatar = null;
                }

              } catch (profileError) {
                console.error("Error fetching candidate profile:", profileError);
              }

              try {
                userDetails = await ApiService.getUserById(applicant.userId);
              } catch (userError) {
                console.error("Error fetching user details:", userError);
              }

              return {
                ...applicant,
                candidateProfile: candidateProfileDetails,
                user: userDetails
              };
            })
          );

          const fulfilledApplicants = applicantsWithAllDetails
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

          const sortedApplicants = fulfilledApplicants.slice().sort(
            (a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0)
          );

          setApplicants(sortedApplicants);
        } else {
          setApplicants([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const totalApplicants = applicants.length;
  const approvedApplicants = applicants.filter(app => (app.status === 'Approved' || app.status === 1) && app.candidateProfile).length;
  const rejectedApplicants = applicants.filter(app => (app.status === 'Rejected' || app.status === 2) && app.candidateProfile).length;

  if (loading) {
    return (
      <div className="row">
        {[...Array(6)].map((_, idx) => (
          <div className="col-lg-6 col-md-12 mb-4" key={idx}>
            <div className="applicant-box" style={{ padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px #eee', minHeight: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-subtitle" />
                  <div className="skeleton skeleton-line" style={{ width: 120 }} />
                </div>
              </div>
              <div className="skeleton skeleton-line" style={{ width: '80%', margin: '16px 0 0 0' }} />
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-line" style={{ width: 80, height: 20, marginLeft: 12 }} />
              </div>
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
          .skeleton-avatar { width: 72px; height: 72px; border-radius: 50%; }
          .skeleton-title { width: 160px; height: 22px; border-radius: 6px; margin-bottom: 8px; }
          .skeleton-subtitle { width: 120px; height: 16px; border-radius: 6px; margin-bottom: 8px; }
          .skeleton-line { height: 14px; border-radius: 6px; margin-bottom: 6px; }
          .skeleton-btn { width: 36px; height: 36px; border-radius: 50%; }
        `}</style>
      </div>
    );
  }

  if (!jobId) {
    return <div className="text-center py-5">No job selected</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (totalApplicants === 0 && !loading) {
    return <div className="text-center py-5">No applicants found for this job</div>;
  }

  return (
    <div className="widget-content">
      <div className="tabs-box">
        <Tabs>
          <div className="aplicants-upper-bar">
            <h6>Applicants for Job: {jobTitle}</h6>

            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals"> Total(s): {totalApplicants}</Tab>
              <Tab className="tab-btn approved"> Approved: {approvedApplicants}</Tab>
              <Tab className="tab-btn rejected"> Rejected(s): {rejectedApplicants}</Tab>
            </TabList>
          </div>

          <div className="tabs-content">
            <TabPanel>
              <div className="row">
                {applicantsToShow.map((applicant) => {
                  const percent = applicant.similarityScore !== null && applicant.similarityScore !== undefined ? Math.round(applicant.similarityScore * 100) : 0;
                  const color = percent > 50 ? '#1967d2' : '#e53935';
                  return (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={applicant.applicationId}
                    >
                      <div className="inner-box" style={{ position: 'relative', padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px #eee', minHeight: 180 }}>
                        <div style={{ position: 'absolute', top: 16, right: 16, width: 48, height: 48, zIndex: 2 }}>
                          <CircularProgressbar
                            value={percent}
                            text={`${percent}%`}
                            styles={buildStyles({
                              textColor: color,
                              pathColor: color,
                              trailColor: '#e0e0e0',
                              textSize: '26px',
                              strokeLinecap: 'round',
                            })}
                          />
                        </div>
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={getValidImageUrl(applicant.user?.image) || getValidImageUrl(applicant.candidateProfile?.avatar) || "/images/resource/candidate-1.png"}
                              alt={applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `Applicant ${applicant.userId}`}
                            />
                          </figure>
                          <h4 className="name">
                            <Link href={`/candidates-single-v1/${applicant.userId}`}>
                              {applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `User ID: ${applicant.userId}`}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {applicant.candidateProfile?.jobTitle || applicant.user?.designation || `Job ID: ${applicant.jobId}`}
                            </li>
                            <li>
                              <span className="icon la la-venus-mars"></span>{" "}
                              {applicant.candidateProfile?.gender || 'N/A'}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              { 
                                [ 
                                  applicant.candidateProfile?.address,
                                  applicant.candidateProfile?.city,
                                  applicant.candidateProfile?.province
                                ].filter(Boolean).join(', ') || 
                                applicant.user?.location || 
                                `Status: ${applicant.status}`
                              }
                            </li>
                          </ul>

                          <ul className="post-tags">
                            {applicant.candidateProfile?.skills?.map((skill, i) => (
                              <li key={i}>
                                <a href="#">{skill.id || skill}</a>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button onClick={() => { setSelectedApplicationId(applicant.applicationId); setShowModal(true); }} data-text="View Applicant">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Approve Applicant"
                                className={applicant.status === 'Approved' ? 'approved' : (applicant.status === 1 ? 'approved' : '')}
                              >
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Reject Applicant"
                                className={applicant.status === 'Rejected' ? 'rejected' : (applicant.status === 2 ? 'rejected' : '')}
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}>
                  &#8592;
                </button>
                {Array.from({ length: totalPages || 1 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
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
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}>
                  &#8594;
                </button>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {applicants.filter(app => (app.status === 'Approved' || app.status === 1) && app.candidateProfile).map((applicant) => {
                  const percent = applicant.similarityScore !== null && applicant.similarityScore !== undefined ? Math.round(applicant.similarityScore * 100) : 0;
                  const color = percent > 50 ? '#1967d2' : '#e53935';
                  return (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={applicant.applicationId}
                    >
                      <div className="inner-box" style={{ position: 'relative', padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px #eee', minHeight: 180 }}>
                        <div style={{ position: 'absolute', top: 6, right: 8, width: 48, height: 48, zIndex: 2 }}>
                          <CircularProgressbar
                            value={percent}
                            text={`${percent}%`}
                            styles={buildStyles({
                              textColor: color,
                              pathColor: color,
                              trailColor: '#e0e0e0',
                              textSize: '26px',
                              strokeLinecap: 'round',
                            })}
                          />
                        </div>
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={getValidImageUrl(applicant.user?.image) || getValidImageUrl(applicant.candidateProfile?.avatar) || "/images/resource/candidate-1.png"}
                              alt={applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `Applicant ${applicant.userId}`}
                            />
                          </figure>
                          <h4 className="name">
                            <Link href={`/candidates-single-v1/${applicant.userId}`}>
                              {applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `User ID: ${applicant.userId}`}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {applicant.candidateProfile?.jobTitle || applicant.user?.designation || `Job ID: ${applicant.jobId}`}
                            </li>
                            <li>
                              <span className="icon la la-venus-mars"></span>{" "}
                              {applicant.candidateProfile?.gender || 'N/A'}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              { 
                                [ 
                                  applicant.candidateProfile?.address,
                                  applicant.candidateProfile?.city,
                                  applicant.candidateProfile?.province
                                ].filter(Boolean).join(', ') || 
                                applicant.user?.location || 
                                `Status: ${applicant.status}`
                              }
                            </li>
                          </ul>

                          <ul className="post-tags">
                            {applicant.candidateProfile?.skills?.map((skill, i) => (
                              <li key={i}>
                                <a href="#">{skill.id || skill}</a>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button
                                data-text="View Applicant"
                                onClick={() => { setSelectedApplicationId(applicant.applicationId); setShowModal(true); }}
                              >
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Approve Applicant"
                                className={applicant.status === 'Approved' ? 'approved' : (applicant.status === 1 ? 'approved' : '')}
                              >
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Reject Applicant"
                                className={applicant.status === 'Rejected' ? 'rejected' : (applicant.status === 2 ? 'rejected' : '')}
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {applicants.filter(app => (app.status === 'Rejected' || app.status === 2) && app.candidateProfile).map((applicant) => {
                  const percent = applicant.similarityScore !== null && applicant.similarityScore !== undefined ? Math.round(applicant.similarityScore * 100) : 0;
                  const color = percent > 50 ? '#1967d2' : '#e53935';
                  return (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={applicant.applicationId}
                    >
                      <div className="inner-box" style={{ position: 'relative', padding: 24, borderRadius: 16, background: '#fff', boxShadow: '0 2px 8px #eee', minHeight: 180 }}>
                        <div style={{ position: 'absolute', top: 6, right: 8, width: 48, height: 48, zIndex: 2 }}>
                          <CircularProgressbar
                            value={percent}
                            text={`${percent}%`}
                            styles={buildStyles({
                              textColor: color,
                              pathColor: color,
                              trailColor: '#e0e0e0',
                              textSize: '26px',
                              strokeLinecap: 'round',
                            })}
                          />
                        </div>
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={getValidImageUrl(applicant.user?.image) || getValidImageUrl(applicant.candidateProfile?.avatar) || "/images/resource/candidate-1.png"}
                              alt={applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `Applicant ${applicant.userId}`}
                            />
                          </figure>
                          <h4 className="name">
                            <Link href={`/candidates-single-v1/${applicant.userId}`}>
                              {applicant.user?.fullName || applicant.user?.name || applicant.candidateProfile?.fullName || `User ID: ${applicant.userId}`}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {applicant.candidateProfile?.jobTitle || applicant.user?.designation || `Job ID: ${applicant.jobId}`}
                            </li>
                            <li>
                              <span className="icon la la-venus-mars"></span>{" "}
                              {applicant.candidateProfile?.gender || 'N/A'}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              { 
                                [ 
                                  applicant.candidateProfile?.address,
                                  applicant.candidateProfile?.city,
                                  applicant.candidateProfile?.province
                                ].filter(Boolean).join(', ') || 
                                applicant.user?.location || 
                                `Status: ${applicant.status}`
                              }
                            </li>
                          </ul>

                          <ul className="post-tags">
                            {applicant.candidateProfile?.skills?.map((skill, i) => (
                              <li key={i}>
                                <a href="#">{skill.id || skill}</a>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button
                                data-text="View Applicant"
                                onClick={() => { setSelectedApplicationId(applicant.applicationId); setShowModal(true); }}
                              >
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Approve Applicant"
                                className={applicant.status === 'Approved' ? 'approved' : (applicant.status === 1 ? 'approved' : '')}
                              >
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                data-text="Reject Applicant"
                                className={applicant.status === 'Rejected' ? 'rejected' : (applicant.status === 2 ? 'rejected' : '')}
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
      <ApplicantModal
        applicationId={selectedApplicationId}
        show={showModal}
        onClose={() => setShowModal(false)}
      />
      <style jsx global>{`
        .CircularProgressbar-text {
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default WidgetContentBox;
