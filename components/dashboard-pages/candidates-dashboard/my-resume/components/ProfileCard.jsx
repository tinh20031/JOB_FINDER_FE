import React from "react";

const ProfileCard = ({ profile, onEdit }) => {
  if (!profile) return null;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        position: "relative",
        minHeight: 120,
      }}
    >
      <button
        onClick={onEdit}
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          background: "none",
          border: "none",
          color: "#e60023",
          fontSize: 28,
          cursor: "pointer",
          padding: 0,
        }}
        title="Edit"
      >
        <span className="la la-pencil"></span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <img
          src={profile.image}
          alt="avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 2px 8px #0001",
            border: "3px solid #eee",
          }}
        />
        <div>
          <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 2 }}>
            {profile.fullName || "Your name"}
          </div>
          <div
            style={{
              color: "#e60023",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            {profile.jobTitle || "Update your title"}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              color: "#444",
              fontSize: 16,
            }}
          >
            <div>
              <i
                className="fa fa-envelope"
                style={{ color: "#007bff", marginRight: 6 }}
              />
              {profile.email}
            </div>
            <div>
              <i
                className="fa fa-phone"
                style={{ color: "#28a745", marginRight: 6 }}
              />
              {profile.phone || "Your phone number"}
            </div>
            <div>
              <i
                className="fa fa-birthday-cake"
                style={{ color: "#ffc107", marginRight: 6 }}
              />
              {profile.dob
                ? new Date(profile.dob).toLocaleDateString()
                : "Your date of birth"}
            </div>
            <div>
              <i
                className="fa fa-venus-mars"
                style={{ color: "#6f42c1", marginRight: 6 }}
              />
              {profile.gender || "Your gender"}
            </div>
            <div>
              <i
                className="fa fa-map-marker"
                style={{ color: "#e60023", marginRight: 6 }}
              />
              {profile.address || "Your current address"}
            </div>
            <div>
              <i
                className="fa fa-map"
                style={{ color: "#17a2b8", marginRight: 6 }}
              />
              {profile.province || ""} {profile.city || ""}
            </div>
            <div>
              <i
                className="fa fa-link"
                style={{ color: "#343a40", marginRight: 6 }}
              />
              {profile.personalLink || "Your personal link"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
