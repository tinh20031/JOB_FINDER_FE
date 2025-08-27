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

export default async function generateMinimalPDF(resume, accentColor, removeLogo = false) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20; // Default margin
  const leftColumnWidth = pageWidth / 2 - 15;
  const rightColumnWidth = pageWidth / 2 - 15;

  // Define column positions
  const leftColumnX = margin;
  const rightColumnX = pageWidth / 2 + 5;
  const rightColumnEnd = pageWidth - margin;

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
  const FONT_XL = 24;
  const FONT_LG = 14;
  const FONT_MD = 11;
  const FONT_SM = 9;
  const FONT_XS = 8;

  const setFont = (weight = "normal", size = FONT_MD, color = "#222") => {
    pdf.setFont("Arimo", weight);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
  };

  // Text processing functions
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

  // Better text wrapping function
  const wrapText = (text, maxWidth, fontSize) => {
    if (!text) return [];

    // Normalize: remove newlines to avoid jsPDF auto multi-line rendering within a single draw
    // which previously caused overlapping when we also manually iterate lines.
    text = String(text)
      .replace(/\r?\n+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    pdf.setFontSize(fontSize);

    if (pdf.getTextWidth(text) <= maxWidth) {
      return [text];
    }

    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (pdf.getTextWidth(testLine) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          const chars = word.split("");
          let charLine = "";

          for (let j = 0; j < chars.length; j++) {
            const testCharLine = charLine + chars[j];
            if (pdf.getTextWidth(testCharLine) <= maxWidth) {
              charLine = testCharLine;
            } else {
              lines.push(charLine);
              charLine = chars[j];
            }
          }

          if (charLine) {
            currentLine = charLine;
          }
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Important: Start Y positions for left and right columns (reduced to start content higher)
  let leftY = 55; // Starting position for left column content
  let rightY = 55; // Starting position for right column content
  let currentPage = 1;

  // Maximum Y position for content
  const maxContentY = pageHeight - 25;

  // Debug flag to help identify page break issues
  let debug = false;

  // Add a new page function that sets up the proper layout
  const addNewPage = () => {
    pdf.addPage();
    currentPage++;
    leftY = 40;
    rightY = 40;

    // Add the divider line on the new page
    pdf.setDrawColor("#dddddd");
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 2, 20, pageWidth / 2, pageHeight - 20);

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Page ${currentPage}`, 5, 5);
    }
  };

  // Helper function to see if content will fit on current page
  const willContentFit = (y, contentHeight) => {
    return y + contentHeight <= maxContentY;
  };

  // Check for page break with better fitting algorithm
  const checkPageBreak = (y, contentHeight, column) => {
    if (!willContentFit(y, contentHeight)) {
      addNewPage();
      return column === "left" ? leftY : rightY;
    }
    return y;
  };

  // Helper function to get remaining space in a column
  const getRemainingSpace = (column) => {
    const y = column === "left" ? leftY : rightY;
    return maxContentY - y;
  };

  // Header background
  pdf.setFillColor("#e8e8e8");
  pdf.rect(0, 0, pageWidth, 50, "F");

  // Name
  setFont("bold", FONT_XL, "#333333");
  pdf.text(resume?.fullName || "", leftColumnX, 25);

  // Job title
  setFont("normal", FONT_MD, "#666666");
  pdf.text((resume?.jobTitle || "").toUpperCase(), leftColumnX, 35);

  // Avatar
  let avatarImg = resume?.image || resume?.avatar || "/default-avatar.png";
  if (
    avatarImg &&
    (avatarImg.startsWith("data:image") || avatarImg.startsWith("http"))
  ) {
    try {
      pdf.addImage(
        avatarImg,
        "JPEG",
        pageWidth - 40,
        10,
        30,
        30,
        undefined,
        "FAST"
      );
    } catch (e) {
      pdf.setFillColor("#ffffff");
      pdf.circle(pageWidth - 25, 25, 15, "F");
    }
  } else {
    pdf.setFillColor("#ffffff");
    pdf.circle(pageWidth - 25, 25, 15, "F");
  }

  // Vertical divider line - adjusted to start immediately after header
  pdf.setDrawColor("#dddddd");
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2, 50, pageWidth / 2, pageHeight - 20);

  // Enhanced helpers for text splitting
  const splitTextLeft = (text) => wrapText(text, leftColumnWidth, FONT_XS);
  const splitTextRight = (text) => wrapText(text, rightColumnWidth, FONT_XS);

  // Improved Section title renderer - returns next Y position
  // SIGNIFICANTLY REDUCE THE SPACE AFTER SECTION TITLE
  const renderSectionTitle = (title, x, y, column) => {
    if (!willContentFit(y, 10)) {
      // Minimum height for section title + some content
      addNewPage();
      y = column === "left" ? leftY : rightY;
    }

    setFont("bold", FONT_SM, accentColor || "#e74c3c");
    pdf.text(title, x, y);

    // Tăng spacing sau tiêu đề section từ 4 lên 12
    const nextY = y + 12;

    // Update column position
    if (column === "left") {
      leftY = nextY;
    } else {
      rightY = nextY;
    }

    return nextY;
  };

  // Personal Details Section
  const renderPersonalDetails = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Personal Details: leftY=${leftY}`, 5, 10);
    }

    const sectionY = renderSectionTitle(
      "PERSONAL DETAILS",
      leftColumnX,
      leftY,
      "left"
    );

    setFont("normal", FONT_XS, "#333333");
    let iconSize = 4;
    let iconTextGap = 2;
    let y = sectionY;
    let totalContentHeight = 0;

    // Pre-calculate content height for all personal details
    const items = [];

    if (resume?.phone) {
      items.push({
        type: "phone",
        height: 8,
        text: resume.phone,
      });
      totalContentHeight += 8;
    }

    if (resume?.email) {
      items.push({
        type: "email",
        height: 8,
        text: resume.email,
      });
      totalContentHeight += 8;
    }

    if (resume?.dob) {
      items.push({
        type: "dob",
        height: 8,
        text: formatDate(resume.dob),
      });
      totalContentHeight += 8;
    }

    if (resume?.address || resume?.province || resume?.city) {
      const location = [resume.address, resume.province, resume.city]
        .filter(Boolean)
        .join(", ");

      const addressLines = wrapText(
        location,
        leftColumnWidth - (iconSize + iconTextGap),
        FONT_XS
      );
      const addressHeight = addressLines.length * 6 + 3;

      items.push({
        type: "address",
        height: addressHeight,
        text: location,
        lines: addressLines,
      });

      totalContentHeight += addressHeight;
    }

    if (resume?.personalLink) {
      const linkLines = wrapText(
        resume.personalLink,
        leftColumnWidth - (iconSize + iconTextGap),
        FONT_XS
      );
      const linkHeight = linkLines.length * 6 + 3;

      items.push({
        type: "link",
        height: linkHeight,
        text: resume.personalLink,
        lines: linkLines,
      });

      totalContentHeight += linkHeight;
    }

    // Check if all content will fit, if not, start a new page
    y = checkPageBreak(y, totalContentHeight, "left");

    // Now render all items
    for (const item of items) {
      switch (item.type) {
        case "phone":
          if (phoneIcon) {
            pdf.addImage(
              phoneIcon,
              "PNG",
              leftColumnX,
              y - 3,
              iconSize,
              iconSize
            );
          }
          pdf.text(item.text, leftColumnX + iconSize + iconTextGap, y);
          y += 8;
          break;

        case "email":
          if (mailIcon) {
            pdf.addImage(
              mailIcon,
              "PNG",
              leftColumnX,
              y - 3,
              iconSize,
              iconSize
            );
          }
          pdf.text(item.text, leftColumnX + iconSize + iconTextGap, y);
          y += 8;
          break;

        case "dob":
          if (giftIcon) {
            pdf.addImage(
              giftIcon,
              "PNG",
              leftColumnX,
              y - 3,
              iconSize,
              iconSize
            );
          }
          pdf.text(item.text, leftColumnX + iconSize + iconTextGap, y);
          y += 8;
          break;

        case "address":
          if (mapIcon) {
            pdf.addImage(
              mapIcon,
              "PNG",
              leftColumnX,
              y - 3,
              iconSize,
              iconSize
            );
          }

          for (let i = 0; i < item.lines.length; i++) {
            pdf.text(
              item.lines[i],
              leftColumnX + (i === 0 ? iconSize + iconTextGap : 0),
              y + i * 6
            );
          }
          y += item.lines.length * 6 + 3;
          break;

        case "link":
          if (globeIcon) {
            pdf.addImage(
              globeIcon,
              "PNG",
              leftColumnX,
              y - 3,
              iconSize,
              iconSize
            );
          }

          for (let i = 0; i < item.lines.length; i++) {
            pdf.text(
              item.lines[i],
              leftColumnX + (i === 0 ? iconSize + iconTextGap : 0),
              y + i * 6
            );
          }
          y += item.lines.length * 6 + 3;
          break;
      }
    }

    // Update left column position
    leftY = y + 8;

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Personal Details: leftY=${leftY}`, 5, 15);
    }
  };

  // About Me Section
  const renderAboutMe = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before About Me: leftY=${leftY}`, 5, 20);
    }

    const sectionY = renderSectionTitle("ABOUT ME", leftColumnX, leftY, "left");

    const aboutText =
      resume?.aboutme?.[0]?.aboutMeDescription ||
      resume?.aboutMes?.[0]?.aboutMeDescription ||
      resume?.about;

    if (aboutText) {
      setFont("normal", FONT_XS, "#444444");
      const lines = splitTextLeft(stripHtml(aboutText));

      // Calculate content height
      const contentHeight = lines.length * 6;

      // Check if content fits
      let y = checkPageBreak(sectionY, contentHeight, "left");

      for (let i = 0; i < lines.length; i++) {
        if (y + 6 > maxContentY) {
          addNewPage();
          y = leftY;
        }

        pdf.text(lines[i], leftColumnX, y);
        y += 6;
      }

      // Update left column position
      leftY = y + 8;
    }

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After About Me: leftY=${leftY}`, 5, 25);
    }
  };

  // Education Section
  const renderEducation = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Education: leftY=${leftY}`, 5, 30);
    }

    const sectionY = renderSectionTitle(
      "EDUCATION",
      leftColumnX,
      leftY,
      "left"
    );

    let y = sectionY;

    if (Array.isArray(resume?.educations) && resume.educations.length > 0) {
      // Pre-calculate total education height
      let totalHeight = 0;
      const educationItems = [];

      for (let i = 0; i < resume.educations.length; i++) {
        const edu = resume.educations[i];

        const schoolLines = wrapText(
          stripHtml(edu.school || ""),
          leftColumnWidth,
          FONT_SM
        );
        const detailLines = edu.detail
          ? wrapText(stripHtml(edu.detail), leftColumnWidth, FONT_XS)
          : [];

        const itemHeight =
          schoolLines.length * 7 +
          detailLines.length * 6 +
          8 +
          (i < resume.educations.length - 1 ? 5 : 0);

        educationItems.push({
          schoolLines,
          detailLines,
          dateText: formatDateRange(
            edu.monthStart,
            edu.monthEnd,
            edu.isStudying
          ),
          height: itemHeight,
        });

        totalHeight += itemHeight;
      }

      // Check if all education will fit, otherwise start new page
      y = checkPageBreak(y, totalHeight, "left");

      // Now render each education item
      for (const item of educationItems) {
        setFont("bold", FONT_SM, "#333333");

        for (let j = 0; j < item.schoolLines.length; j++) {
          pdf.text(item.schoolLines[j], leftColumnX, y);
          y += 7;
        }

        if (item.detailLines.length > 0) {
          setFont("normal", FONT_XS, "#666666");

          for (let j = 0; j < item.detailLines.length; j++) {
            pdf.text(item.detailLines[j], leftColumnX, y);
            y += 6;
          }
        }

        setFont("normal", FONT_XS, "#888888");
        pdf.text(item.dateText, leftColumnX, y);
        y += 8;
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có thông tin học vấn.", leftColumnX, y);
      y += 8;
    }

    // Update left column position
    leftY = y + 8;

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Education: leftY=${leftY}`, 5, 35);
    }
  };

  // Skills Section
  const renderSkills = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Skills: leftY=${leftY}`, 5, 40);
    }

    const sectionY = renderSectionTitle("SKILL", leftColumnX, leftY, "left");

    let y = sectionY;

    const coreSkills = Array.isArray(resume?.skills)
      ? resume.skills.filter((s) => s.groupName === "Core Skills")
      : [];
    const softSkills = Array.isArray(resume?.skills)
      ? resume.skills.filter((s) => s.groupName === "Soft Skills")
      : [];

    // Core Skills
    if (coreSkills.length > 0) {
      // Calculate total core skills height
      let coreSkillsHeight = 5; // Header (reduced from 6)
      const coreSkillItems = [];

      for (const skill of coreSkills) {
        const label = `${stripHtml(skill.skillName)}${
          skill.experience ? ` (${skill.experience})` : ""
        }`;
        const badgeWidth = pdf.getTextWidth(label) + 6;

        if (badgeWidth > leftColumnWidth) {
          const parts = wrapText(label, leftColumnWidth - 10, 7);
          coreSkillsHeight += parts.length * 9;

          coreSkillItems.push({
            label,
            parts,
            multiline: true,
          });
        } else {
          coreSkillsHeight += 9;

          coreSkillItems.push({
            label,
            width: badgeWidth,
            multiline: false,
          });
        }
      }

      coreSkillsHeight += 4;

      // Check if core skills fit
      y = checkPageBreak(y, coreSkillsHeight, "left");

      // Render core skills header
      setFont("bold", FONT_XS, "#333333");
      pdf.text("Core Skills", leftColumnX, y);
      y += 7;

      // Render core skills
      for (const item of coreSkillItems) {
        if (item.multiline) {
          for (let j = 0; j < item.parts.length; j++) {
            if (y + 7 > maxContentY) {
              addNewPage();
              y = leftY;
            }

            const partWidth = pdf.getTextWidth(item.parts[j]) + 6;

            pdf.setFillColor("#0066cc");
            pdf.rect(leftColumnX, y - 3, partWidth, 5, "F");

            setFont("normal", 7, "#ffffff");
            pdf.text(item.parts[j], leftColumnX + 3, y);
            y += 9;
          }
        } else {
          if (y + 7 > maxContentY) {
            addNewPage();
            y = leftY;
          }

          pdf.setFillColor("#0066cc");
          pdf.rect(leftColumnX, y - 3, item.width, 5, "F");

          setFont("normal", 7, "#ffffff");
          pdf.text(item.label, leftColumnX + 3, y);
          y += 9;
        }
      }

      y += 4;
    }

    // Soft Skills
    if (softSkills.length > 0) {
      // Calculate soft skills height
      let softSkillsHeight = 5; // Header (reduced from 6)
      const softSkillItems = [];

      for (const skill of softSkills) {
        const skillText = `• ${stripHtml(skill.skillName)}`;
        const skillLines = wrapText(skillText, leftColumnWidth - 5, FONT_XS);

        softSkillsHeight += skillLines.length * 6 + 4;

        softSkillItems.push({
          text: skillText,
          lines: skillLines,
        });
      }

      // Check if soft skills fit
      if (!willContentFit(y, softSkillsHeight)) {
        addNewPage();
        y = leftY;
      }

      // Render soft skills header
      setFont("bold", FONT_XS, "#333333");
      pdf.text("Soft Skills", leftColumnX, y);
      y += 7;

      // Render soft skills
      setFont("normal", FONT_XS, "#444444");

      for (const item of softSkillItems) {
        // Check for page break within soft skills
        if (!willContentFit(y, item.lines.length * 6)) {
          addNewPage();
          y = leftY;
        }

        for (let j = 0; j < item.lines.length; j++) {
          pdf.text(
            j === 0 ? item.lines[j] : `  ${item.lines[j].trim()}`,
            leftColumnX + (j === 0 ? 0 : 5),
            y + j * 6
          );
        }

        y += item.lines.length * 6 + 4;
      }
    }

    // Update left column position
    leftY = y + 8;

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Skills: leftY=${leftY}`, 5, 45);
    }
  };

  // Foreign Language Section
  const renderForeignLanguage = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Foreign Language: leftY=${leftY}`, 5, 50);
    }

    const sectionY = renderSectionTitle(
      "FOREIGN LANGUAGE",
      leftColumnX,
      leftY,
      "left"
    );

    let y = sectionY;

    if (
      Array.isArray(resume?.foreginLanguages) &&
      resume.foreginLanguages.length > 0
    ) {
      // Calculate languages height
      const languagesHeight = resume.foreginLanguages.length * 8;

      // Check if languages fit
      y = checkPageBreak(y, languagesHeight, "left");

      for (let i = 0; i < resume.foreginLanguages.length; i++) {
        const lang = resume.foreginLanguages[i];

        setFont("bold", FONT_XS, "#333333");
        const langName = `${stripHtml(lang.languageName)}: `;
        pdf.text(langName, leftColumnX, y);

        setFont("normal", FONT_XS, "#666666");
        pdf.text(
          stripHtml(lang.languageLevel),
          leftColumnX + pdf.getTextWidth(langName),
          y
        );
        y += 8;
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có ngoại ngữ.", leftColumnX, y);
      y += 8;
    }

    // Update left column position
    leftY = y + 8;

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Foreign Language: leftY=${leftY}`, 5, 55);
    }
  };

  // Work Experience Section
  const renderWorkExperience = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Work Experience: rightY=${rightY}`, pageWidth - 30, 10);
    }

    const sectionY = renderSectionTitle(
      "WORK EXPERIENCE",
      rightColumnX,
      rightY,
      "right"
    );

    let y = sectionY;

    if (
      Array.isArray(resume?.workExperiences) &&
      resume.workExperiences.length > 0
    ) {
      // Pre-calculate and render each experience
      for (let i = 0; i < resume.workExperiences.length; i++) {
        const exp = resume.workExperiences[i];

        // Calculate experience item height
        const dateRange = formatDateRange(
          exp.monthStart,
          exp.monthEnd,
          exp.isWorking
        );
        const dateWidth = pdf.getTextWidth(dateRange);
        const maxTitleWidth = rightColumnWidth - dateWidth - 5;

        const jobTitle = stripHtml(exp.jobTitle || "");
        const titleLines = wrapText(jobTitle, maxTitleWidth, FONT_SM);

        const companyLines = exp.companyName
          ? wrapText(stripHtml(exp.companyName), rightColumnWidth, FONT_XS)
          : [];
        const descLines = exp.workDescription
          ? splitTextRight(stripHtml(exp.workDescription))
          : [];

        // Calculate project height if present
        let projectHeight = 0;
        let projectLines = [];

        if (exp.proJects) {
          const projectLabel = "PROJECT: ";
          const projectLabelWidth = pdf.getTextWidth(projectLabel);
          const projectText = stripHtml(exp.proJects);
          projectLines = wrapText(
            projectText,
            rightColumnWidth - projectLabelWidth,
            FONT_XS
          );
          projectHeight = 4 * projectLines.length + 3; // Reduced from 5 * projectLines.length + 4
        }

        // Total item height
        const itemHeight =
          titleLines.length * 5 + // Reduced from 6
          companyLines.length * 4 + // Reduced from 5
          (descLines.length > 0 ? descLines.length * 3.5 + 3 : 0) + // Reduced from 4 + 4
          projectHeight +
          5; // Reduced from 8

        // Check if this item fits
        y = checkPageBreak(y, itemHeight, "right");

        // Job title and date
        setFont("bold", FONT_SM, "#333333");

        for (let j = 0; j < titleLines.length; j++) {
          pdf.text(titleLines[j], rightColumnX, y + j * 5); // Reduced from 6
        }

        // Date
        setFont("normal", FONT_XS, "#666666");
        pdf.text(dateRange, rightColumnEnd - dateWidth, y);

        y += 5 * titleLines.length; // Adjusted

        // Company name
        if (companyLines.length > 0) {
          setFont("normal", FONT_XS, "#666666");

          for (let j = 0; j < companyLines.length; j++) {
            pdf.text(companyLines[j], rightColumnX, y + j * 4); // Reduced from 5
          }

          y += 4 * companyLines.length; // Adjusted
        }

        // Description
        if (descLines.length > 0) {
          y += 1.5; // Reduced from 2
          setFont("normal", FONT_XS, "#444444");

          for (let j = 0; j < descLines.length; j++) {
            if (y + 3.5 > maxContentY) {
              // Reduced from 4
              addNewPage();
              y = rightY;
            }

            pdf.text(descLines[j], rightColumnX, y);
            y += 3.5; // Reduced from 4
          }

          y += 1.5; // Reduced from 2
        }

        // Additional fields
        if (exp.responsibilities) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(exp.responsibilities));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (exp.achievements) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(exp.achievements));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (exp.technologies) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(exp.technologies));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (exp.projectName) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(exp.projectName));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (exp.projectLink) {
          setFont("normal", FONT_XS, "#0066cc");
          pdf.textWithLink(stripHtml(exp.projectLink), rightColumnX, y, {
            url: exp.projectLink,
          });
          y += 4;
        }

        // Project
        if (exp.proJects) {
          if (y + projectHeight > maxContentY) {
            addNewPage();
            y = rightY;
          }

          setFont("bold", FONT_XS, "#333333");
          pdf.text("PROJECT: ", rightColumnX, y);

          setFont("normal", FONT_XS, "#0066cc");
          const projectLabel = "PROJECT: ";
          const projectLabelWidth = pdf.getTextWidth(projectLabel);

          for (let j = 0; j < projectLines.length; j++) {
            pdf.text(
              projectLines[j],
              rightColumnX + (j === 0 ? projectLabelWidth : 0),
              y + j * 4 // Reduced from 5
            );
          }

          y += 4 * projectLines.length; // Adjusted
        }

        y += 5; // Space between experiences (reduced from 6)
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có kinh nghiệm làm việc.", rightColumnX, y);
      y += 6; // Reduced from 8
    }

    // Update right column position
    rightY = y + 2; // Reduced from 3

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Work Experience: rightY=${rightY}`, pageWidth - 30, 15);
    }
  };

  // Highlight Project Section
  const renderHighlightProject = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(
        `Before Highlight Project: rightY=${rightY}`,
        pageWidth - 30,
        20
      );
    }

    const sectionY = renderSectionTitle(
      "HIGHLIGHT PROJECT",
      rightColumnX,
      rightY,
      "right"
    );

    let y = sectionY;

    if (
      Array.isArray(resume?.highlightProjects) &&
      resume.highlightProjects.length > 0
    ) {
      for (let i = 0; i < resume.highlightProjects.length; i++) {
        const proj = resume.highlightProjects[i];

        // Calculate project item height
        const dateRange = formatDateRange(
          proj.monthStart,
          proj.monthEnd,
          proj.isWorking
        );
        const dateWidth = pdf.getTextWidth(dateRange);
        const maxNameWidth = rightColumnWidth - dateWidth - 5;

        const projectName = stripHtml(proj.projectName || "");
        const nameLines = wrapText(projectName, maxNameWidth, FONT_SM);

        const descLines = proj.projectDescription
          ? splitTextRight(stripHtml(proj.projectDescription))
          : [];
        const linkLines = proj.projectLink
          ? wrapText(stripHtml(proj.projectLink), rightColumnWidth, FONT_XS)
          : [];

        // Total item height
        const itemHeight =
          nameLines.length * 5 + // Reduced from 6
          (descLines.length > 0 ? descLines.length * 3.5 + 3 : 0) + // Reduced from 4 + 4
          linkLines.length * 4 +
          5; // Reduced from 5 + 8

        // Check if this item fits
        y = checkPageBreak(y, itemHeight, "right");

        // Project name and date
        setFont("bold", FONT_SM, "#333333");

        for (let j = 0; j < nameLines.length; j++) {
          pdf.text(nameLines[j], rightColumnX, y + j * 5); // Reduced from 6
        }

        // Date
        setFont("normal", FONT_XS, "#666666");
        pdf.text(dateRange, rightColumnEnd - dateWidth, y);

        y += 5 * nameLines.length; // Adjusted

        // Description
        if (descLines.length > 0) {
          y += 1.5; // Reduced from 2
          setFont("normal", FONT_XS, "#444444");

          for (let j = 0; j < descLines.length; j++) {
            if (y + 3.5 > maxContentY) {
              // Reduced from 4
              addNewPage();
              y = rightY;
            }

            pdf.text(descLines[j], rightColumnX, y);
            y += 3.5; // Reduced from 4
          }

          y += 1.5; // Reduced from 2
        }

        // Additional fields
        if (proj.technologies) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(proj.technologies));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (proj.responsibilities) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(proj.responsibilities));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (proj.teamSize) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(proj.teamSize));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (proj.achievements) {
          setFont("normal", FONT_XS, "#444444");
          const lines = splitTextRight(stripHtml(proj.achievements));
          for (let j = 0; j < lines.length; j++) {
            pdf.text(lines[j], rightColumnX, y);
            y += 3.5;
          }
          y += 1.5;
        }
        if (proj.projectLink) {
          setFont("normal", FONT_XS, "#0066cc");
          pdf.textWithLink(stripHtml(proj.projectLink), rightColumnX, y, {
            url: proj.projectLink,
          });
          y += 4;
        }

        y += 5; // Reduced from 6
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có dự án nổi bật.", rightColumnX, y);
      y += 6; // Reduced from 8
    }

    // Update right column position
    rightY = y + 2; // Reduced from 3

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Highlight Project: rightY=${rightY}`, pageWidth - 30, 25);
    }
  };

  // Certificate Section
  const renderCertificate = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Certificate: rightY=${rightY}`, pageWidth - 30, 30);
    }

    const sectionY = renderSectionTitle(
      "CERTIFICATE",
      rightColumnX,
      rightY,
      "right"
    );

    let y = sectionY;

    if (Array.isArray(resume?.certificates) && resume.certificates.length > 0) {
      for (let i = 0; i < resume.certificates.length; i++) {
        const cert = resume.certificates[i];

        // Calculate certificate item height
        const certDate = formatDate(cert.month);
        const dateWidth = pdf.getTextWidth(certDate);
        const maxNameWidth = rightColumnWidth - dateWidth - 5;

        const certName = stripHtml(cert.certificateName || "");
        const nameLines = wrapText(certName, maxNameWidth, FONT_SM);

        const orgLines = cert.organization
          ? wrapText(stripHtml(cert.organization), rightColumnWidth, FONT_XS)
          : [];

        // URL height
        let urlHeight = 0;
        let urlLines = [];

        if (cert.certificateUrl) {
          const urlLabel = "Certificate URL: ";
          const urlLabelWidth = pdf.getTextWidth(urlLabel);
          const urlText = stripHtml(cert.certificateUrl);
          urlLines = wrapText(
            urlText,
            rightColumnWidth - urlLabelWidth,
            FONT_XS
          );
          urlHeight = 4 * urlLines.length + 1.5; // Reduced from 5 * urlLines.length + 2
        }

        const descLines = cert.certificateDescription
          ? splitTextRight(stripHtml(cert.certificateDescription))
          : [];

        // Total item height
        const itemHeight =
          nameLines.length * 5 + // Reduced from 6
          orgLines.length * 4 + // Reduced from 5
          urlHeight +
          (descLines.length > 0 ? descLines.length * 3.5 + 3 : 0) +
          5; // Reduced

        // Check if this item fits
        y = checkPageBreak(y, itemHeight, "right");

        // Certificate name and date
        setFont("bold", FONT_SM, "#333333");

        for (let j = 0; j < nameLines.length; j++) {
          pdf.text(nameLines[j], rightColumnX, y + j * 5); // Reduced from 6
        }

        // Date
        setFont("normal", FONT_XS, "#666666");
        pdf.text(certDate, rightColumnEnd - dateWidth, y);

        y += 5 * nameLines.length; // Adjusted

        // Organization
        if (orgLines.length > 0) {
          setFont("normal", FONT_XS, "#666666");

          for (let j = 0; j < orgLines.length; j++) {
            pdf.text(orgLines[j], rightColumnX, y + j * 4); // Reduced from 5
          }

          y += 4 * orgLines.length; // Adjusted
        }

        // URL
        if (cert.certificateUrl) {
          if (y + urlHeight > maxContentY) {
            addNewPage();
            y = rightY;
          }

          setFont("bold", FONT_XS, "#333333");
          const urlLabel = "Certificate URL: ";
          pdf.text(urlLabel, rightColumnX, y);

          setFont("normal", FONT_XS, "#0066cc");
          const urlLabelWidth = pdf.getTextWidth(urlLabel);

          for (let j = 0; j < urlLines.length; j++) {
            pdf.text(
              urlLines[j],
              rightColumnX + (j === 0 ? urlLabelWidth : 0),
              y + j * 4 // Reduced from 5
            );
          }

          y += 4 * urlLines.length; // Adjusted
        }

        // Description
        if (descLines.length > 0) {
          y += 1.5; // Reduced from 2
          setFont("normal", FONT_XS, "#444444");

          for (let j = 0; j < descLines.length; j++) {
            if (y + 3.5 > maxContentY) {
              // Reduced from 4
              addNewPage();
              y = rightY;
            }

            pdf.text(descLines[j], rightColumnX, y);
            y += 3.5; // Reduced from 4
          }

          y += 1.5; // Reduced from 2
        }

        y += 5; // Reduced from 6
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có chứng chỉ.", rightColumnX, y);
      y += 6; // Reduced from 8
    }

    // Update right column position
    rightY = y + 2; // Reduced from 3

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Certificate: rightY=${rightY}`, pageWidth - 30, 35);
    }
  };

  // Award Section
  const renderAward = () => {
    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`Before Award: rightY=${rightY}`, pageWidth - 30, 40);
    }

    const sectionY = renderSectionTitle("AWARD", rightColumnX, rightY, "right");

    let y = sectionY;

    if (Array.isArray(resume?.awards) && resume.awards.length > 0) {
      for (let i = 0; i < resume.awards.length; i++) {
        const award = resume.awards[i];

        // Calculate award item height
        const awardDate = formatDate(award.month);
        const dateWidth = pdf.getTextWidth(awardDate);
        const maxNameWidth = rightColumnWidth - dateWidth - 5;

        const awardName = stripHtml(award.awardName || "");
        const nameLines = wrapText(awardName, maxNameWidth, FONT_SM);

        const orgLines = award.awardOrganization
          ? wrapText(
              stripHtml(award.awardOrganization),
              rightColumnWidth,
              FONT_XS
            )
          : [];
        const descLines = award.awardDescription
          ? splitTextRight(stripHtml(award.awardDescription))
          : [];

        // Total item height
        const itemHeight =
          nameLines.length * 5 + // Reduced from 6
          orgLines.length * 4 + // Reduced from 5
          (descLines.length > 0 ? descLines.length * 3.5 + 3 : 0) +
          5; // Adjusted

        // Check if this item fits
        y = checkPageBreak(y, itemHeight, "right");

        // Award name and date
        setFont("bold", FONT_SM, "#333333");

        for (let j = 0; j < nameLines.length; j++) {
          pdf.text(nameLines[j], rightColumnX, y + j * 5); // Reduced from 6
        }

        // Date
        setFont("normal", FONT_XS, "#666666");
        pdf.text(awardDate, rightColumnEnd - dateWidth, y);

        y += 5 * nameLines.length; // Adjusted

        // Organization
        if (orgLines.length > 0) {
          setFont("normal", FONT_XS, "#666666");

          for (let j = 0; j < orgLines.length; j++) {
            pdf.text(orgLines[j], rightColumnX, y + j * 4); // Reduced from 5
          }

          y += 4 * orgLines.length; // Adjusted
        }

        // Description
        if (descLines.length > 0) {
          y += 1.5; // Reduced from 2
          setFont("normal", FONT_XS, "#444444");

          for (let j = 0; j < descLines.length; j++) {
            if (y + 3.5 > maxContentY) {
              // Reduced from 4
              addNewPage();
              y = rightY;
            }

            pdf.text(descLines[j], rightColumnX, y);
            y += 3.5; // Reduced from 4
          }

          y += 1.5; // Reduced from 2
        }

        y += 5; // Reduced from 6
      }
    } else {
      setFont("normal", FONT_XS, "#666666");
      pdf.text("Chưa có giải thưởng.", rightColumnX, y);
      y += 6; // Reduced from 8
    }

    // Update right column position
    rightY = y + 2; // Reduced from 3

    if (debug) {
      setFont("normal", FONT_XS, "#999999");
      pdf.text(`After Award: rightY=${rightY}`, pageWidth - 30, 45);
    }
  };

  // RESTRUCTURED CONTENT RENDERING - BALANCED APPROACH
  const renderContent = () => {
    // First, calculate heights of sections to determine optimal order
    let leftColumnContentHeight = 0;
    let rightColumnContentHeight = 0;

    // Start with core sections that should remain in their positions
    renderPersonalDetails(); // Always first in left column
    renderWorkExperience(); // Always first in right column

    // Now calculate typical heights of other sections
    // This is approximate and can be adjusted
    const aboutMeHeight = resume?.about ? 50 : 0;
    const educationHeight = Array.isArray(resume?.educations)
      ? resume.educations.length * 25
      : 0;
    const skillsHeight = Array.isArray(resume?.skills)
      ? resume.skills.length * 10
      : 0;
    const languagesHeight = Array.isArray(resume?.foreginLanguages)
      ? resume.foreginLanguages.length * 10
      : 0;

    leftColumnContentHeight = leftY - 55; // Starting Y was 55
    rightColumnContentHeight = rightY - 55;

    // Make balanced decisions based on content sizes
    if (
      aboutMeHeight + educationHeight + leftColumnContentHeight <
      pageHeight - 55
    ) {
      // If we can fit about me and education on first page, do it
      renderAboutMe();
      renderEducation();
      leftColumnContentHeight = leftY - 55;

      // Then decide on skills and languages
      if (
        skillsHeight + languagesHeight + leftColumnContentHeight <
        pageHeight - 55
      ) {
        // If everything fits on page 1, add it all
        renderSkills();
        renderForeignLanguage();
      } else {
        // Otherwise, put skills on page 1 if possible, languages on page 2
        if (skillsHeight + leftColumnContentHeight < pageHeight - 55) {
          renderSkills();
          renderForeignLanguage();
        } else {
          renderForeignLanguage();
          renderSkills();
        }
      }
    } else {
      // If we can't fit both about me and education on page 1
      if (aboutMeHeight + leftColumnContentHeight < pageHeight - 55) {
        renderAboutMe();
        renderEducation();
        renderSkills();
        renderForeignLanguage();
      } else {
        renderEducation();
        renderSkills();
        renderForeignLanguage();
        renderAboutMe();
      }
    }

    // Right column continues with the rest
    renderHighlightProject();
    renderCertificate();
    renderAward();
  };

  // Render the content with improved layout strategy
  renderContent();

  // Thêm logo JobFinder ở góc phải dưới PDF nếu không removeLogo
  if (!removeLogo) {
    const logoUrl = "/images/jobfinder-logo.png";
    const logoImg = await svgUrlToBase64Png(logoUrl, 120); // 120px ~ 12mm
    const logoWidth = 24; // mm
    const logoHeight = 12; // mm
    const logoX = pageWidth - logoWidth - 10;
    let logoY = pdf.internal.pageSize.getHeight() - logoHeight - 10;
    if (leftY > logoY || rightY > logoY) {
      pdf.addPage();
      logoY = pdf.internal.pageSize.getHeight() - logoHeight - 10;
    }
    pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  // Save the PDF
  pdf.save(`${resume?.fullName || "resume"}-Minimal.pdf`);
}
