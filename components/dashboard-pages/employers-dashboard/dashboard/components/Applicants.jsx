"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { applicationService } from "@/services/applicationService";
import ApiService from "@/services/api.service";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 6;

const Applicants = ({ candidateName = "" }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Lấy companyId từ localStorage key 'user'
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const id = user.companyId || user.id || user.userId;
          setCompanyId(id);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (!companyId) return;
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const res = await applicationService.getRecentApplicantsByCompany(companyId);

        // Gộp theo userId, chỉ lấy lần applied cuối cùng
        const latestByUser = {};
        res.forEach(app => {
          if (
            !latestByUser[app.userId] ||
            new Date(app.submittedAt) > new Date(latestByUser[app.userId].submittedAt)
          ) {
            latestByUser[app.userId] = app;
          }
        });
        const uniqueApplicants = Object.values(latestByUser);

        // Gọi thêm API lấy avatar và số job đã applied cho từng applicant
        const applicantsWithDetails = await Promise.all(
          uniqueApplicants.map(async (app) => {
            let avatar = null;
            let fullName = null;
            let jobCount = null;
            try {
              const profile = await ApiService.getCandidateProfileById(app.UserId || app.userId);
              avatar = profile?.avatar || null;
              fullName = profile?.fullName || null;
              if (!fullName || !avatar) {
                const user = await ApiService.getUserById(app.UserId || app.userId);
                if (!fullName) fullName = user?.fullName || null;
                if (!avatar) avatar = user?.image || null;
              }
            } catch {}
            try {
              jobCount = await applicationService.getDistinctJobCountByUserInCompany(app.UserId || app.userId, companyId);
            } catch {}
            return { ...app, avatar, fullName, jobCount };
          })
        );
        setApplicants(applicantsWithDetails);
      } catch (err) {
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [companyId]);

  // Filter và phân trang sau khi đã map dữ liệu (có fullName)
  const filteredApplicants = candidateName
    ? applicants.filter(app =>
        (app.fullName || "")
          .toLowerCase()
          .includes(candidateName.toLowerCase())
      )
    : applicants;
  const totalPages = Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE);
  const pagedApplicants = filteredApplicants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return (
    <div className="row">
      {[...Array(ITEMS_PER_PAGE)].map((_, idx) => (
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

  return (
    <>
      {pagedApplicants.map((app, idx) => (
        <div
          className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
          key={app.applicationId ?? `${app.userId ?? 'u'}-${app.jobId ?? 'j'}-${idx}`}
        >
          <div className="inner-box">
            <div className="content">
              <figure className="image">
                <Image
                  width={90}
                  height={90}
                  src={app.avatar || "/images/resource/candidate-1.png"}
                  alt={app.fullName || `Applicant Avatar`}
                />
              </figure>
              <h4 className="name">
                <Link href={`/candidate-profile/${app.UserId || app.userId}`}>
                  {app.fullName || "N/A"}
                </Link>
              </h4>

              <ul className="candidate-info">
                <li>
                  <span className="icon flaticon-map-locator"></span>{" "}
                  {(() => {
                    if (app.candidateProfile) {
                      const arr = [
                        app.candidateProfile.address,
                        app.candidateProfile.city,
                        app.candidateProfile.province
                      ].filter(Boolean);
                      if (arr.length > 0) return arr.join(', ');
                    }
                    if (app.user && app.user.location) return app.user.location;
                    if (app.address) return app.address;
                    return "N/A";
                  })()}
                </li>
                <li>
                  <span className="icon la la-calendar"></span>{" "}
                  {app.submittedAt ? (
                    <>
                      <span style={{ fontWeight: 500 }}>Last applied:</span> {new Date(app.submittedAt).toLocaleString()}
                    </>
                  ) : "N/A"}
                </li>
                {typeof app.jobCount === 'number' && (
                  <li style={{ color: '#1967d2', fontWeight: 500 }}>
                    Applied for {app.jobCount} job(s) at your company
                  </li>
                )}
              </ul>
            </div>
            <div className="option-box">
              <ul className="option-list">
                <li>
                  <button data-text="View Applicant">
                    <span className="la la-eye"></span>
                  </button>
                </li>
                <li>
                  <button data-text="Approve Applicant">
                    <span className="la la-check"></span>
                  </button>
                </li>
                <li>
                  <button
                    data-text="View all jobs this candidate applied for at your company"
                    onClick={() => {
                      if (app.userId && companyId) {
                        router.push(`/company-dashboard/shortlisted-resumes?userId=${app.userId}&companyId=${companyId}`);
                      }
                    }}
                  >
                    <span className="la la-list"></span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ))}
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

export default Applicants;

