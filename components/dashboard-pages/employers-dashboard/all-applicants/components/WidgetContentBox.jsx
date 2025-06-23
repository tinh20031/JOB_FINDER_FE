"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import ApiService from "@/services/api.service";
import { jobService } from "@/services/jobService";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import Image from "next/image";

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
        {application ? (
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
        ) : (
          <div>Loading...</div>
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

          setApplicants(fulfilledApplicants);
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
    return <div className="text-center py-5">Loading applicants...</div>;
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
                {applicants.map((applicant) => (
                  <div
                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                    key={applicant.applicationId}
                  >
                    <div className="inner-box">
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
                          <li>
                            <button data-text="Delete Applicant">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {applicants.filter(app => (app.status === 'Approved' || app.status === 1) && app.candidateProfile).map((applicant) => (
                  <div
                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                    key={applicant.applicationId}
                  >
                    <div className="inner-box">
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
                          <li>
                            <button data-text="Delete Applicant">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="row">
                {applicants.filter(app => (app.status === 'Rejected' || app.status === 2) && app.candidateProfile).map((applicant) => (
                  <div
                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                    key={applicant.applicationId}
                  >
                    <div className="inner-box">
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
                          <li>
                            <button data-text="Delete Applicant">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default WidgetContentBox;
