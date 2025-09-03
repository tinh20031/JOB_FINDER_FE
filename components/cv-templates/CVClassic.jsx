import React from "react";
import { FiPhone, FiMail, FiCalendar, FiMapPin, FiGlobe } from "react-icons/fi";

function formatDateRange(start, end, isWorking) {
  if (!start) return "";
  const startDate = new Date(start);
  const startStr = `${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
  let endStr = "NOW";
  if (!isWorking && end) {
    const endDate = new Date(end);
    endStr = `${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
  }
  return `${startStr} - ${endStr}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CVClassic({ resume, accentColor, removeLogo, setRemoveLogo }) {
  // Phân loại kỹ năng
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
        color: "#111",
        padding: 32,
        maxWidth: 800,
        margin: "0 auto",
        border: "1px solid #ccc",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
            color: accentColor,
          }}
        >
          {resume?.fullName || ""}
        </h1>
        {resume?.jobTitle && (
          <div style={{ fontSize: 18, fontWeight: 500, margin: "8px 0" }}>
            {resume.jobTitle}
          </div>
        )}
        {/* Thông tin liên hệ dạng 2 dòng, mỗi dòng 3 cột, icon đen trắng */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            margin: "8px 0 2px 0",
          }}
        >
          {resume?.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
              }}
            >
              <FiPhone style={{ color: "#111" }} />
              {resume.phone}
            </div>
          )}
          {resume?.email && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
              }}
            >
              <FiMail style={{ color: "#111" }} />
              <a href={`mailto:${resume.email}`} style={{ color: "#111" }}>
                {resume.email}
              </a>
            </div>
          )}
          {resume?.dob && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
              }}
            >
              <FiCalendar style={{ color: "#111" }} />
              {formatDate(resume.dob)}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            margin: "2px 0 0 0",
          }}
        >
          {(resume?.address || resume?.province || resume?.city) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
              }}
            >
              <FiMapPin style={{ color: "#111" }} />
              {resume.address}
              {resume.province && `, ${resume.province}`}
              {resume.city && `, ${resume.city}`}
            </div>
          )}
          {resume?.personalLink && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 15,
              }}
            >
              <FiGlobe style={{ color: "#111" }} />
              <a
                href={resume.personalLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#111" }}
              >
                {resume.personalLink}
              </a>
            </div>
          )}
        </div>
      </div>
      {/* Section: About Me */}
      <Section title="ABOUT ME" accentColor={accentColor}>
        {Array.isArray(resume?.aboutme) && resume.aboutme.length > 0 ? (
          <div
            dangerouslySetInnerHTML={{
              __html: resume.aboutme[0]?.aboutMeDescription || "",
            }}
          />
        ) : Array.isArray(resume?.aboutMes) && resume.aboutMes.length > 0 ? (
          <div
            dangerouslySetInnerHTML={{
              __html: resume.aboutMes[0]?.aboutMeDescription || "",
            }}
          />
        ) : (
          <div>{resume?.about || "No personal description yet."}</div>
        )}
      </Section>
      {/* Section: Work Experience */}
      <Section title="WORK EXPERIENCE" accentColor={accentColor}>
        {Array.isArray(resume?.workExperiences) &&
        resume.workExperiences.length > 0 ? (
          resume.workExperiences.map((exp) => (
            <div key={exp.workExperienceId} style={{ marginBottom: 16 }}>
              <b>{exp.jobTitle}</b>
              {exp.companyName && (
                <>
                  {" "}
                  at <b>{exp.companyName}</b>
                </>
              )}
              <span style={{ float: "right" }}>
                {formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking)}
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: exp.workDescription || "" }}
              />
              <div
                dangerouslySetInnerHTML={{ __html: exp.responsibilities || "" }}
              />
              <div
                dangerouslySetInnerHTML={{ __html: exp.achievements || "" }}
              />
              <div
                dangerouslySetInnerHTML={{ __html: exp.technologies || "" }}
              />
              <div
                dangerouslySetInnerHTML={{ __html: exp.projectName || "" }}
              />
            </div>
          ))
        ) : (
          <div>No work experience.</div>
        )}
      </Section>
      {/* Section: Education */}
      <Section title="EDUCATION" accentColor={accentColor}>
        {Array.isArray(resume?.educations) && resume.educations.length > 0 ? (
          resume.educations.map((edu) => (
            <div key={edu.educationId} style={{ marginBottom: 16 }}>
              <b>{edu.school}</b>
              {edu.degree && <> - {edu.degree}</>}
              {edu.major && <> ({edu.major})</>}
              <span style={{ float: "right" }}>
                {formatDateRange(edu.monthStart, edu.monthEnd, edu.isStudying)}
              </span>
              <div>{edu.detail}</div>
            </div>
          ))
        ) : (
          <div>No education information available.</div>
        )}
      </Section>
      {/* Section: Skills */}
      <Section title="SKILL" accentColor={accentColor}>
        <div>
          <b>Core Skills:</b>{" "}
          {coreSkills.length > 0
            ? coreSkills
                .map(
                  (s) =>
                    `${s.skillName}${s.experience ? ` (${s.experience})` : ""}`
                )
                .join(", ")
            : ""}
          {softSkills.length > 0 && (
            <>
              <br />
              <b>Soft Skills:</b>
              <ul style={{ margin: 0 }}>
                {softSkills.map((s, idx) => (
                  <li key={idx}>{s.skillName}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Section>
      {/* Section: Foreign Language */}
      <Section title="FOREIGN LANGUAGE" accentColor={accentColor}>
        {Array.isArray(resume?.foreginLanguages) &&
        resume.foreginLanguages.length > 0 ? (
          resume.foreginLanguages.map((lang) => (
            <div key={lang.foreignLanguageId}>
              <b>{lang.languageName}</b> ({lang.languageLevel})
            </div>
          ))
        ) : (
          <div>No foreign language yet.</div>
        )}
      </Section>
      {/* Section: Highlight Project */}
      <Section title="HIGHLIGHT PROJECT" accentColor={accentColor}>
        {Array.isArray(resume?.highlightProjects) &&
        resume.highlightProjects.length > 0 ? (
          resume.highlightProjects.map((proj) => (
            <div key={proj.highlightProjectId} style={{ marginBottom: 16 }}>
              <b>{proj.projectName}</b>
              <span style={{ float: "right" }}>
                {formatDateRange(
                  proj.monthStart,
                  proj.monthEnd,
                  proj.isWorking
                )}
              </span>
              <div
                dangerouslySetInnerHTML={{
                  __html: proj.projectDescription || "",
                }}
              />
               <div
                dangerouslySetInnerHTML={{
                  __html: proj.technologies || "",
                }}
              />
               <div
                dangerouslySetInnerHTML={{
                  __html: proj.responsibilities || "",
                }}
              />
               <div
                dangerouslySetInnerHTML={{
                  __html: proj.teamSize || "",
                }}
              />
               <div
                dangerouslySetInnerHTML={{
                  __html: proj.achievements || "",
                }}
              />

              {proj.projectLink && (
                <div>
                  <a
                    href={proj.projectLink}
                    target="_blank"
                    style={{ color: "#111", textDecoration: "underline" }}
                    rel="noopener noreferrer"
                  >
                    {proj.projectLink}
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No featured projects yet.</div>
        )}
      </Section>
      {/* Section: Certificate */}
      <Section title="CERTIFICATE" accentColor={accentColor}>
        {Array.isArray(resume?.certificates) &&
        resume.certificates.length > 0 ? (
          resume.certificates.map((cert) => (
            <div key={cert.certificateId} style={{ marginBottom: 16 }}>
              <b>{cert.certificateName}</b>
              {cert.organization && <> - {cert.organization}</>}
              <span
                style={{
                  float: "right",
                  color: accentColor || "#007bff",
                  fontWeight: 500,
                }}
              >
                {formatMonthYear(cert.month)}
              </span>
              {cert.certificateUrl && (
                <div>
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    style={{ color: "#111", textDecoration: "underline" }}
                    rel="noopener noreferrer"
                  >
                    {cert.certificateUrl}
                  </a>
                </div>
              )}
              {cert.certificateDescription && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: cert.certificateDescription,
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div>No certificate yet.</div>
        )}
      </Section>
      {/* Section: Award */}
      <Section title="AWARD" accentColor={accentColor}>
        {Array.isArray(resume?.awards) && resume.awards.length > 0 ? (
          resume.awards.map((award) => (
            <div key={award.awardId} style={{ marginBottom: 16 }}>
              <b>{award.awardName}</b>
              {award.awardOrganization && <> - {award.awardOrganization}</>}
              <span
                style={{
                  float: "right",
                  color: accentColor || "#007bff",
                  fontWeight: 500,
                }}
              >
                {formatMonthYear(award.month)}
              </span>
              {award.awardDescription && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: award.awardDescription,
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div>No awards yet.</div>
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
  );
}

function Section({ title, children, accentColor }) {
  return (
    <div style={{ margin: "24px 0" }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 20,
          borderBottom: `2px solid ${accentColor}`,
          marginBottom: 8,
          color: accentColor,
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
