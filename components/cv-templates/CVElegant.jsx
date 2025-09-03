import React from "react";
import { FiPhone, FiMail, FiCalendar, FiMapPin, FiGlobe } from "react-icons/fi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDateRange(start, end, isWorking) {
  if (!start) return "";
  const startDate = new Date(start);
  const startStr = `${String(startDate.getMonth() + 1).padStart(
    2,
    "0"
  )}/${startDate.getFullYear()}`;
  let endStr = "NOW";
  if (!isWorking && end) {
    const endDate = new Date(end);
    endStr = `${String(endDate.getMonth() + 1).padStart(
      2,
      "0"
    )}/${endDate.getFullYear()}`;
  }
  return `${startStr} - ${endStr}`;
}

function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CVElegant({ resume, accentColor, removeLogo, setRemoveLogo }) {
  const coreSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Core Skills")
    : [];
  const softSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Soft Skills")
    : [];

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#fff",
        color: "#222",
        maxWidth: 800,
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: accentColor || "#555",
          color: "#fff",
          padding: "30px 40px",
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <div>
          <img
                            src={resume?.image || resume?.avatar || "/images/resource/candidate-1.png"}
            alt="avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Main Info */}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: "bold",
              margin: "0 0 5px 0",
              letterSpacing: "1px",
            }}
          >
            {resume?.fullName || ""}
          </h1>
          <div
            style={{
              fontSize: 16,
              margin: "0 0 20px 0",
              color: "#ccc",
              letterSpacing: "2px",
            }}
          >
            {resume?.jobTitle || ""}
          </div>

          {/* Contact Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 30px",
              fontSize: 14,
            }}
          >
            {/* Left Column */}
            <div>
              {resume?.phone && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <FiPhone size={14} /> {resume.phone}
                </div>
              )}
              {resume?.email && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <FiMail size={14} /> {resume.email}
                </div>
              )}
              {resume?.personalLink && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiGlobe size={14} /> {resume.personalLink}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div>
              {resume?.dob && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <FiCalendar size={14} /> {formatDate(resume.dob)}
                </div>
              )}
              {(resume?.address || resume?.province || resume?.city) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiMapPin size={14} />{" "}
                  {[resume.address, resume.province, resume.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ background: "#fff" }}>
        <Section title="About me">
          <div
            style={{ fontSize: 14, lineHeight: "1.6", color: "#333" }}
            dangerouslySetInnerHTML={{
              __html:
                resume?.aboutme?.[0]?.aboutMeDescription ||
                resume?.aboutMes?.[0]?.aboutMeDescription ||
                resume?.about ||
                "No description.",
            }}
          />
        </Section>

        <Section title="Education">
          {Array.isArray(resume?.educations) && resume.educations.length > 0 ? (
            resume.educations.map((edu) => (
              <div key={edu.educationId} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#333",
                  }}
                >
                  {edu.school}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      color: accentColor || "#007bff",
                      fontWeight: "500",
                    }}
                  >
                    {formatDateRange(
                      edu.monthStart,
                      edu.monthEnd,
                      edu.isStudying
                    )}
                  </span>
                  <span>{edu.detail}</span>
                </div>
              </div>
            ))
          ) : (
            <div>No education information.</div>
          )}
        </Section>

        <Section title="Skill">
          <div>
            {coreSkills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{ fontWeight: "bold", marginBottom: 8, fontSize: 14 }}
                >
                  Core Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {coreSkills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: accentColor || "#007bff",
                        color: "#fff",
                        borderRadius: 3,
                        padding: "3px 8px",
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {s.skillName}
                      {s.experience ? ` (${s.experience})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {softSkills.length > 0 && (
              <div>
                <div
                  style={{ fontWeight: "bold", marginBottom: 8, fontSize: 14 }}
                >
                  Soft Skills
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: "1.6" }}>
                  {softSkills.map((s, idx) => (
                    <li key={idx} style={{ fontSize: 13, marginBottom: 4 }}>
                      {s.skillName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>

        <Section title="Work Experience">
          {Array.isArray(resume?.workExperiences) &&
          resume.workExperiences.length > 0 ? (
            resume.workExperiences.map((exp) => (
              <div key={exp.workExperienceId} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: accentColor || "#007bff",
                    fontWeight: "500",
                    marginBottom: 4,
                  }}
                >
                  {formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking)}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#333",
                  }}
                >
                  {exp.jobTitle}
                  {exp.companyName && (
                    <span style={{ fontWeight: "normal", color: "#666" }}>
                      {" "}
                      | {exp.companyName}
                    </span>
                  )}
                </div>
                {exp.workDescription && (
                  <div
                    style={{
                      color: "#333",
                      fontSize: 13,
                      lineHeight: "1.6",
                      marginBottom: 8,
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.workDescription }}
                  />
                )}
                {exp.responsibilities && (
                  <div
                    style={{
                      color: "#333",
                      fontSize: 13,
                      lineHeight: "1.6",
                      marginBottom: 8,
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                  />
                )}
                {exp.achievements && (
                  <div
                    style={{
                      color: "#333",
                      fontSize: 13,
                      lineHeight: "1.6",
                      marginBottom: 8,
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.achievements }}
                  />
                )}
                {exp.technologies && (
                  <div
                    style={{
                      color: "#333",
                      fontSize: 13,
                      lineHeight: "1.6",
                      marginBottom: 8,
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.technologies }}
                  />
                )}
                {exp.projectName && (
                  <div
                    style={{
                      color: "#333",
                      fontSize: 13,
                      lineHeight: "1.6",
                      marginBottom: 8,
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.projectName }}
                  />
                )}
              </div>
            ))
          ) : (
            <div>No work experience.</div>
          )}
        </Section>

        <Section title="Foreign Language">
          {Array.isArray(resume?.foreginLanguages) &&
          resume.foreginLanguages.length > 0 ? (
            resume.foreginLanguages.map((lang) => (
              <div
                key={lang.foreignLanguageId}
                style={{ fontSize: 13, marginBottom: 6 }}
              >
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  {lang.languageName}
                </span>
                <span style={{ color: "#666" }}> : {lang.languageLevel}</span>
              </div>
            ))
          ) : (
            <div>No foreign language.</div>
          )}
        </Section>

        <Section title="Highlight Project">
          {Array.isArray(resume?.highlightProjects) &&
          resume.highlightProjects.length > 0 ? (
            resume.highlightProjects.map((proj) => (
              <div key={proj.highlightProjectId} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: accentColor || "#007bff",
                    fontWeight: "500",
                    marginBottom: 4,
                  }}
                >
                  {formatDateRange(
                    proj.monthStart,
                    proj.monthEnd,
                    proj.isWorking
                  )}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 6,
                    color: "#333",
                  }}
                >
                  {proj.projectName}
                </div>
                {proj.projectDescription && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: proj.projectDescription,
                    }}
                  />
                )}
                {proj.technologies && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: proj.technologies,
                    }}
                  />
                )}
                {proj.responsibilities && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: proj.responsibilities,
                    }}
                  />
                )}
                {proj.teamSize && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: proj.teamSize,
                    }}
                  />
                )}
                {proj.achievements && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: proj.achievements,
                    }}
                  />
                )}

                {proj.projectLink && (
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    <a
                      href={proj.projectLink}
                      target="_blank"
                      style={{
                        color: accentColor || "#007bff",
                        textDecoration: "underline",
                      }}
                      rel="noopener noreferrer"
                    >
                      {proj.projectLink}
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No highlight project.</div>
          )}
        </Section>

        <Section title="Certificate">
          {Array.isArray(resume?.certificates) &&
          resume.certificates.length > 0 ? (
            resume.certificates.map((cert) => (
              <div key={cert.certificateId} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#333",
                  }}
                >
                  {cert.certificateName}
                  {cert.organization && (
                    <span
                      style={{
                        color: accentColor || "#007bff",
                        fontWeight: 400,
                      }}
                    >
                      {" - " + cert.organization}
                    </span>
                  )}
                  <span
                    style={{
                      float: "right",
                      color: accentColor || "#007bff",
                      fontWeight: 500,
                    }}
                  >
                    {formatMonthYear(cert.month)}
                  </span>
                </div>
                {cert.certificateUrl && (
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      style={{
                        color: accentColor || "#007bff",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                      }}
                      rel="noopener noreferrer"
                    >
                      {cert.certificateUrl}
                    </a>
                  </div>
                )}
                {cert.certificateDescription && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{
                      __html: cert.certificateDescription,
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <div>No certificate.</div>
          )}
        </Section>

        <Section title="Award">
          {Array.isArray(resume?.awards) && resume.awards.length > 0 ? (
            resume.awards.map((award) => (
              <div key={award.awardId} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    marginBottom: 4,
                    color: "#333",
                  }}
                >
                  {award.awardName}
                  {award.awardOrganization && (
                    <span
                      style={{
                        color: accentColor || "#007bff",
                        fontWeight: 400,
                      }}
                    >
                      {" - " + award.awardOrganization}
                    </span>
                  )}
                  <span
                    style={{
                      float: "right",
                      color: accentColor || "#007bff",
                      fontWeight: 500,
                    }}
                  >
                    {formatMonthYear(award.month)}
                  </span>
                </div>
                {award.awardDescription && (
                  <div
                    style={{ color: "#333", fontSize: 13, lineHeight: "1.6" }}
                    dangerouslySetInnerHTML={{ __html: award.awardDescription }}
                  />
                )}
              </div>
            ))
          ) : (
            <div>No award.</div>
          )}
        </Section>
        {/* Logo JobFinder */}
        {!removeLogo && (
          <div style={{textAlign: 'right', marginTop: 32}}>
            <img
              src="/images/jobfinder-logo.png"
              alt="JobFinder Logo"
              style={{height: 32, cursor: 'pointer'}}
              onClick={() => setRemoveLogo && setRemoveLogo(true)}
              title="Click để ẩn logo"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        padding: "20px 40px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 12,
          color: "#222",
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
