import { jsPDF } from "jspdf";
import { ArimoRegularNormal } from "@/utils/fonts/Arimo-Regular-normal";
import { ArimoBoldNormal } from "@/utils/fonts/Arimo-Bold-normal";

export default function generateElegantPDF(resume, accentColor) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Font setup
  if (ArimoRegularNormal) {
    pdf.addFileToVFS("Arimo-Regular-normal.ttf", ArimoRegularNormal);
    pdf.addFont("Arimo-Regular-normal.ttf", "Arimo", "normal");
  }
  if (ArimoBoldNormal) {
    pdf.addFileToVFS("Arimo-Bold-normal.ttf", ArimoBoldNormal);
    pdf.addFont("Arimo-Bold-normal.ttf", "Arimo", "bold");
  }

  // Font sizes - adjusted to match the design
  const FONT_XL = 20;
  const FONT_LG = 14;
  const FONT_MD = 11;
  const FONT_SM = 9;
  const FONT_XS = 8;

  const setFont = (weight = "normal", size = FONT_MD, color = "#222") => {
    pdf.setFont("Arimo", weight);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
  };

  const stripHtml = (html) =>
    html ? String(html).replace(/<[^>]+>/g, "") : "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatDateRange = (start, end, isWorking) => {
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
    } else if (isWorking) endStr = "Present";
    return `${startStr} - ${endStr}`;
  };

  let y = 20;

  // --- HEADER --- (Dark background like the design)
  const HEADER_HEIGHT = 50;
  pdf.setFillColor("#555555"); // Dark gray background
  pdf.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  // Avatar positioned on the left
  let avatarImg = resume?.image || resume?.avatar || "/default-avatar.png";
  if (
    avatarImg &&
    (avatarImg.startsWith("data:image") || avatarImg.startsWith("http"))
  ) {
    try {
      // White border around avatar
      pdf.setFillColor("#ffffff");
      pdf.rect(15, 15, 25, 25, "F");
      pdf.addImage(avatarImg, "JPEG", 17, 17, 21, 21, undefined, "FAST");
    } catch (e) {
      // Fallback: draw a placeholder rectangle
      pdf.setFillColor("#ffffff");
      pdf.rect(15, 15, 25, 25, "F");
    }
  } else {
    // Draw placeholder avatar
    pdf.setFillColor("#ffffff");
    pdf.rect(15, 15, 25, 25, "F");
  }

  // Name and job title
  setFont("bold", FONT_XL, "#ffffff");
  pdf.text(resume?.fullName || "", 50, 25);

  setFont("normal", FONT_LG, "#cccccc");
  pdf.text(resume?.jobTitle || "", 50, 32);

  // Contact info in two columns layout
  setFont("normal", FONT_SM, "#ffffff");
  let contactY = 40;

  // Left column
  let leftColumnX = 50;
  if (resume?.phone) {
    pdf.text(`📞 ${resume.phone}`, leftColumnX, contactY);
    contactY += 4;
  }
  if (resume?.email) {
    pdf.text(`✉ ${resume.email}`, leftColumnX, contactY);
    contactY += 4;
  }
  if (resume?.personalLink) {
    pdf.text(`🌐 ${resume.personalLink}`, leftColumnX, contactY);
  }

  // Right column
  contactY = 40;
  let rightColumnX = 130;
  if (resume?.dob) {
    pdf.text(`📅 ${formatDate(resume.dob)}`, rightColumnX, contactY);
    contactY += 4;
  }
  if (resume?.address || resume?.province || resume?.city) {
    const location = [resume.address, resume.province, resume.city]
      .filter(Boolean)
      .join(", ");
    pdf.text(`📍 ${location}`, rightColumnX, contactY);
  }

  y = HEADER_HEIGHT + 15;

  // --- Section helper with border styling ---
  const section = (title) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }

    setFont("bold", FONT_LG, "#222222");
    pdf.text(title, 20, y);

    // Add border line below title
    pdf.setDrawColor("#e5e5e5");
    pdf.setLineWidth(0.5);
    pdf.line(20, y + 2, pageWidth - 20, y + 2);
    y += 12;
  };

  const splitText = (text, maxWidth = pageWidth - 40) =>
    pdf.splitTextToSize(text, maxWidth);

  // --- About me ---
  section("About me");
  setFont("normal", FONT_SM, "#333333");
  let about = stripHtml(
    resume?.aboutme?.[0]?.aboutMeDescription ||
      resume?.aboutMes?.[0]?.aboutMeDescription ||
      resume?.about ||
      "No description."
  );
  const aboutLines = splitText(about);
  aboutLines.forEach((line) => {
    pdf.text(line, 20, y);
    y += 4;
  });
  y += 8;

  // --- Education ---
  section("Education");
  if (Array.isArray(resume?.educations) && resume.educations.length > 0) {
    resume.educations.forEach((edu) => {
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(edu.school || ""), 20, y);

      setFont("normal", FONT_XS, accentColor || "#007bff");
      const dateRange = formatDateRange(
        edu.monthStart,
        edu.monthEnd,
        edu.isStudying
      );
      pdf.text(dateRange, 20, y + 5);

      if (edu.detail) {
        setFont("normal", FONT_XS, "#666666");
        pdf.text(stripHtml(edu.detail), 60, y + 5);
      }
      y += 12;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có thông tin học vấn.", 20, y);
    y += 8;
  }

  // --- Skill ---
  section("Skill");
  const coreSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Core Skills")
    : [];
  const softSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Soft Skills")
    : [];

  // Core Skills as blue badges
  if (coreSkills.length > 0) {
    setFont("bold", FONT_XS, "#222222");
    pdf.text("Core Skills", 20, y);
    y += 6;

    let badgeX = 20;
    coreSkills.forEach((s) => {
      const label = `${stripHtml(s.skillName)}${
        s.experience ? ` (${s.experience})` : ""
      }`;
      const badgeWidth = pdf.getTextWidth(label) + 6;

      // Blue badge background
      pdf.setFillColor(accentColor || "#007bff");
      pdf.rect(badgeX, y - 3, badgeWidth, 6, "F");

      setFont("normal", FONT_XS, "#ffffff");
      pdf.text(label, badgeX + 3, y + 1);

      badgeX += badgeWidth + 4;
      if (badgeX > pageWidth - 40) {
        badgeX = 20;
        y += 8;
      }
    });
    y += 10;
  }

  // Soft Skills as bullet list
  if (softSkills.length > 0) {
    setFont("bold", FONT_XS, "#222222");
    pdf.text("Soft Skills", 20, y);
    y += 6;

    setFont("normal", FONT_XS, "#333333");
    softSkills.forEach((s) => {
      pdf.text(`• ${stripHtml(s.skillName)}`, 25, y);
      y += 5;
    });
    y += 5;
  }

  // --- Work Experience ---
  section("Work Experience");
  if (
    Array.isArray(resume?.workExperiences) &&
    resume.workExperiences.length > 0
  ) {
    resume.workExperiences.forEach((exp) => {
      // Date in blue
      setFont("normal", FONT_XS, accentColor || "#007bff");
      pdf.text(
        formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking),
        20,
        y
      );
      y += 5;

      // Job title and company
      setFont("bold", FONT_MD, "#333333");
      let jobTitle = stripHtml(exp.jobTitle || "");
      if (exp.companyName) {
        jobTitle += ` | `;
        pdf.text(jobTitle, 20, y);

        setFont("normal", FONT_MD, "#666666");
        pdf.text(
          stripHtml(exp.companyName),
          20 + pdf.getTextWidth(jobTitle),
          y
        );
      } else {
        pdf.text(jobTitle, 20, y);
      }
      y += 6;

      // Work description
      if (exp.workDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(exp.workDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }

      // Projects
      if (exp.proJects) {
        setFont("bold", FONT_XS, "#333333");
        pdf.text("PROJECT: ", 20, y);

        setFont("normal", FONT_XS, accentColor || "#007bff");
        const projText = stripHtml(exp.proJects);
        pdf.text(projText, 20 + pdf.getTextWidth("PROJECT: "), y);
        y += 6;
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có kinh nghiệm làm việc.", 20, y);
    y += 8;
  }

  // --- Foreign Language ---
  section("Foreign Language");
  if (
    Array.isArray(resume?.foreginLanguages) &&
    resume.foreginLanguages.length > 0
  ) {
    resume.foreginLanguages.forEach((lang) => {
      setFont("bold", FONT_XS, "#333333");
      pdf.text(`${stripHtml(lang.languageName)} : `, 20, y);

      setFont("normal", FONT_XS, "#666666");
      pdf.text(
        stripHtml(lang.languageLevel),
        20 + pdf.getTextWidth(`${stripHtml(lang.languageName)} : `),
        y
      );
      y += 6;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có ngoại ngữ.", 20, y);
    y += 8;
  }

  // --- Highlight Project ---
  section("Highlight Project");
  if (
    Array.isArray(resume?.highlightProjects) &&
    resume.highlightProjects.length > 0
  ) {
    resume.highlightProjects.forEach((proj) => {
      // Date in blue
      setFont("normal", FONT_XS, accentColor || "#007bff");
      pdf.text(
        formatDateRange(proj.monthStart, proj.monthEnd, proj.isWorking),
        20,
        y
      );
      y += 5;

      // Project name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(proj.projectName || ""), 20, y);
      y += 6;

      // Description
      if (proj.projectDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(proj.projectDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
      }

      // Project link
      if (proj.projectLink) {
        setFont("normal", FONT_XS, accentColor || "#007bff");
        pdf.text(stripHtml(proj.projectLink), 20, y);
        y += 4;
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có dự án nổi bật.", 20, y);
    y += 8;
  }

  // --- Certificate ---
  section("Certificate");
  if (Array.isArray(resume?.certificates) && resume.certificates.length > 0) {
    resume.certificates.forEach((cert) => {
      // Certificate name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(cert.certificateName || ""), 20, y);
      y += 5;

      // Date and organization
      setFont("normal", FONT_XS, accentColor || "#007bff");
      let certInfo = formatDate(cert.month);
      if (cert.organization) {
        certInfo += ` | `;
        pdf.text(certInfo, 20, y);

        setFont("normal", FONT_XS, "#666666");
        pdf.text(
          stripHtml(cert.organization),
          20 + pdf.getTextWidth(certInfo),
          y
        );
      } else {
        pdf.text(certInfo, 20, y);
      }
      y += 5;

      // Certificate URL
      if (cert.certificateUrl) {
        setFont("bold", FONT_XS, "#333333");
        pdf.text("Certificate URL: ", 20, y);

        setFont("normal", FONT_XS, accentColor || "#007bff");
        pdf.text(
          stripHtml(cert.certificateUrl),
          20 + pdf.getTextWidth("Certificate URL: "),
          y
        );
        y += 4;
      }

      // Description
      if (cert.certificateDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(cert.certificateDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có chứng chỉ.", 20, y);
    y += 8;
  }

  // --- Award ---
  section("Award");
  if (Array.isArray(resume?.awards) && resume.awards.length > 0) {
    resume.awards.forEach((award) => {
      // Award name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(award.awardName || ""), 20, y);
      y += 5;

      // Date and organization
      setFont("normal", FONT_XS, accentColor || "#007bff");
      let awardInfo = formatDate(award.month);
      if (award.awardOrganization) {
        awardInfo += ` | `;
        pdf.text(awardInfo, 20, y);

        setFont("normal", FONT_XS, "#666666");
        pdf.text(
          stripHtml(award.awardOrganization),
          20 + pdf.getTextWidth(awardInfo),
          y
        );
      } else {
        pdf.text(awardInfo, 20, y);
      }
      y += 5;

      // Description
      if (award.awardDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(award.awardDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có giải thưởng.", 20, y);
    y += 8;
  }

  pdf.save(`${resume?.fullName || "resume"}-elegant.pdf`);
}
