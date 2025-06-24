"use client";
import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import CVClassic from "@/components/cv-templates/CVClassic";
import CVElegant from "@/components/cv-templates/CVElegant";
import CVCubic from "@/components/cv-templates/CVCubic";
import CVMinimal from "@/components/cv-templates/CVMinimal";
import useResumeData from "@/services/useResumeData";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import generateClassicPDF from "./classicPdf";
import generateElegantPDF from "./elegantPdf";
import generateCubicPDF from "./cubicPdf";
import generateMinimalPDF from "./minimalPdf";

// Mockup các template CV
const templates = [
  {
    id: "classic",
    name: "Classic",
    img: "/candidates-dashboard/images/classic.png",
    defaultColor: "#121212", // black
    colorOptions: ["#121212", "#1a237e", "#d24417", "#943f5c"], // black, blue, orange, red
  },
  {
    id: "elegant",
    name: "Elegant",
    img: "/candidates-dashboard/images/elegant.png",
    defaultColor: "#383d44", // dark gray/blue
    colorOptions: ["#383d44", "#0e3850"], // gray, dark blue
  },
  {
    id: "minimal",
    name: "Minimal",
    img: "/candidates-dashboard/images/minimal.png",
    defaultColor: "#ed1b2f",
    colorOptions: ["#ed1b2f", "#121212", "#0a3e7a"],
  },
  {
    id: "cubic",
    name: "Cubic",
    img: "/candidates-dashboard/images/cubic.png",
    defaultColor: "#9a173f", // red
    colorOptions: ["#9a173f", "#065668", "#5f175c"], // red, dark gray
  },
];

// Component preview template (mockup)
function CVPreview({ template, resume, accentColor }) {
  if (template.id === "classic") {
    return <CVClassic resume={resume} accentColor={accentColor} />;
  }
  if (template.id === "elegant") {
    return <CVElegant resume={resume} accentColor={accentColor} />;
  }
  if (template.id === "cubic") {
    return <CVCubic resume={resume} accentColor={accentColor} />;
  }
  if (template.id === "minimal") {
    return <CVMinimal resume={resume} accentColor={accentColor} />;
  }
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 24,
        background: "#fff",
        minHeight: 400,
      }}
    >
      <h2>{template.name} Template</h2>
      <div style={{ margin: "16px 0" }}>
        <img
          src={template.img}
          alt={template.name}
          style={{ width: 180, borderRadius: 6 }}
        />
      </div>
      <div>
        <strong>Name:</strong> {resume?.fullName || "Your Name"}
        <br />
        <strong>Email:</strong> {resume?.email || "your@email.com"}
        <br />
        {/* Thêm các trường khác tuỳ ý */}
      </div>
    </div>
  );
}

