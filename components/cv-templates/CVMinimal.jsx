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

export default function CVMinimal({ resume, accentColor, removeLogo, setRemoveLogo }) {
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
        maxWidth: 900,
        margin: "0 auto",
        border: "1px solid #ddd",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#e8e8e8",
          padding: "40px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side - Name and Job Title */}
        <div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: "bold",
              margin: "0 0 8px 0",
              color: "#333",
            }}
          >
            {resume?.fullName || ""}
          </h1>
          <div
            style={{
              fontSize: 16,
              color: "#666",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {resume?.jobTitle || ""}
          </div>
        </div>

        {/* Right side - Avatar */}
        <div>
          <img
                            src={resume?.image || resume?.avatar || "/images/resource/candidate-1.png"}
            alt="avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0",
          minHeight: "600px",
        }}
      >
        {/* Left Column */}
        <div
          style={{
            padding: "40px 30px 40px 50px",
            borderRight: "1px solid #ddd",
          }}
        >
          {/* Personal Details */}
          <Section title="PERSONAL DETAILS" accentColor={accentColor}>
            <div style={{ fontSize: 14, lineHeight: "24px" }}>
              {resume?.phone && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <FiPhone size={16} color="#666" />
                  <span>{resume.phone}</span>
                </div>
              )}
              {resume?.email && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <FiMail size={16} color="#666" />
                  <span>{resume.email}</span>
                </div>
              )}
              {resume?.dob && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <FiCalendar size={16} color="#666" />
                  <span>{formatDate(resume.dob)}</span>
                </div>
              )}
              {(resume?.address || resume?.province || resume?.city) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <FiMapPin size={16} color="#666" />
                  <span>
                    {[resume.address, resume.province, resume.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {resume?.personalLink && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#121212",
                  }}
                >
                  <FiGlobe size={16} color="#666" />
                  <span
                    style={{ textDecoration: "underline", color: "#121212" }}
                  >
                    {resume.personalLink}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* About Me */}
          <Section title="ABOUT ME" accentColor={accentColor}>
            <div
              style={{ fontSize: 14, lineHeight: "1.6", color: "#444" }}
              dangerouslySetInnerHTML={{
                __html:
                  resume?.aboutme?.[0]?.aboutMeDescription ||
                  resume?.aboutMes?.[0]?.aboutMeDescription ||
                  resume?.about ||
                  "No description.",
              }}
            />
          </Section>

          {/* Education */}
          <Section title="EDUCATION" accentColor={accentColor}>
            {Array.isArray(resume?.educations) &&
            resume.educations.length > 0 ? (
              resume.educations.map((edu) => (
                <div key={edu.educationId} style={{ marginBottom: 20 }}>
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
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                    {edu.detail}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {formatDateRange(
                      edu.monthStart,
                      edu.monthEnd,
                      edu.isStudying
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 14, color: "#666" }}>
                No education information.
              </div>
            )}
          </Section>

          {/* Skills */}
          <Section title="SKILL" accentColor={accentColor}>
            {coreSkills.length > 0 && (
              <div style={{ marginBottom: 24 }}>
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
                <div>
                  {coreSkills.map((s, idx) => (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          background: "#0066cc",
                          color: "#fff",
                          borderRadius: 3,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: "500",
                          marginRight: 8,
                        }}
                      >
                        {s.skillName}
                        {s.experience ? ` (${s.experience})` : ""}
                      </span>
                    </div>
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
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: "1.8" }}>
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
          </Section>

          {/* Foreign Language */}
          <Section title="FOREIGN LANGUAGE" accentColor={accentColor}>
            {Array.isArray(resume?.foreginLanguages) &&
            resume.foreginLanguages.length > 0 ? (
              resume.foreginLanguages.map((lang) => (
                <div
                  key={lang.foreignLanguageId}
                  style={{ fontSize: 14, marginBottom: 8 }}
                >
                  <span style={{ fontWeight: "bold", color: "#333" }}>
                    {lang.languageName}:
                  </span>
                  <span style={{ color: "#666", marginLeft: 4 }}>
                    {lang.languageLevel}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 14, color: "#666" }}>
                No foreign language.
              </div>
            )}
          </Section>
        </div>

        {/* Right Column */}
        <div style={{ padding: "40px 50px 40px 30px" }}>
          {/* Work Experience */}
          <Section title="WORK EXPERIENCE" accentColor={accentColor}>
            {Array.isArray(resume?.workExperiences) &&
            resume.workExperiences.length > 0 ? (
              resume.workExperiences.map((exp) => (
                <div key={exp.workExperienceId} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#333",
                      }}
                    >
                      {exp.jobTitle}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        whiteSpace: "nowrap",
                        marginLeft: 16,
                      }}
                    >
                      {formatDateRange(
                        exp.monthStart,
                        exp.monthEnd,
                        exp.isWorking
                      )}
                    </div>
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
              ))
            ) : (
              <div style={{ fontSize: 14, color: "#666" }}>
                No work experience.
              </div>
            )}
          </Section>

          {/* Highlight Project */}
          <Section title="HIGHLIGHT PROJECT" accentColor={accentColor}>
            {Array.isArray(resume?.highlightProjects) &&
            resume.highlightProjects.length > 0 ? (
              resume.highlightProjects.map((proj) => (
                <div key={proj.highlightProjectId} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#333",
                      }}
                    >
                      {proj.projectName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        whiteSpace: "nowrap",
                        marginLeft: 16,
                      }}
                    >
                      {formatDateRange(
                        proj.monthStart,
                        proj.monthEnd,
                        proj.isWorking
                      )}
                    </div>
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
                          color: "#0066cc",
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
              <div style={{ fontSize: 14, color: "#666" }}>
                No highlight project.
              </div>
            )}
          </Section>

          {/* Certificate */}
          <Section title="CERTIFICATE" accentColor={accentColor}>
            {Array.isArray(resume?.certificates) &&
            resume.certificates.length > 0 ? (
              resume.certificates.map((cert) => (
                <div key={cert.certificateId} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        color: "#333",
                      }}
                    >
                      {cert.certificateName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        whiteSpace: "nowrap",
                        marginLeft: 16,
                      }}
                    >
                      {formatMonthYear(cert.month)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
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
                          color: "#0066cc",
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
              ))
            ) : (
              <div style={{ fontSize: 14, color: "#666" }}>No certificate.</div>
            )}
          </Section>

          {/* Award */}
          <Section title="AWARD" accentColor={accentColor}>
            {Array.isArray(resume?.awards) && resume.awards.length > 0 ? (
              resume.awards.map((award) => (
                <div key={award.awardId} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        color: "#333",
                      }}
                    >
                      {award.awardName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        whiteSpace: "nowrap",
                        marginLeft: 16,
                      }}
                    >
                      {formatMonthYear(award.month)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
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
              ))
            ) : (
              <div style={{ fontSize: 14, color: "#666" }}>No award.</div>
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
    </div>
  );
}

function Section({ title, children, accentColor }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 14,
          color: accentColor || "#e74c3c",
          marginBottom: 16,
          letterSpacing: "1px",
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
