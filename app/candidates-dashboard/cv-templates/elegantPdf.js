import { jsPDF } from "jspdf";
import { ArimoRegularNormal } from "@/utils/fonts/Arimo-Regular-normal";
import { ArimoBoldNormal } from "@/utils/fonts/Arimo-Bold-normal";

// Helper: Load SVG as base64 PNG (for demo, you may want to pre-convert in production)
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

export default async function generateElegantPDF(resume, accentColor, removeLogo = false) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Load icons as base64 PNG
  const [phoneIcon, mailIcon, giftIcon, mapIcon, globeIcon] = await Promise.all(
    [
      svgUrlToBase64Png("/icons/phone.svg", 24),
      svgUrlToBase64Png("/icons/mail.svg", 24),
      svgUrlToBase64Png("/icons/gift.svg", 24), // Nếu không có calendar.svg, sẽ là undefined
      svgUrlToBase64Png("/icons/map.svg", 24),
      svgUrlToBase64Png("/icons/globe.svg", 24),
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

  // --- HEADER --- (Dark background like the design)
  const HEADER_HEIGHT = 70;
  pdf.setFillColor(accentColor || "#555555"); // Use accentColor for header background
  pdf.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  // Avatar positioned on the left, căn giữa theo header
  let avatarImg = resume?.image || resume?.avatar || "/default-avatar.png";
  if (
    avatarImg &&
    (avatarImg.startsWith("data:image") || avatarImg.startsWith("http"))
  ) {
    try {
      pdf.addImage(avatarImg, "JPEG", 17, 17, 24, 24, undefined, "FAST");
    } catch (e) {
      // Fallback: do nothing if image fails
    }
  }

  // Name and job title
  setFont("bold", FONT_XL, "#ffffff");
  pdf.text(resume?.fullName || "", 50, 28);

  setFont("normal", FONT_LG, "#cccccc");
  pdf.text(resume?.jobTitle || "", 50, 35);

  // Contact info in two columns layout
  setFont("normal", FONT_SM, "#ffffff");
  let contactY = 44; // thấp hơn cho cân header
  let iconSize = 4.5; // mm
  let iconTextGap = 2; // mm

  // Left column
  let leftColumnX = 50;
  if (resume?.phone) {
    if (phoneIcon) {
      let iconY = contactY - 1.2;
      pdf.addImage(phoneIcon, "PNG", leftColumnX, iconY, iconSize, iconSize);
    }
    pdf.text(resume.phone, leftColumnX + iconSize + iconTextGap, contactY + 2);
    contactY += 7;
  }
  if (resume?.email) {
    if (mailIcon) {
      let iconY = contactY - 1.2;
      pdf.addImage(mailIcon, "PNG", leftColumnX, iconY, iconSize, iconSize);
    }
    pdf.text(resume.email, leftColumnX + iconSize + iconTextGap, contactY + 2);
    contactY += 7;
  }
  if (resume?.personalLink) {
    if (globeIcon) {
      let iconY = contactY - 1.2;
      pdf.addImage(globeIcon, "PNG", leftColumnX, iconY, iconSize, iconSize);
    }
    pdf.text(
      resume.personalLink,
      leftColumnX + iconSize + iconTextGap,
      contactY + 2
    );
  }

  // Right column
  contactY = 44;
  let rightColumnX = 130;
  if (resume?.dob) {
    if (giftIcon) {
      let iconY = contactY - 1.2;
      pdf.addImage(giftIcon, "PNG", rightColumnX, iconY, iconSize, iconSize);
    }
    pdf.text(
      formatDate(resume.dob),
      rightColumnX + iconSize + iconTextGap,
      contactY + 2
    );
    contactY += 7;
  }
  if (resume?.address || resume?.province || resume?.city) {
    const location = [resume.address, resume.province, resume.city]
      .filter(Boolean)
      .join(", ");
    if (mapIcon) {
      let iconY = contactY - 1.2;
      pdf.addImage(mapIcon, "PNG", rightColumnX, iconY, iconSize, iconSize);
    }
    pdf.text(location, rightColumnX + iconSize + iconTextGap, contactY + 2);
  }

  y = HEADER_HEIGHT + 15;

  // --- Section helper with border styling ---
  const section = (title) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }

    setFont("bold", FONT_LG, accentColor || "#222222");
    pdf.text(title, 20, y);

    // Add border line below title
    pdf.setDrawColor(accentColor || "#e5e5e5");
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

      if (exp.workDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(exp.workDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (exp.responsibilities) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(exp.responsibilities));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (exp.achievements) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(exp.achievements));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (exp.technologies) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(exp.technologies));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (exp.projectName) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(exp.projectName));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (exp.projectLink) {
        setFont("normal", FONT_XS, accentColor || "#007bff");
        pdf.textWithLink(stripHtml(exp.projectLink), 20, y, {
          url: exp.projectLink,
        });
        y += 4;
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

      if (proj.projectDescription) {
        setFont("normal", FONT_XS, "#333333");
        const descLines = splitText(stripHtml(proj.projectDescription));
        descLines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (proj.technologies) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(proj.technologies));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (proj.responsibilities) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(proj.responsibilities));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (proj.teamSize) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(proj.teamSize));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (proj.achievements) {
        setFont("normal", FONT_XS, "#333333");
        const lines = splitText(stripHtml(proj.achievements));
        lines.forEach((line) => {
          pdf.text(line, 20, y);
          y += 4;
        });
        y += 2;
      }
      if (proj.projectLink) {
        setFont("normal", FONT_XS, accentColor || "#007bff");
        pdf.textWithLink(stripHtml(proj.projectLink), 20, y, {
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
