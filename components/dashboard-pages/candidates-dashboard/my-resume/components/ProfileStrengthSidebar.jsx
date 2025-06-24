import React, { useEffect, useState, useRef } from "react";
import { fetchProfileStrength } from "../../../../../services/useResumeData";
import { useSelector } from "react-redux";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useRouter } from "next/navigation";

const ProfileStrengthSidebar = ({
  onClickEducation,
  onClickSkills,
  onClickAboutMe,
  onClickWorkExp,
  onClickHighlightProject,
  onClickCertificate,
  onClickAwards,
  onClickForeignLang,
  onPreviewDownloadCV,
}) => {
  const [strength, setStrength] = useState({
    percentage: 0,
    missingFields: [],
  });
  const [showAll, setShowAll] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const ulRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const router = useRouter();

  // Helper to normalize and map field names to handlers
  const getHandler = (field) => {
    const normalized = field.trim().toLowerCase().replace(/s$/, "");
    if (normalized === "education") return onClickEducation;
    if (normalized === "skill") return onClickSkills;
    if (normalized === "about me") return onClickAboutMe;
    if (normalized === "work experience") return onClickWorkExp;
    if (normalized === "highlight project") return onClickHighlightProject;
    if (normalized === "certificate") return onClickCertificate;
    if (normalized === "award") return onClickAwards;
    if (normalized === "foreign language" || normalized === "foregin language")
      return onClickForeignLang;
    return undefined;
  };

  useEffect(() => {
    const getStrength = async () => {
      try {
        const data = await fetchProfileStrength(token);
        setStrength(data);
      } catch (err) {
        // handle error
      }
    };
    getStrength();
  }, [token]);

  useEffect(() => {
    if (ulRef.current) {
      setListHeight(ulRef.current.scrollHeight);
    }
  }, [strength.missingFields, showAll]);

  // Filter out empty and duplicate fields
  const filteredFields = strength.missingFields.filter(
    (f, i, arr) => !!f && f.trim() !== "" && arr.indexOf(f) === i
  );

  // Hàm xử lý chuyển trang
  const handlePreviewDownloadCV = () => {
    if (typeof onPreviewDownloadCV === "function") {
      onPreviewDownloadCV();
    } else {
      router.push("/candidates-dashboard/cv-templates");
    }
  };

  return (
    <div className="sidebar-inner">
      <div
        className="skills-percentage"
        style={{ textAlign: "center", marginTop: 32 }}
      >
        <h4
          style={{
            fontWeight: 500,
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
            color: "#202124",
          }}
        >
          Profile Strength
        </h4>
        <div style={{ width: 180, height: 180, margin: "0 auto 18px auto" }}>
          <CircularProgressbar
            value={strength.percentage}
            text={`${strength.percentage}%`}
            background
            backgroundPadding={6}
            styles={buildStyles({
              backgroundColor: "#7367F0",
              textColor: "#fff",
              pathColor: "#fff",
              trailColor: "transparent",
              textSize: "22px",
            })}
          />
        </div>
        {/* Thông báo theo phần trăm hoàn thành - style giống mẫu */}
        <div
          style={{
            position: "relative",
            width: "fit-content",
            margin: "0 auto 18px auto",
            maxWidth: 260,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "2px solid #222",
              borderRadius: 10,
              padding: "10px 14px",
              minWidth: 180,
              maxWidth: 260,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              fontSize: 14,
              color: "#222",
              fontWeight: 400,
              position: "relative",
              zIndex: 2,
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {strength.percentage < 70 ? (
              <>
                Complete profile to{" "}
                <span style={{ color: "#e60023", fontWeight: 700 }}>70%</span>{" "}
                to
                <br />
                generate CV template for IT professionals.
              </>
            ) : (
              <>
                Congratulations! You are ready to generate your CV. Continue to
                complete your profile for an attractive CV.
              </>
            )}
            {/* Mũi tên tam giác nhỏ */}
            <span
              style={{
                position: "absolute",
                right: -12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderLeft: "12px solid #222",
                zIndex: 3,
              }}
            />
            <span
              style={{
                position: "absolute",
                right: -11,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "11px solid #fff",
                zIndex: 4,
              }}
            />
          </div>
          {/* Icon robot ngoài khung nhỏ lại */}
          <div
            style={{
              position: "absolute",
              right: -34,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
            }}
          >
            <img
              src="https://itviec.com/assets/robby/robby-welcome-88a1fef0ec2128f54ffb2a0c49dfaebccf1a839062f13ede6178846644afd639.svg"
              alt="robot"
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                background: "#fff",
                borderRadius: "50%",
                border: "2px solid #222",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </div>
        </div>
        {/* End thông báo */}
        {strength.missingFields.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: 14,
                marginBottom: 6,
                color: "#e60023",
                fontWeight: 600,
              }}
            ></div>
            <div
              style={{
                overflow: "hidden",
                transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                maxHeight: showAll ? listHeight : 90,
              }}
            >
              <ul
                ref={ulRef}
                style={{
                  paddingLeft: 0,
                  listStyle: "none",
                  fontSize: 13,
                  color: "#888",
                  textAlign: "left",
                  display: "inline-block",
                  marginBottom: 0,
                }}
              >
                {(showAll ? filteredFields : filteredFields.slice(0, 3)).map(
                  (field) => (
                    <li
                      key={field}
                      style={{
                        marginBottom: 4,
                        cursor: getHandler(field) ? "pointer" : "default",
                        textDecoration: getHandler(field)
                          ? "underline"
                          : undefined,
                      }}
                      onClick={
                        getHandler(field)
                          ? () => getHandler(field)()
                          : undefined
                      }
                    >
                      <span style={{ color: "#e60023", marginRight: 6 }}>
                        •
                      </span>
                      {field}
                    </li>
                  )
                )}
              </ul>
            </div>
            {strength.missingFields.length > 3 && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7367F0",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: 0,
                    outline: "none",
                    textDecoration: "underline",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    margin: "0 auto",
                  }}
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show less" : "Add more information"}
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 0.3s",
                    }}
                  >
                    {showAll ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7367F0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7367F0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
        {/* Nút Preview & Download CV */}
        {strength.percentage >= 70 && (
          <a
            href="/candidates-dashboard/cv-templates"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%",
              margin: "8px auto 0 auto",
              display: "block",
              background: "#7367F0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(115,103,240,0.08)",
              transition: "background 0.2s",
              textAlign: "center",
              textDecoration: "none"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#5e50ee"}
            onMouseOut={e => e.currentTarget.style.background = "#7367F0"}
          >
            Preview & Download CV
          </a>
        )}
      </div>
    </div>
  );
};

ProfileStrengthSidebar.defaultProps = {
  onClickEducation: undefined,
  onClickSkills: undefined,
  onClickAboutMe: undefined,
  onClickWorkExp: undefined,
  onClickHighlightProject: undefined,
  onClickCertificate: undefined,
  onClickAwards: undefined,
  onClickForeignLang: undefined,
  onPreviewDownloadCV: undefined,
};

export default ProfileStrengthSidebar;
