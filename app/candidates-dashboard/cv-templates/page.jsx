"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";

// Mockup các template CV
const templates = [
  {
    id: "classic",
    name: "Classic",
    img: "https://itviec.com/assets/cv-templates/classic.png",
  },
  {
    id: "elegant",
    name: "Elegant",
    img: "https://itviec.com/assets/cv-templates/elegant.png",
  },
  {
    id: "modern",
    name: "Modern",
    img: "https://itviec.com/assets/cv-templates/modern.png",
  },
];

// Component preview template (mockup)
function CVPreview({ template, resume }) {
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
      <div style={{ marginTop: 24 }}>
        <button
          style={{
            background: "#7367F0",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Download CV
        </button>
      </div>
    </div>
  );
}

export default function CVTemplatesPage() {
  const [selected, setSelected] = useState(templates[0].id);
  // Lấy dữ liệu resume từ redux (giả sử lưu ở state.candidate.resume)
  const resume = useSelector((state) => state.candidate?.resume);
  const template = templates.find((t) => t.id === selected);

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        padding: 32,
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      {/* Danh sách template */}
      <div style={{ minWidth: 260 }}>
        <h3>Choose your CV template</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                border:
                  t.id === selected ? "2px solid #7367F0" : "1px solid #ccc",
                borderRadius: 8,
                padding: 10,
                background: "#fff",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => setSelected(t.id)}
            >
              <img
                src={t.img}
                alt={t.name}
                style={{ width: 120, borderRadius: 6 }}
              />
              <div style={{ fontWeight: 600, marginTop: 8 }}>{t.name}</div>
              {t.id === selected && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#7367F0",
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Preview template */}
      <div style={{ flex: 1 }}>
        <CVPreview template={template} resume={resume} />
      </div>
    </div>
  );
}
