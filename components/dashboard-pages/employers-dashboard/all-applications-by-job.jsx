"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applicationService } from "@/services/applicationService";
import MobileMenu from "@/components/header/MobileMenu";
import DashboardHeader from "@/components/header/DashboardHeader";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardEmployerSidebar from "@/components/header/DashboardEmployerSidebar";
import BreadCrumb from "../BreadCrumb";
import CopyrightFooter from "../CopyrightFooter";
import MenuToggler from "../MenuToggler";

const TableSkeleton = () => (
  <div className="table-outer">
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Cover Letter</th>
          <th>CV</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, idx) => (
          <tr key={idx}>
            <td><div className="skeleton-line long" style={{ height: 18, marginBottom: 8, borderRadius: 6 }}></div></td>
            <td><div className="skeleton-line long" style={{ height: 16, borderRadius: 6 }}></div></td>
            <td><div className="skeleton-line short" style={{ height: 16, borderRadius: 6 }}></div></td>
          </tr>
        ))}
      </tbody>
    </table>
    <style jsx>{`
      .skeleton-line {
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
);

const AllApplicationsByJob = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const handleShowModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  useEffect(() => {
    if (!jobId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await applicationService.getApplicationsByJob(jobId);
        setApplications(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <LoginPopup />
      <DashboardHeader />
      <MobileMenu />
      <DashboardEmployerSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="All applicants for this job!" />
          <MenuToggler />
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>All applicants</h4>
                  </div>
                  <div className="widget-content">
                    {loading ? (
                      <TableSkeleton />
                    ) : error ? (
                      <div className="alert alert-danger">{error}</div>
                    ) : applications.length === 0 ? (
                      <div>No applicants found for this job.</div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Cover Letter</th>
                              <th>CV</th>
                            </tr>
                          </thead>
                          <tbody>
                            {applications.map(app => (
                              <tr key={app.applicationId || app.ApplicationId}>
                                <td>
                                  {new Date(app.submittedAt || app.SubmittedAt).toLocaleTimeString('en-US', { hour12: false })} {new Date(app.submittedAt || app.SubmittedAt).toLocaleDateString('en-US')}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      maxWidth: 220,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      verticalAlign: 'middle'
                                    }}
                                  >
                                    {app.coverLetter || app.CoverLetter}
                                  </span>
                                  {(app.coverLetter || app.CoverLetter) && (app.coverLetter || app.CoverLetter).length > 100 && (
                                    <button
                                      style={{
                                        marginLeft: 8,
                                        background: 'none',
                                        border: 'none',
                                        color: '#1967d2',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontSize: 13
                                      }}
                                      onClick={() => handleShowModal(app.coverLetter || app.CoverLetter)}
                                    >
                                      View more
                                    </button>
                                  )}
                                </td>
                                <td>
                                  <ul className="option-list" style={{margin: 0, padding: 0, listStyle: 'none'}}>
                                    <li>
                                      <button
                                        data-text="View CV"
                                        onClick={() => window.open(app.resumeUrl || app.ResumeUrl, '_blank')}
                                      >
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {showModal && (
                          <div className="modal-overlay">
                            <div className="modal-content">
                              <h4>Cover Letter</h4>
                              <div className="modal-body" style={{ whiteSpace: 'pre-line', margin: '16px 0' }}>{modalContent}</div>
                              <button onClick={() => setShowModal(false)} style={{marginTop: 8, background: '#1967d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', cursor: 'pointer'}}>Close</button>
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
                                max-width: 480px;
                                width: 100%;
                                padding: 32px 24px 24px 24px;
                                max-height: 80vh;
                                overflow: hidden;
                                display: flex;
                                flex-direction: column;
                              }
                              .modal-body {
                                flex: 1 1 auto;
                                overflow-y: auto;
                                min-height: 60px;
                                max-height: 55vh;
                              }
                            `}</style>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CopyrightFooter />
    </div>
  );
};

export default AllApplicationsByJob; 