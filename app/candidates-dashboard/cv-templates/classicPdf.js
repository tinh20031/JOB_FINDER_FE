import { jsPDF } from "jspdf";
import { ArimoRegularNormal } from "@/utils/fonts/Arimo-Regular-normal";
import { ArimoBoldNormal } from "@/utils/fonts/Arimo-Bold-normal";

export default function generateClassicPDF(resume, accentColor) {
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

  const stripHtml = (html) =>
    html ? String(html).replace(/<[^>]*>?/gm, "") : "";

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
  const contactLine1 = [
    resume.phone ? `Phone: ${resume.phone}` : null,
    resume.email ? `Email: ${resume.email}` : null,
    resume.dob ? `DOB: ${formatDateSimple(resume.dob)}` : null,
  ]
    .filter(Boolean)
    .join("  |  ");
  pdf.text(contactLine1, pageWidth / 2, y, { align: "center" });
  y += 5;

  const contactLine2 = [
    resume.address
      ? `Address: ${[resume.address, resume.province, resume.city]
          .filter(Boolean)
          .join(", ")}`
      : null,
    resume.personalLink ? `Link: ${resume.personalLink}` : null,
  ]
    .filter(Boolean)
    .join("  |  ");
  pdf.text(contactLine2, pageWidth / 2, y, { align: "center" });
  y += 10;

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
        renderSplitText(stripHtml(exp.workDescription));
        if (exp.proJects) {
          pdf.setFont("Arimo", "bold");
          renderSplitText("Projects: " + stripHtml(exp.proJects));
          pdf.setFont("Arimo", "normal");
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
        renderSplitText(stripHtml(proj.projectDescription));
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

  pdf.save(`${resume.fullName || "resume"}-classic.pdf`);
}
