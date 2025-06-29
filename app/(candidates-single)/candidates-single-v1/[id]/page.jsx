'use client';
import dynamic from "next/dynamic";
import candidateResume from "@/data/candidateResume";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import Image from "next/image";
import { useEffect, useState } from "react";
import ApiService from "@/services/api.service";
import { getToken } from "@/services/authService";
import useResumeData from "@/services/useResumeData";
import { getAboutMeByUserId } from "@/services/useResumeData";

const CandidateSingleDynamicV1 = ({ params }) => {
  const id = params.id;
  const [candidate, setCandidate] = useState(null);
  const [user, setUser] = useState(null);
  const [aboutMe, setAboutMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, foreignlanguage, education, skills, project, awards, loading: resumeLoading, experiences } = useResumeData();

  const skillColors = [
    { bg: "#eaf2fe", color: "#2563eb" },
    { bg: "#e6f4ea", color: "#22c55e" },
    { bg: "#fff7ed", color: "#f59e42" },
    { bg: "#fef9c3", color: "#eab308" },
    { bg: "#fce7f3", color: "#db2777" },
    { bg: "#ede9fe", color: "#7c3aed" },
    { bg: "#f1f5f9", color: "#334155" },
    { bg: "#f3e8ff", color: "#a21caf" },
  ];
  function getRandomColor(idx) {
    return skillColors[idx % skillColors.length];
  }

  function formatMonthYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}-${year}`;
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiService.getCandidateProfileById(id),
      ApiService.getUserById(id),
      getAboutMeByUserId(id)
    ])
      .then(([candidateData, userData, aboutMeData]) => {
        setCandidate(candidateData);
        setUser(userData);
        setAboutMe(aboutMeData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading candidate data");
        setLoading(false);
      });
  }, [id]);

  // Hàm tính tuổi từ ngày sinh
  function getAge(dob) {
    if (!dob) return "No info";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  if (loading || resumeLoading) return <div>Loading data...</div>;
  if (error) return <div>{error}</div>;
  if (!candidate || !user) return <div>Candidate not found</div>;

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
      <section className="candidate-detail-section">
        <div className="upper-box">
          <div className="auto-container">
            <div className="candidate-block-five">
              <div className="inner-box">
                <div className="content">
                  <figure className="image">
                    <Image
                      width={100}
                      height={100}
                      src={user.image || "/images/resource/default-avatar.png"}
                      alt="avatar"
                    />
                  </figure>
                  <h4 className="name">{user.fullName}</h4>

                  {/* Tag cho Province và JobTitle */}
                  <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', background: '#eaf2fe', color: '#2563eb', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>
                      <span className="icon flaticon-map-locator" style={{ marginRight: 6, fontSize: 15 }}></span>
                      {candidate?.province || candidate?.provine || candidate?.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', background: '#e6f4ea', color: '#22c55e', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>
                      <span className="icon flaticon-briefcase" style={{ marginRight: 6, fontSize: 15 }}></span>
                      {candidate?.jobTitle || candidate?.designation}
                    </span>
                  </div>

                  <ul className="post-tags">
                    {candidate?.tags?.map((val, i) => (
                      <li key={i}>{val}</li>
                    ))}
                  </ul>
                </div>

                <div className="btn-box">
                  <a
                    className="theme-btn btn-style-one"
                    href="/images/sample.pdf"
                    download
                  >
                    Download CV
                  </a>
                
                </div>
              </div>
            </div>
            {/*  <!-- Candidate block Five --> */}
          </div>
        </div>
        {/* <!-- Upper Box --> */}

        <div className="candidate-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <div className="video-outer">
                    <h4>Candidates About</h4>
                    {aboutMe && aboutMe.aboutMeDescription ? (
                      <div dangerouslySetInnerHTML={{ __html: aboutMe.aboutMeDescription }} />
                    ) : (
                      <p>No information</p>
                    )}
                  </div>

                  {/* Work Experience Timeline */}
                  {experiences && experiences.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <h4 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: 20, fontFamily: 'inherit', color: '#222' }}>Work Experience</h4>
                      <div>
                        {experiences.map((item, idx) => {
                          const isLast = idx === experiences.length - 1;
                          const start = formatMonthYear(item.yearStart);
                          const end = item.yearEnd ? formatMonthYear(item.yearEnd) : 'NOW';
                          return (
                            <div key={idx} style={{ marginBottom: 32, position: 'relative', paddingLeft: 38 }}>
                              {/* Đường kẻ dọc timeline */}
                              {!isLast && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: 32,
                                    bottom: 0,
                                    width: 2,
                                    borderLeft: '2px dashed #2563eb',
                                    zIndex: 0,
                                  }}
                                />
                              )}
                              {/* Icon tròn */}
                              <span style={{
                                position: 'absolute', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', background: '#eaf2fe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: '2px solid #eaf2fe', zIndex: 1
                              }}>{item.companyName?.[0] || 'W'}</span>
                              <div style={{ fontSize: 16, fontWeight: 600, color: '#363636', marginBottom: 0 }}>
                                {item.companyName}
                                {item.jobTitle && <span> — {item.jobTitle}</span>}
                              </div>
                              <div style={{ color: '#2563eb', background: '#eaf2fe', display: 'inline-block', borderRadius: 16, padding: '2px 16px', fontWeight: 600, fontSize: 15, margin: '8px 0', fontSize: '1rem', lineHeight: 1.7, fontWeight: 400 }}>
                                {start} -- {end}
                              </div>
                              <div style={{ fontSize: '1rem', lineHeight: 1.7, fontWeight: 400, color: '#555', marginBottom: 6 }}>
                                {item.workDescription && item.workDescription.includes('<') ? (
                                  <span dangerouslySetInnerHTML={{ __html: item.workDescription }} />
                                ) : (
                                  item.workDescription
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Highlight Project Timeline */}
                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: 20, fontFamily: 'inherit', color: '#222' }}>Highlight Project</h4>
                    {project && project.length > 0 ? (
                      <div>
                        {project.map((item, idx) => {
                          const isLast = idx === project.length - 1;
                          const start = formatMonthYear(item.yearStart);
                          const end = item.yearEnd ? formatMonthYear(item.yearEnd) : 'NOW';
                          return (
                            <div key={idx} style={{ marginBottom: 32, position: 'relative', paddingLeft: 38 }}>
                              {/* Đường kẻ dọc timeline */}
                              {!isLast && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: 32,
                                    bottom: 0,
                                    width: 2,
                                    borderLeft: '2px dashed #f59e42',
                                    zIndex: 0,
                                  }}
                                />
                              )}
                              {/* Icon tròn */}
                              <span style={{
                                position: 'absolute', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', background: '#fef9c3', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: '2px solid #fef9c3', zIndex: 1
                              }}>{item.projectName?.[0] || 'P'}</span>
                              <div style={{ fontWeight: 500, fontSize: '1rem' }}>{item.projectName}</div>
                              <div style={{ color: '#f59e42', background: '#fff7ed', display: 'inline-block', borderRadius: 16, padding: '2px 16px', fontWeight: 600, fontSize: 15, margin: '8px 0', fontSize: '1rem', lineHeight: 1.7, fontWeight: 400, color: '#555' }}>
                                {start} -- {end}
                              </div>
                              <div style={{ fontSize: '1rem', lineHeight: 1.7, fontWeight: 400, color: '#555', marginBottom: 6 }}>
                                {item.projectDescription && item.projectDescription.includes('<') ? (
                                  <span dangerouslySetInnerHTML={{ __html: item.projectDescription }} />
                                ) : (
                                  item.projectDescription
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div>No Highlight Project</div>}
                  </div>

                  {/* Awards Timeline */}
                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: 20, fontFamily: 'inherit', color: '#222' }}>Awards</h4>
                    {awards && awards.length > 0 ? (
                      <div>
                        {awards.map((item, idx) => {
                          const isLast = idx === awards.length - 1;
                          return (
                            <div key={idx} style={{ marginBottom: 32, position: 'relative', paddingLeft: 38 }}>
                              {/* Đường kẻ dọc timeline */}
                              {!isLast && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: 32,
                                    bottom: 0,
                                    width: 2,
                                    borderLeft: '2px dashed #db2777',
                                    zIndex: 0,
                                  }}
                                />
                              )}
                              {/* Icon tròn */}
                              <span style={{
                                position: 'absolute', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, border: '2px solid #fce7f3', zIndex: 1
                              }}>{item.awardName?.[0] || 'A'}</span>
                              <div style={{ fontWeight: 500, fontSize: '1rem' }}>{item.awardName}</div>
                              <div style={{ color: '#db2777', background: '#fce7f3', display: 'inline-block', borderRadius: 16, padding: '2px 16px', fontWeight: 600, fontSize: 15, margin: '8px 0', fontSize: '1rem', lineHeight: 1.7, fontWeight: 400, color: '#555' }}>
                                {formatMonthYear(item.year)}
                              </div>
                              <div style={{ fontSize: '1rem', lineHeight: 1.7, fontWeight: 400, color: '#555', marginBottom: 6 }}>
                                {item.awardDescription && item.awardDescription.includes('<') ? (
                                  <span dangerouslySetInnerHTML={{ __html: item.awardDescription }} />
                                ) : (
                                  item.awardDescription
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div>No Awards</div>}
                  </div>
                </div>
              </div>
              {/* End .content-column */}

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    <div className="widget-content">
                      <ul className="job-overview">
                        <li>
                          <i className="icon icon-expiry"></i>
                          <h5>Age:</h5>
                          <span>{profile?.dob ? getAge(profile.dob) + " Years" : "No info"}</span>
                        </li>
                        <li>
                          <i className="icon icon-user-2"></i>
                          <h5>Gender:</h5>
                          <span>{profile?.gender || "No info"}</span>
                        </li>
                        <li>
                          <i className="icon icon-language"></i>
                          <h5>Language:</h5>
                          <span>{foreignlanguage && foreignlanguage.length > 0 ? foreignlanguage.map(l => l.languageName).join(", ") : "No info"}</span>
                        </li>
                        <li>
                          <i className="icon icon-degree"></i>
                          <h5>Education Level:</h5>
                          <span>{education && education.length > 0 ? (education[0].degree || education[0].degreeName || "No info") : "No info"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* End .sidebar-widget conadidate overview */}


                  <div className="sidebar-widget">
                    <h4 className="widget-title">Professional Skills</h4>
                    <div className="widget-content">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {skills && skills.length > 0 ? (
                          skills.map((skill, idx) => {
                            const color = getRandomColor(idx);
                            return (
                              <span
                                key={idx}
                                style={{
                                  background: color.bg,
                                  color: color.color,
                                  borderRadius: '16px',
                                  padding: '4px 14px',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                {skill.skillName}
                              </span>
                            );
                          })
                        ) : (
                          <span>No info</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* End .sidebar-widget skill widget */}

                
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

export default dynamic(() => Promise.resolve(CandidateSingleDynamicV1), {
  ssr: false,
});
