import { jsPDF } from "jspdf";
import { ArimoRegularNormal } from "@/utils/fonts/Arimo-Regular-normal";
import { ArimoBoldNormal } from "@/utils/fonts/Arimo-Bold-normal";

// Helper: Load SVG as base64 PNG (for demo, bạn nên pre-convert ở production)
async function svgUrlToBase64Png(svgUrl, size = 24) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = svgUrl;
  });
}

export default async function generateCubicPDF(resume, accentColor, removeLogo = false) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Load icons as base64 PNG
  const [phoneIcon, mailIcon, giftIcon, mapIcon, globeIcon] = await Promise.all(
    [
      svgUrlToBase64Png("/icons/phone2.svg", 24),
      svgUrlToBase64Png("/icons/mail2.svg", 24),
      svgUrlToBase64Png("/icons/gift2.svg", 24),
      svgUrlToBase64Png("/icons/map2.svg", 24),
      svgUrlToBase64Png("/icons/globe2.svg", 24),
    ]
  );

  // Font setup
  if (ArimoRegularNormal) {
    pdf.addFileToVFS("Arimo-Regular-normal.ttf", ArimoRegularNormal);
    pdf.addFont("Arimo-Regular-normal.ttf", "Arimo", "normal");
  }
  if (ArimoBoldNormal) {
    pdf.addFileToVFS("Arimo-Bold-normal.ttf", ArimoBoldNormal);
    pdf.addFont("Arimo-Bold-normal.ttf", "Arimo", "bold");
  }

  // Font sizes
  const FONT_XL = 22;
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
    html
      ? String(html)
          .replace(/<p[^>]*>/gi, "")
          .replace(/<\/p>/gi, "\n")
          .replace(/<br\s*\/?/gi, "\n")
          .replace(/<li[^>]*>/gi, "- ")
          .replace(/<\/li>/gi, "\n")
          .replace(/<ul[^>]*>|<ol[^>]*>|<\/ul>|<\/ol>/gi, "")
          .replace(/<[^>]+>/g, "")
          .replace(/\n{2,}/g, "\n")
          .trim()
      : "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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

  // Background
  pdf.setFillColor("#f5f5f5");
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative corner triangles
  pdf.setFillColor(accentColor || "#c4185c");
  // Top left triangle
  pdf.triangle(0, 0, 15, 0, 0, 15, "F");
  // Top right triangle
  pdf.triangle(pageWidth, 0, pageWidth - 15, 0, pageWidth, 15, "F");

  // Header background
  pdf.setFillColor("#ffffff");
  pdf.rect(0, 20, pageWidth, 80, "F");

  // Avatar
  let avatarImg = resume?.image || resume?.avatar || "/default-avatar.png";
  if (
    avatarImg &&
    (avatarImg.startsWith("data:image") || avatarImg.startsWith("http"))
  ) {
    try {
      pdf.addImage(avatarImg, "JPEG", 20, 25, 20, 20, undefined, "FAST");
    } catch (e) {
      // Fallback: draw a placeholder rectangle
      pdf.setFillColor("#eeeeee");
      pdf.rect(20, 25, 20, 20, "F");
    }
  } else {
    pdf.setFillColor("#eeeeee");
    pdf.rect(20, 25, 20, 20, "F");
  }

  // Name
  setFont("bold", FONT_XL, accentColor || "#c4185c");
  pdf.text(resume?.fullName || "", 20, 55);

  // Job title
  setFont("normal", FONT_LG, "#666666");
  pdf.text(resume?.jobTitle || "", 20, 62);

  // Contact info in two columns
  let contactY = 70;
  setFont("normal", FONT_SM, "#444444");
  let iconSize = 4.5; // mm
  let iconTextGap = 2; // mm

  // Left column
  let leftX = 20;
  let leftY = contactY;
  if (resume?.phone) {
    if (phoneIcon)
      pdf.addImage(phoneIcon, "PNG", leftX, leftY - 3, iconSize, iconSize);
    pdf.text(resume.phone, leftX + iconSize + iconTextGap, leftY);
    leftY += 7;
  }
  if (resume?.email) {
    if (mailIcon)
      pdf.addImage(mailIcon, "PNG", leftX, leftY - 3, iconSize, iconSize);
    pdf.text(resume.email, leftX + iconSize + iconTextGap, leftY);
    leftY += 7;
  }
  if (resume?.address || resume?.province || resume?.city) {
    const location = [resume.address, resume.province, resume.city]
      .filter(Boolean)
      .join(", ");
    if (mapIcon)
      pdf.addImage(mapIcon, "PNG", leftX, leftY - 3, iconSize, iconSize);
    pdf.text(location, leftX + iconSize + iconTextGap, leftY);
  }

  // Right column
  let rightX = 110;
  let rightY = contactY;
  if (resume?.dob) {
    if (giftIcon)
      pdf.addImage(giftIcon, "PNG", rightX, rightY - 3, iconSize, iconSize);
    pdf.text(formatDate(resume.dob), rightX + iconSize + iconTextGap, rightY);
    rightY += 7;
  }
  if (resume?.personalLink) {
    if (globeIcon)
      pdf.addImage(globeIcon, "PNG", rightX, rightY - 3, iconSize, iconSize);
    pdf.text(resume.personalLink, rightX + iconSize + iconTextGap, rightY);
  }

  // About me
  if (
    resume?.aboutme?.[0]?.aboutMeDescription ||
    resume?.aboutMes?.[0]?.aboutMeDescription ||
    resume?.about
  ) {
    contactY = 93;
    setFont("normal", FONT_SM, "#333333");
    const about = stripHtml(
      resume?.aboutme?.[0]?.aboutMeDescription ||
        resume?.aboutMes?.[0]?.aboutMeDescription ||
        resume?.about
    );
    const aboutLines = pdf.splitTextToSize(
      String(about).replace(/\r?\n+/g, " ").replace(/\s{2,}/g, " ").trim(),
      pageWidth - 40
    );
    aboutLines.forEach((line) => {
      pdf.text(line, 20, contactY);
      contactY += 4;
    });
  }

  // Ensure main cursor starts after About section to avoid overlap
  y = Math.max(110, contactY ? contactY + 6 : 110);

  // Section helper with diamond icon
  const section = (title) => {
    if (y > 250) {
      pdf.addPage();
      pdf.setFillColor("#f5f5f5");
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      y = 20;
    }

    // Diamond icon
    pdf.setFillColor(accentColor || "#c4185c");
    pdf.triangle(20, y - 1, 22, y + 1, 20, y + 3, "F");
    pdf.triangle(20, y + 1, 22, y - 1, 24, y + 1, "F");

    // Title
    setFont("bold", FONT_LG, accentColor || "#c4185c");
    pdf.text(title, 28, y + 2);

    // Line
    pdf.setDrawColor("#dddddd");
    pdf.setLineWidth(0.5);
    pdf.line(28 + pdf.getTextWidth(title) + 5, y + 1, pageWidth - 20, y + 1);

    y += 12;
  };

  const splitText = (text, maxWidth = pageWidth - 60) =>
    pdf.splitTextToSize(
      String(text).replace(/\r?\n+/g, " ").replace(/\s{2,}/g, " ").trim(),
      maxWidth
    );

  // Education
  section("EDUCATION");
  if (Array.isArray(resume?.educations) && resume.educations.length > 0) {
    resume.educations.forEach((edu) => {
      // Date
      setFont("normal", FONT_XS, "#666666");
      pdf.text(
        formatDateRange(edu.monthStart, edu.monthEnd, edu.isStudying),
        20,
        y
      );

      // School
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(edu.school || ""), 45, y);

      // Detail
      if (edu.detail) {
        setFont("normal", FONT_SM, "#666666");
        pdf.text(stripHtml(edu.detail), 45, y + 4);
      }
      y += 12;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có thông tin học vấn.", 20, y);
    y += 8;
  }

  // Work Experience
  section("WORK EXPERIENCE");
  if (
    Array.isArray(resume?.workExperiences) &&
    resume.workExperiences.length > 0
  ) {
    resume.workExperiences.forEach((exp) => {
      // Date
      setFont("normal", FONT_XS, "#666666");
      pdf.text(
        formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking),
        20,
        y
      );

      // Job title
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(exp.jobTitle || ""), 45, y);

      // Company
      if (exp.companyName) {
        setFont("normal", FONT_SM, "#666666");
        pdf.text(stripHtml(exp.companyName), 45, y + 4);
        y += 4;
      }

      // Description
      if (exp.workDescription) {
        setFont("normal", FONT_XS, "#444444");
        const descLines = splitText(stripHtml(exp.workDescription));
        descLines.forEach((line) => {
          pdf.text(line, 45, y + 4);
          y += 3;
        });
      }
      if (exp.responsibilities) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(exp.responsibilities));
        lines.forEach((line) => {
          pdf.text(line, 45, y + 4);
          y += 3;
        });
      }
      if (exp.achievements) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(exp.achievements));
        lines.forEach((line) => {
          pdf.text(line, 45, y + 4);
          y += 3;
        });
      }
      if (exp.technologies) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(exp.technologies));
        lines.forEach((line) => {
          pdf.text(line, 45, y + 4);
          y += 3;
        });
      }
      if (exp.projectName) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(exp.projectName));
        lines.forEach((line) => {
          pdf.text(line, 45, y + 4);
          y += 3;
        });
      }
      if (exp.projectLink) {
        setFont("normal", FONT_XS, accentColor || "#c4185c");
        pdf.textWithLink(stripHtml(exp.projectLink), 45, y + 4, {
          url: exp.projectLink,
        });
        y += 4;
      }
      y += 12;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có kinh nghiệm làm việc.", 20, y);
    y += 8;
  }

  // Skills
  section("SKILL");
  const coreSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Core Skills")
    : [];
  const softSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter((s) => s.groupName === "Soft Skills")
    : [];

  if (coreSkills.length > 0) {
    setFont("bold", FONT_SM, "#333333");
    pdf.text("Core Skills", 20, y);
    y += 6;

    let badgeX = 20;
    coreSkills.forEach((s) => {
      const label = `${stripHtml(s.skillName)}${
        s.experience ? ` (${s.experience})` : ""
      }`;
      const badgeWidth = pdf.getTextWidth(label) + 6;

      // Badge background
      pdf.setFillColor("#e9ecef");
      pdf.setDrawColor("#dee2e6");
      pdf.rect(badgeX, y - 3, badgeWidth, 6, "FD");

      setFont("normal", FONT_XS, "#333333");
      pdf.text(label, badgeX + 3, y + 1);

      badgeX += badgeWidth + 4;
      if (badgeX > pageWidth - 40) {
        badgeX = 20;
        y += 8;
      }
    });
    y += 10;
  }

  if (softSkills.length > 0) {
    setFont("bold", FONT_SM, "#333333");
    pdf.text("Soft Skills", 20, y);
    y += 6;

    setFont("normal", FONT_XS, "#444444");
    softSkills.forEach((s) => {
      pdf.text(`• ${stripHtml(s.skillName)}`, 25, y);
      y += 5;
    });
    y += 5;
  }

  // Foreign Language
  section("FOREIGN LANGUAGE");
  if (
    Array.isArray(resume?.foreginLanguages) &&
    resume.foreginLanguages.length > 0
  ) {
    resume.foreginLanguages.forEach((lang) => {
      setFont("bold", FONT_SM, "#333333");
      pdf.text(`${stripHtml(lang.languageName)} `, 20, y);
      setFont("normal", FONT_SM, "#666666");
      pdf.text(
        `(${stripHtml(lang.languageLevel)})`,
        20 + pdf.getTextWidth(`${stripHtml(lang.languageName)} `),
        y
      );
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có ngoại ngữ.", 20, y);
    y += 8;
  }

  // Highlight Project
  section("HIGHLIGHT PROJECT");
  if (
    Array.isArray(resume?.highlightProjects) &&
    resume.highlightProjects.length > 0
  ) {
    resume.highlightProjects.forEach((proj) => {
      // Date
      setFont("normal", FONT_XS, "#666666");
      pdf.text(
        formatDateRange(proj.monthStart, proj.monthEnd, proj.isWorking),
        20,
        y
      );

      // Project name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(proj.projectName || ""), 45, y);
      y += 6;

      // Description
      if (proj.projectDescription) {
        setFont("normal", FONT_XS, "#444444");
        const descLines = splitText(stripHtml(proj.projectDescription));
        descLines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
        y += 2;
      }
      if (proj.technologies) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(proj.technologies));
        lines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
        y += 2;
      }
      if (proj.responsibilities) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(proj.responsibilities));
        lines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
        y += 2;
      }
      if (proj.teamSize) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(proj.teamSize));
        lines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
        y += 2;
      }
      if (proj.achievements) {
        setFont("normal", FONT_XS, "#444444");
        const lines = splitText(stripHtml(proj.achievements));
        lines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
        y += 2;
      }
      if (proj.projectLink) {
        setFont("normal", FONT_XS, accentColor || "#c4185c");
        pdf.textWithLink(stripHtml(proj.projectLink), 45, y, {
          url: proj.projectLink,
        });
        y += 4;
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có dự án nổi bật.", 20, y);
    y += 8;
  }

  // Certificate
  section("CERTIFICATE");
  if (Array.isArray(resume?.certificates) && resume.certificates.length > 0) {
    resume.certificates.forEach((cert) => {
      // Date
      setFont("normal", FONT_XS, "#666666");
      pdf.text(formatDate(cert.month), 20, y);

      // Certificate name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(cert.certificateName || ""), 45, y);

      // Organization
      if (cert.organization) {
        setFont("normal", FONT_SM, "#666666");
        pdf.text(stripHtml(cert.organization), 45, y + 4);
        y += 4;
      }
      y += 6;

      // Certificate URL
      if (cert.certificateUrl) {
        setFont("bold", FONT_XS, "#333333");
        pdf.text("Certificate URL: ", 45, y);
        setFont("normal", FONT_XS, accentColor || "#c4185c");
        pdf.text(
          stripHtml(cert.certificateUrl),
          45 + pdf.getTextWidth("Certificate URL: "),
          y
        );
        y += 4;
      }

      // Description
      if (cert.certificateDescription) {
        setFont("normal", FONT_XS, "#444444");
        const descLines = splitText(stripHtml(cert.certificateDescription));
        descLines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có chứng chỉ.", 20, y);
    y += 8;
  }

  // Award
  section("AWARD");
  if (Array.isArray(resume?.awards) && resume.awards.length > 0) {
    resume.awards.forEach((award) => {
      // Date
      setFont("normal", FONT_XS, "#666666");
      pdf.text(formatDate(award.month), 20, y);

      // Award name
      setFont("bold", FONT_MD, "#333333");
      pdf.text(stripHtml(award.awardName || ""), 45, y);

      // Organization
      if (award.awardOrganization) {
        setFont("normal", FONT_SM, "#666666");
        pdf.text(stripHtml(award.awardOrganization), 45, y + 4);
        y += 4;
      }
      y += 6;

      // Description
      if (award.awardDescription) {
        setFont("normal", FONT_XS, "#444444");
        const descLines = splitText(stripHtml(award.awardDescription));
        descLines.forEach((line) => {
          pdf.text(line, 45, y);
          y += 3;
        });
      }
      y += 8;
    });
  } else {
    setFont("normal", FONT_SM, "#333333");
    pdf.text("Chưa có giải thưởng.", 20, y);
    y += 8;
  }

  // Thêm logo JobFinder ở góc phải dưới PDF nếu không removeLogo
  if (!removeLogo) {
    const logoUrl = "/images/jobfinder-logo.png";
    const logoImg = await svgUrlToBase64Png(logoUrl, 120); // 120px ~ 12mm
    const logoWidth = 24; // mm
    const logoHeight = 12; // mm
    const logoX = pageWidth - logoWidth - 10;
    let logoY = pdf.internal.pageSize.getHeight() - logoHeight - 10;
    if (y > logoY) {
      pdf.addPage();
      logoY = pdf.internal.pageSize.getHeight() - logoHeight - 10;
    }
    pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);
  }
  return pdf;
}