export default function CVTemplatesPage() {
  const [selected, setSelected] = useState(templates[0].id);
  const [accentColor, setAccentColor] = useState(templates[0].defaultColor);
  const [colorManuallyChanged, setColorManuallyChanged] = useState(false);
  const cvPreviewRef = useRef(null);

  // Lấy dữ liệu resume từ API
  const {
    profile,
    aboutme,
    education,
    experiences,
    awards,
    skills,
    foreignlanguage,
    project,
    certificate,
    loading,
  } = useResumeData();

  // Chuẩn hóa dữ liệu cho CVClassic
  const resume = {
    ...profile,
    aboutme: aboutme,
    educations: education,
    workExperiences: experiences,
    awards: awards,
    skills: skills,
    foreginLanguages: foreignlanguage,
    highlightProjects: project,
    certificates: certificate,
  };
  const template = templates.find((t) => t.id === selected);

  // When template changes, set accentColor and reset colorManuallyChanged
  React.useEffect(() => {
    if (template) {
      setAccentColor(template.defaultColor);
      setColorManuallyChanged(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleDownload = () => {
    if (selected === "classic") {
      generateClassicPDF(resume, accentColor);
    } else if (selected === "elegant") {
      generateElegantPDF(resume, accentColor);
    } else if (selected === "cubic") {
      generateCubicPDF(resume, accentColor);
    } else if (selected === "minimal") {
      generateMinimalPDF(resume, accentColor);
    } else {
      // Fallback to image-based PDF for other templates
      if (cvPreviewRef.current) {
        html2canvas(cvPreviewRef.current, {
          scale: 2,
          useCORS: true,
        }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${resume.fullName || "resume"}-cv.pdf`);
        });
      }
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", height: "100vh", background: "#343a40" }}>
        {/* Sidebar skeleton */}
        <div
          style={{
            width: "450px",
            padding: "24px",
            background: "#414042",
            overflowY: "auto",
          }}
        >
          <div className="skeleton-line" style={{ width: "80%", height: 32, margin: "0 auto 32px auto", borderRadius: 8 }}></div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}>
            {[1,2,3,4].map(idx => (
              <div key={idx} style={{ background: "#fff", borderRadius: 12, padding: 16, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", border: "2px solid #eee" }}>
                <div className="skeleton-line" style={{ width: 120, height: 160, borderRadius: 8, marginBottom: 16 }}></div>
                <div className="skeleton-line" style={{ width: 60, height: 18, borderRadius: 6 }}></div>
              </div>
            ))}
          </div>
        </div>
        {/* Preview skeleton */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 12, width: 800, minHeight: 1000, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: 32 }}>
              <div className="skeleton-line" style={{ width: "60%", height: 36, marginBottom: 32, borderRadius: 8 }}></div>
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="skeleton-line" style={{ width: `${80 - idx*5}%`, height: 20, marginBottom: 18, borderRadius: 6 }}></div>
              ))}
            </div>
          </div>
          {/* Bottom bar skeleton */}
          <div style={{ height: 64, background: "#414042", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 32px" }}>
            <div className="skeleton-line" style={{ width: 160, height: 36, borderRadius: 8 }}></div>
          </div>
        </div>
        <style jsx>{`
          .skeleton-line {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
            background-size: 400% 100%;
            animation: skeleton-loading 1.4s ease infinite;
            border-radius: 6px;
          }
          @keyframes skeleton-loading {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
          }
        `}</style>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#343a40",
      }}
    >
      {/* Sidebar for template selection */}
      <div
        style={{
          width: "450px",
          padding: "24px",
          background: "#414042",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            marginBottom: 24,
            textAlign: "center",
            fontWeight: "bold",
            color: "#FFFFFF",
          }}
        >
          JobFinder CV template
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {templates.map((t) => {
            const isSelected = t.id === selected;
            return (
              <div
                key={t.id}
                style={{
                  padding: 8,
                  background: "#fff",
                  cursor: "pointer",
                  position: "relative",
                  textAlign: "center",
                  borderRadius: 12,
                  border: isSelected ? "3px solid #28a745" : "1px solid #ddd",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(40, 167, 69, 0.4)"
                    : "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => setSelected(t.id)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #eee",
                    }}
                  />
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(40, 167, 69, 0.6)",
                        borderRadius: 8,
                      }}
                    >
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600, marginTop: 12, fontSize: 16 }}>
                  {t.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content: Preview and Controls */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* CV Preview Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#e9ecef",
          }}
        >
          <div ref={cvPreviewRef}>
            <CVPreview
              template={template}
              resume={resume}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            background: "#414042",
            color: "white",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Color:</span>
            <div style={{ display: "flex", gap: "10px" }}>
              {(template.colorOptions || [accentColor]).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setAccentColor(color);
                    setColorManuallyChanged(true);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border:
                      accentColor === color
                        ? "3px solid white"
                        : "3px solid transparent",
                    cursor: "pointer",
                    transition: "border 0.2s",
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleDownload}
            style={{
              background: "#0c55ba",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "12px 28px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Download CV
          </button>
        </div>
      </div>
    </div>
  );
}
