import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const AboutMeModal = ({ open, onClose, onSubmit, aboutMe }) => {
  const [value, setValue] = useState(aboutMe || "");
  const [show, setShow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setValue(aboutMe || "");
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [aboutMe, open]);

  if (!open && !show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setShow(false);
    setTimeout(() => {
      onSubmit(value);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 300); // match animation
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      <style>{`
        .aboutme-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s;
          opacity: ${show ? 1 : 0};
          pointer-events: ${show ? "auto" : "none"};
        }
        .aboutme-modal-content {
          background: #fff;
          border-radius: 12px;
          min-width: 320px;
          width: 95vw;
          max-width: 700px;
          min-height: 40vh;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 32px 24px 0 24px;
          padding-bottom: 20px;
          position: relative;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ##888 #f5f5f5;
          transform: scale(${show ? 1 : 0.95});
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .aboutme-modal-content::-webkit-scrollbar {
          width: 8px;
        }
        .aboutme-modal-content::-webkit-scrollbar-thumb {
          background: ##888;
          border-radius: 4px;
        }
        .aboutme-modal-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .aboutme-modal-form {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .aboutme-modal-quill .ql-container {
          min-height: 120px;
          font-size: 1.1rem;
          border-radius: 6px;
        }
        .aboutme-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          background: #fff;
          border-top: 1px solid #eee;
          padding: 16px 0 0 0;
          margin-top: 0;
        }
        .aboutme-success {
          position: fixed;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: #28a745;
          color: #fff;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          z-index: 2000;
          box-shadow: 0 2px 12px #0002;
          animation: fadeInOut 2s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @media (max-width: 600px) {
          .aboutme-modal-content {
            padding: 20px 6px 0 6px;
          }
        }
      `}</style>
      {showSuccess && (
        <div className="aboutme-success">Updated successfully</div>
      )}
      <div className="aboutme-modal-overlay">
        <div className="aboutme-modal-content">
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 16,
              right: 24,
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ×
          </button>
          <div className="aboutme-modal-title">About Me</div>
          <form className="aboutme-modal-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>
              <span role="img" aria-label="tips">
                📝
              </span>{" "}
              <span style={{ color: "#ff9800" }}>Tips:</span>{" "}
              <span style={{ color: "#000000" }}>
                Summarize your professional experience, highlight your skills
                and your strengths.
              </span>
            </div>
            <div className="aboutme-modal-quill">
              <ReactQuill
                value={value}
                onChange={setValue}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "list",
                  "bullet",
                  "link",
                ]}
                placeholder="Write something about yourself..."
              />
            </div>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
              {value.replace(/<[^>]+>/g, "").length}/2500 characters
            </div>
            <div className="aboutme-modal-actions">
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "#fff",
                  border: "1px solid #e60023",
                  color: "#e60023",
                  padding: "10px 32px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: "#e60023",
                  color: "#fff",
                  border: "none",
                  padding: "10px 32px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AboutMeModal;
