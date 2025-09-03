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

export default async function generateClassicPDF(resume, accentColor, removeLogo = false) {
  const pdf = new jsPDF("p", "mm", "a4");
  // Helper: Ensure Arimo font is always embedded
  const ensureArimoFont = (pdf) => {
    if (ArimoRegularNormal) {
      pdf.addFileToVFS("Arimo-Regular-normal.ttf", ArimoRegularNormal);
      pdf.addFont("Arimo-Regular-normal.ttf", "Arimo", "normal");
    }
    if (ArimoBoldNormal) {
      pdf.addFileToVFS("Arimo-Bold-normal.ttf", ArimoBoldNormal);
      pdf.addFont("Arimo-Bold-normal.ttf", "Arimo", "bold");
    }
  };
  ensureArimoFont(pdf);
  pdf.setFont("Arimo", "bold");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

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

  const formatDateSimple = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatDateRange = (start, end, isWorking) => {
    if (!start) return "";
    const startDate = new Date(start);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
    let endStr = "NOW";
    if (!isWorking && end) {
      const endDate = new Date(end);
      endStr = `${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
    }
    return `${startStr} - ${endStr}`;
  };

  // --- RENDER HEADER ---
  pdf.setFont("Arimo", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(accentColor);
  pdf.text(resume.fullName || "", pageWidth / 2, y, { align: "center" });
  y += 8;

  pdf.setFont("Arimo", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor("#333");
  if (resume.jobTitle) {
    pdf.text(resume.jobTitle, pageWidth / 2, y, { align: "center" });
    y += 8;
  }

  pdf.setFontSize(9);
  let iconSize = 4.5; // mm
  let iconTextGap = 2; // mm
  let contactX = margin;
  let contactY = y;
  // Contact line 1: phone, mail, dob
  let contactLine1 = [];
  if (resume.phone) contactLine1.push({ icon: phoneIcon, text: resume.phone });
  if (resume.email) contactLine1.push({ icon: mailIcon, text: resume.email });
  if (resume.dob)
    contactLine1.push({ icon: giftIcon, text: formatDateSimple(resume.dob) });
  // Tính tổng chiều rộng để căn giữa
  let totalWidth1 = contactLine1.reduce(
    (sum, item, idx) =>
      sum +
      iconSize +
      iconTextGap +
      pdf.getTextWidth(item.text) +
      (idx > 0 ? 8 : 0),
    0
  );
  let startX1 = (pageWidth - totalWidth1) / 2;
  contactX = startX1;
  contactLine1.forEach((item, idx) => {
    if (idx > 0) contactX += 8;
    if (item.icon)
      pdf.addImage(
        item.icon,
        "PNG",
        contactX,
        contactY - 3,
        iconSize,
        iconSize
      );
    contactX += iconSize + iconTextGap;
    pdf.text(item.text, contactX, contactY);
    contactX += pdf.getTextWidth(item.text);
  });
  y += 7;

  // Contact line 2: address, personalLink
  let contactLine2 = [];
  if (resume.address || resume.province || resume.city) {
    const location = [resume.address, resume.province, resume.city]
      .filter(Boolean)
      .join(", ");
    contactLine2.push({ icon: mapIcon, text: location });
  }
  if (resume.personalLink)
    contactLine2.push({ icon: globeIcon, text: resume.personalLink });
  let totalWidth2 = contactLine2.reduce(
    (sum, item, idx) =>
      sum +
      iconSize +
      iconTextGap +
      pdf.getTextWidth(item.text) +
      (idx > 0 ? 8 : 0),
    0
  );
  let startX2 = (pageWidth - totalWidth2) / 2;
  contactX = startX2;
  contactLine2.forEach((item, idx) => {
    if (idx > 0) contactX += 8;
    if (item.icon)
      pdf.addImage(
        item.icon,
        "PNG",
        contactX,
        contactY + 4,
        iconSize,
        iconSize
      );
    contactX += iconSize + iconTextGap;
    pdf.text(item.text, contactX, contactY + 7);
    contactX += pdf.getTextWidth(item.text);
  });
  y += 12;

  // --- RENDER SECTION HELPER ---
  const renderSection = (title, contentFunc) => {
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFontSize(14);
    pdf.setFont("Arimo", "bold");
    pdf.setTextColor(accentColor);
    pdf.text(title, margin, y);
    y += 1;
    pdf.setDrawColor(accentColor);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    pdf.setFont("Arimo", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor("#333333");
    contentFunc();
  };

  const renderList = (items) => {
    items.forEach((item) => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      const text = stripHtml(item);
      const splitText = pdf.splitTextToSize(text, pageWidth - margin * 2);
      pdf.text(splitText, margin, y);
      y += splitText.length * 4 + 4;
    });
  };

  const renderSplitText = (text) => {
    const splitText = pdf.splitTextToSize(text, pageWidth - margin * 2);
    pdf.text(splitText, margin, y);
    y += splitText.length * 4 + 2;
  };

  // --- RENDER SECTIONS ---
  // About Me section: kiểm tra lần lượt aboutme, aboutMes, about
  if (
    resume.aboutme &&
    Array.isArray(resume.aboutme) &&
    resume.aboutme.length > 0 &&
    resume.aboutme[0]?.aboutMeDescription
  ) {
    renderSection("ABOUT ME", () =>
      renderSplitText(stripHtml(resume.aboutme[0].aboutMeDescription))
    );
  } else if (
    resume.aboutMes &&
    Array.isArray(resume.aboutMes) &&
    resume.aboutMes.length > 0 &&
    resume.aboutMes[0]?.aboutMeDescription
  ) {
    renderSection("ABOUT ME", () =>
      renderSplitText(stripHtml(resume.aboutMes[0].aboutMeDescription))
    );
  } else if (resume.about) {
    renderSection("ABOUT ME", () => renderSplitText(stripHtml(resume.about)));
  }

  if (resume.workExperiences?.length > 0) {
    renderSection("WORK EXPERIENCE", () => {
      resume.workExperiences.forEach((exp, index) => {
        if (y > 265 && index !== 0) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("Arimo", "bold");
        pdf.text(
          exp.jobTitle + (exp.companyName ? ` at ${exp.companyName}` : ""),
          margin,
          y
        );
        pdf.setFont("Arimo", "normal");
        pdf.text(
          formatDateRange(exp.monthStart, exp.monthEnd, exp.isWorking),
          pageWidth - margin,
          y,
          { align: "right" }
        );
        y += 5;
        if (exp.workDescription)
          renderSplitText(stripHtml(exp.workDescription));
        if (exp.responsibilities)
          renderSplitText(stripHtml(exp.responsibilities));
        if (exp.achievements) renderSplitText(stripHtml(exp.achievements));
        if (exp.technologies) renderSplitText(stripHtml(exp.technologies));
        if (exp.projectName) renderSplitText(stripHtml(exp.projectName));
        if (exp.projectLink) {
          pdf.textWithLink("Link: " + exp.projectLink, margin, y, {
            url: exp.projectLink,
          });
          y += 5;
        }
        if (index < resume.workExperiences.length - 1) y += 4;
      });
    });
  }

  if (resume.educations?.length > 0) {
    renderSection("EDUCATION", () => {
      resume.educations.forEach((edu, index) => {
        if (y > 265 && index !== 0) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("Arimo", "bold");
        pdf.text(`${edu.school} - ${edu.degree} (${edu.major})`, margin, y);
        pdf.setFont("Arimo", "normal");
        pdf.text(
          formatDateRange(edu.monthStart, edu.monthEnd, edu.isStudying),
          pageWidth - margin,
          y,
          { align: "right" }
        );
        y += 5;
        renderSplitText(stripHtml(edu.detail));
        if (index < resume.educations.length - 1) y += 4;
      });
    });
  }

  if (resume.skills?.length > 0) {
    renderSection("SKILL", () => {
      const coreSkills = resume.skills.filter(
        (s) => s.groupName === "Core Skills"
      );
      const softSkills = resume.skills.filter(
        (s) => s.groupName === "Soft Skills"
      );

      if (coreSkills.length > 0) {
        pdf.setFont("Arimo", "bold");
        pdf.text("Core Skills:", margin, y);
        y += 5;
        pdf.setFont("Arimo", "normal");
        const skillsText = coreSkills
          .map(
            (s) => `${s.skillName}${s.experience ? ` (${s.experience})` : ""}`
          )
          .join(", ");
        renderSplitText(skillsText);
      }
      if (softSkills.length > 0) {
        if (coreSkills.length > 0) y += 4;
        pdf.setFont("Arimo", "bold");
        pdf.text("Soft Skills:", margin, y);
        y += 5;
        pdf.setFont("Arimo", "normal");
        softSkills.forEach((skill) => {
          renderSplitText(`• ${skill.skillName}`);
        });
      }
    });
  }

  if (resume.foreginLanguages?.length > 0) {
    renderSection("FOREIGN LANGUAGE", () => {
      const langText = resume.foreginLanguages
        .map((lang) => `${lang.languageName} (${lang.languageLevel})`)
        .join("  |  ");
      renderSplitText(langText);
    });
  }

  if (resume.highlightProjects?.length > 0) {
    renderSection("HIGHLIGHT PROJECT", () => {
      resume.highlightProjects.forEach((proj, index) => {
        if (y > 265 && index !== 0) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("Arimo", "bold");
        pdf.text(proj.projectName, margin, y);
        pdf.setFont("Arimo", "normal");
        pdf.text(
          formatDateRange(proj.monthStart, proj.monthEnd, proj.isWorking),
          pageWidth - margin,
          y,
          { align: "right" }
        );
        y += 5;
        if (proj.projectDescription)
          renderSplitText(stripHtml(proj.projectDescription));
        if (proj.technologies) renderSplitText(stripHtml(proj.technologies));
        if (proj.responsibilities)
          renderSplitText(stripHtml(proj.responsibilities));
        if (proj.teamSize) renderSplitText(stripHtml(proj.teamSize));
        if (proj.achievements) renderSplitText(stripHtml(proj.achievements));
        if (proj.projectLink) {
          pdf.textWithLink("Link: " + proj.projectLink, margin, y, {
            url: proj.projectLink,
          });
          y += 5;
        }
        if (index < resume.highlightProjects.length - 1) y += 4;
      });
    });
  }

  if (resume.certificates?.length > 0) {
    renderSection("CERTIFICATE", () => {
      resume.certificates.forEach((cert, index) => {
        if (y > 265 && index !== 0) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("Arimo", "bold");
        pdf.text(
          cert.certificateName +
            (cert.organization ? ` - ${cert.organization}` : ""),
          margin,
          y
        );
        pdf.setFont("Arimo", "normal");
        const certDate = new Date(cert.year);
        pdf.text(
          `${certDate.getMonth() + 1}/${certDate.getFullYear()}`,
          pageWidth - margin,
          y,
          { align: "right" }
        );
        y += 5;
        renderSplitText(stripHtml(cert.certificateDescription));
        if (cert.certificateUrl) {
          pdf.textWithLink(
            "View Certificate: " + cert.certificateUrl,
            margin,
            y,
            { url: cert.certificateUrl }
          );
          y += 5;
        }
        if (index < resume.certificates.length - 1) y += 4;
      });
    });
  }

  if (resume.awards?.length > 0) {
    renderSection("AWARD", () => {
      resume.awards.forEach((award, index) => {
        if (y > 265 && index !== 0) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("Arimo", "bold");
        pdf.text(
          award.awardName +
            (award.awardOrganization ? ` - ${award.awardOrganization}` : ""),
          margin,
          y
        );
        pdf.setFont("Arimo", "normal");
        const awardDate = new Date(award.year);
        pdf.text(
          `${awardDate.getMonth() + 1}/${awardDate.getFullYear()}`,
          pageWidth - margin,
          y,
          { align: "right" }
        );
        y += 5;
        renderSplitText(stripHtml(award.awardDescription));
        if (index < resume.awards.length - 1) y += 4;
      });
    });
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
