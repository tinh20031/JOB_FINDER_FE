import React from "react";

const ProfileCard = ({ profile, onEdit }) => {
  if (!profile) return null;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 28,
        marginBottom: 32,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        position: "relative",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onEdit}
        style={{
          position: "absolute",
          top: 18,
          right: 24,
          background: "none",
          border: "none",
          color: "#e60023",
          fontSize: 24,
          cursor: "pointer",
          padding: 0,
        }}
        title="Edit"
      >
        <span className="la la-pencil"></span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <img
          src={(() => {
            let src = profile.image || profile.avatar || "/images/resource/candidate-1.png";
            if (
              !src ||
              typeof src !== "string" ||
              src.trim().toLowerCase() === "string" ||
              src.trim() === "" ||
              !(src.startsWith("/") || src.startsWith("http"))
            ) {
              src = "/images/resource/candidate-1.png";
            }
            return src;
          })()}
          alt="avatar"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 2px 8px #0001",
            border: "2.5px solid #eee",
            marginRight: 18,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 30,
              marginBottom: 2,
              color: !profile.fullName ? "#e60023" : undefined,
            }}
          >
            {profile.fullName || "Your name"}
            {!profile.fullName && (
              <span
                style={{ marginLeft: 8, fontSize: 16, color: "#e60023" }}
                title="Required"
              >
                ⚠️
              </span>
            )}
          </div>
          <div
            style={{
              color: "#666",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 18,
            }}
          >
            {profile.jobTitle || "Update your job title"}
            {!profile.jobTitle && (
              <span
                style={{ marginLeft: 8, fontSize: 16, color: "#e60023" }}
                title="Required"
              >
                ⚠️
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Column 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-envelope"
                  style={{ color: "#007bff", marginRight: 8 }}
                />
                {profile.email}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-birthday-cake"
                  style={{ color: "#ffc107", marginRight: 8 }}
                />
                {profile.dob ? (
                  (() => {
                    const d = new Date(profile.dob);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  })()
                ) : (
                  <span style={{ color: "#e60023" }}>
                    Your date of birth <span title="Required">⚠️</span>
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-map-marker"
                  style={{ color: "#e60023", marginRight: 8 }}
                />
                {[profile.address, profile.city, profile.province]
                  .filter(Boolean)
                  .join(", ") || "Province/City"}
              </div>
            </div>
            {/* Column 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-phone"
                  style={{ color: "#28a745", marginRight: 8 }}
                />
                {profile.phone || "Your phone number"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-venus-mars"
                  style={{ color: "#6f42c1", marginRight: 8 }}
                />
                {profile.gender || "Your gender"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#444",
                  fontSize: 16,
                }}
              >
                <i
                  className="la la-link"
                  style={{ color: "#343a40", marginRight: 8 }}
                />
                {profile.personalLink ? (
                  <a
                    href={
                      profile.personalLink.startsWith("http")
                        ? profile.personalLink
                        : `https://${profile.personalLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#1967d2",
                      textDecoration: "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {profile.personalLink}
                  </a>
                ) : (
                  "Your personal link"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
