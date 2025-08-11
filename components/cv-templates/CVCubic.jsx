import React from "react";
import { FiPhone, FiMail, FiCalendar, FiMapPin, FiGlobe } from "react-icons/fi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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

export default function CVCubic({ resume, accentColor, removeLogo, setRemoveLogo }) {
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
        background: "#f5f5f5",
        color: "#222",
        maxWidth: 800,
        margin: "0 auto",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {/* Decorative Corner Triangles */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "60px 0 0 60px",
          borderColor: `transparent transparent transparent ${
            accentColor || "#c4185c"
          }`,
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 60px 60px 0",
          borderColor: `transparent ${
            accentColor || "#c4185c"
          } transparent transparent`,
          zIndex: 2,
        }}
      />

      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "80px 60px 40px 60px",
          borderBottom: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        {/* Avatar */}
        <div style={{ marginBottom: "20px" }}>
          <img
                            src={resume?.image || resume?.avatar || "/images/resource/candidate-1.png"}
            alt="avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: "8px",
              objectFit: "cover",
              background: "#eee",
              border: "2px solid #ddd",
            }}
          />
        </div>

        {/* Name and Job Title */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: "bold",
            margin: "0 0 8px 0",
            color: accentColor || "#c4185c",
          }}
        >
          {resume?.fullName || ""}
        </h1>
        <div
          style={{
            fontSize: 16,
            margin: "0 0 24px 0",
            color: "#666",
            letterSpacing: "1px",
          }}
        >
          {resume?.jobTitle || ""}
        </div>

        {/* Contact Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 40px",
            fontSize: 14,
            color: "#444",
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
                <FiPhone size={14} color={accentColor || "#c4185c"} />{" "}
                {resume.phone}
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
                <FiMail size={14} color={accentColor || "#c4185c"} />{" "}
                {resume.email}
              </div>
            )}
            {(resume?.address || resume?.province || resume?.city) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiMapPin size={14} color={accentColor || "#c4185c"} />{" "}
                {[resume.address, resume.province, resume.city]
                  .filter(Boolean)
                  .join(", ")}
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
                <FiCalendar size={14} color={accentColor || "#c4185c"} />{" "}
                {formatDate(resume.dob)}
              </div>
            )}
            {resume?.personalLink && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiGlobe size={14} color={accentColor || "#c4185c"} />{" "}
                {resume.personalLink}
              </div>
            )}
          </div>
        </div>

        {/* About Me */}
        <div style={{ marginTop: "24px" }}>
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
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 60px 40px 60px", background: "#f5f5f5" }}>
        <Section title="EDUCATION" accentColor={accentColor}>
          {Array.isArray(resume?.educations) && resume.educations.length > 0 ? (
            resume.educations.map((edu) => (
              <div
                key={edu.educationId}
                style={{ marginBottom: 20, display: "flex", gap: 20 }}
              >
                <div style={{ fontSize: 13, color: "#666", minWidth: 100 }}>
                  {formatDateRange(
                    edu.monthStart,
                    edu.monthEnd,
                    edu.isStudying
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4,
                      color: "#333",
                    }}
                  >
                    {edu.school}
                  </div>
                  <div style={{ fontSize: 14, color: "#666" }}>
                    {edu.detail}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No education information.</div>
          )}
        </Section>

        <Section title="WORK EXPERIENCE" accentColor={accentColor}>
          {Array.isArray(resume?.workExperiences) &&
          resume.workExperiences.length > 0 ? (
            resume.workExperiences.map((exp) => (
              <div
                key={exp.workExperienceId}
                style={{ marginBottom: 24, display: "flex", gap: 20 }}
              >
                <div style={{ fontSize: 13, color: "#666", minWidth: 100 }}>
                  {formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4,
                      color: "#333",
                    }}
                  >
                    {exp.jobTitle}
                  </div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    {exp.companyName}
                  </div>
                  {exp.workDescription && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.workDescription }}
                    />
                  )}
                  {exp.responsibilities && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                    />
                  )}
                  {exp.achievements && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.achievements }}
                    />
                  )}
                  {exp.technologies && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.technologies }}
                    />
                  )}
                  {exp.projectName && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.projectName }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No work experience.</div>
          )}
        </Section>

        <Section title="SKILL" accentColor={accentColor}>
          <div>
            {coreSkills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 12,
                    fontSize: 14,
                    color: "#333",
                  }}
                >
                  Core Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {coreSkills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#e9ecef",
                        color: "#333",
                        borderRadius: 4,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: "500",
                        border: "1px solid #dee2e6",
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
                  style={{
                    fontWeight: "bold",
                    marginBottom: 12,
                    fontSize: 14,
                    color: "#333",
                  }}
                >
                  Soft Skills
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: "1.8" }}>
                  {softSkills.map((s, idx) => (
                    <li
                      key={idx}
                      style={{ fontSize: 13, marginBottom: 4, color: "#444" }}
                    >
                      {s.skillName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>

        <Section title="FOREIGN LANGUAGE" accentColor={accentColor}>
          {Array.isArray(resume?.foreginLanguages) &&
          resume.foreginLanguages.length > 0 ? (
            resume.foreginLanguages.map((lang) => (
              <div
                key={lang.foreignLanguageId}
                style={{ fontSize: 14, marginBottom: 8 }}
              >
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  {lang.languageName}
                </span>
                <span style={{ color: "#666" }}> ({lang.languageLevel})</span>
              </div>
            ))
          ) : (
            <div>No foreign language.</div>
          )}
        </Section>

        <Section title="HIGHLIGHT PROJECT" accentColor={accentColor}>
          {Array.isArray(resume?.highlightProjects) &&
          resume.highlightProjects.length > 0 ? (
            resume.highlightProjects.map((proj) => (
              <div
                key={proj.highlightProjectId}
                style={{ marginBottom: 20, display: "flex", gap: 20 }}
              >
                <div style={{ fontSize: 13, color: "#666", minWidth: 100 }}>
                  {formatDateRange(
                    proj.monthStart,
                    proj.monthEnd,
                    proj.isWorking
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 8,
                      color: "#333",
                    }}
                  >
                    {proj.projectName}
                  </div>
                  {proj.projectDescription && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: proj.projectDescription,
                      }}
                    />
                  )}
                  {proj.technologies && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: proj.technologies,
                      }}
                    />
                  )}
                  {proj.responsibilities && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: proj.responsibilities,
                      }}
                    />
                  )}
                  {proj.teamSize && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: proj.teamSize,
                      }}
                    />
                  )}
                  {proj.achievements && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: "1.5",
                        marginBottom: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: proj.achievements,
                      }}
                    />
                  )}
                  {proj.projectLink && (
                    <div style={{ fontSize: 13 }}>
                      <a
                        href={proj.projectLink}
                        target="_blank"
                        style={{
                          color: accentColor || "#c4185c",
                          textDecoration: "underline",
                        }}
                        rel="noopener noreferrer"
                      >
                        {proj.projectLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No highlight project.</div>
          )}
        </Section>

        <Section title="CERTIFICATE" accentColor={accentColor}>
          {Array.isArray(resume?.certificates) &&
          resume.certificates.length > 0 ? (
            resume.certificates.map((cert) => (
              <div
                key={cert.certificateId}
                style={{ marginBottom: 20, display: "flex", gap: 20 }}
              >
                <div style={{ fontSize: 13, color: "#666", minWidth: 100 }}>
                  {formatMonthYear(cert.month)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4,
                      color: "#333",
                    }}
                  >
                    {cert.certificateName}
                  </div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    {cert.organization}
                  </div>
                  {cert.certificateUrl && (
                    <div style={{ fontSize: 13, marginBottom: 8 }}>
                      <span style={{ fontWeight: "bold", color: "#333" }}>
                        Certificate URL:{" "}
                      </span>
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        style={{
                          color: accentColor || "#c4185c",
                          textDecoration: "underline",
                        }}
                        rel="noopener noreferrer"
                      >
                        {cert.certificateUrl}
                      </a>
                    </div>
                  )}
                  {cert.certificateDescription && (
                    <div
                      style={{ fontSize: 13, color: "#444", lineHeight: "1.5" }}
                      dangerouslySetInnerHTML={{
                        __html: cert.certificateDescription,
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>No certificate.</div>
          )}
        </Section>

        <Section title="AWARD" accentColor={accentColor}>
          {Array.isArray(resume?.awards) && resume.awards.length > 0 ? (
            resume.awards.map((award) => (
              <div
                key={award.awardId}
                style={{ marginBottom: 20, display: "flex", gap: 20 }}
              >
                <div style={{ fontSize: 13, color: "#666", minWidth: 100 }}>
                  {formatMonthYear(award.month)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4,
                      color: "#333",
                    }}
                  >
                    {award.awardName}
                  </div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    {award.awardOrganization}
                  </div>
                  {award.awardDescription && (
                    <div
                      style={{ fontSize: 13, color: "#444", lineHeight: "1.5" }}
                      dangerouslySetInnerHTML={{
                        __html: award.awardDescription,
                      }}
                    />
                  )}
                </div>
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

function Section({ title, children, accentColor }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {/* Diamond Icon */}
        <div
          style={{
            width: 12,
            height: 12,
            background: accentColor || "#c4185c",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: accentColor || "#c4185c",
            letterSpacing: "1px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "#ddd",
            marginLeft: 8,
          }}
        />
      </div>
      <div>{children}</div>
    </div>
  );
}
