import React from "react";

const ProfileCard = ({ profile }) => {
  if (!profile) return null;
  return (
    <div className="profile-card" style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={profile.image}
          alt="avatar"
          style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 16 }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{profile.fullName || 'Your name'}</h2>
          <div style={{ color: '#888' }}>{profile.jobTitle || 'Update your title'}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div><i className="fa fa-envelope" /> {profile.email}</div>
        <div><i className="fa fa-phone" /> {profile.phone || 'Your phone number'}</div>
        <div><i className="fa fa-birthday-cake" /> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Your date of birth'}</div>
        <div><i className="fa fa-venus-mars" /> {profile.gender || 'Your gender'}</div>
        <div><i className="fa fa-map-marker" /> {profile.address || 'Your current address'}</div>
        <div><i className="fa fa-map" /> {profile.province || ''} {profile.city || ''}</div>
        <div><i className="fa fa-link" /> {profile.personalLink || 'Your personal link'}</div>
      </div>
    </div>
  );
};

export default ProfileCard;
