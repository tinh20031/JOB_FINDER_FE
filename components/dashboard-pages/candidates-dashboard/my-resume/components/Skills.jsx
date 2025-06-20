import React, { useState, useMemo } from "react";
import CoreSkillsModal from "./CoreSkillsModal";
import SoftSkillsModal from "./SoftSkillsModal";
import { deleteSkill } from "@/services/useResumeData";

const Skills = ({ skills: initialSkills = [] }) => {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [modalType, setModalType] = useState(null); // 'core' or 'soft'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSoftSkillTooltip, setShowSoftSkillTooltip] = useState(false);

  // Group by unique group (groupName + min skillId)
  const groups = useMemo(() => {
    // Sort skills by createdAt or skillId to keep order
    const sorted = [...initialSkills].sort((a, b) => {
      if (a.type !== b.type) return a.type - b.type;
      if (a.createdAt && b.createdAt)
        return new Date(a.createdAt) - new Date(b.createdAt);
      return a.skillId - b.skillId;
    });
    // Group all soft skills (type 1) into one group
    const softSkills = sorted.filter((s) => s.type === 1);
    const coreSkills = sorted.filter((s) => s.type === 0);
    const result = [];
    // Group core skills by groupKey
    let used = new Set();
    for (let i = 0; i < coreSkills.length; ++i) {
      const s = coreSkills[i];
      if (used.has(s.skillId)) continue;
      const key = s.groupKey || s.createdAt || s.groupName + "_" + s.skillId;
      let group = [s];
      used.add(s.skillId);
      for (let j = i + 1; j < coreSkills.length; ++j) {
        const t = coreSkills[j];
        const tKey = t.groupKey || t.createdAt || t.groupName + "_" + t.skillId;
        if (tKey === key) {
          group.push(t);
          used.add(t.skillId);
        }
      }
      result.push({
        groupName: s.groupName,
        type: 0,
        skills: group,
        groupKey: key,
        createdAt: s.createdAt,
      });
    }
    // Add all soft skills as one group (if any)
    if (softSkills.length > 0) {
      result.push({
        groupName: softSkills[0].groupName || "Soft Skills",
        type: 1,
        skills: softSkills,
        groupKey: "soft-skills-group",
        createdAt: softSkills[0].createdAt,
      });
    }
    return result;
  }, [initialSkills]);

  const hasSoftSkillsGroup = useMemo(
    () => groups.some((g) => g.type === 1),
    [groups]
  );

  const handleOpenModal = (type, groupKey = null) => {
    let group = null;
    if (groupKey) {
      group = groups.find((g) => g.groupKey === groupKey);
    }
    setModalType(type);
    setSelectedGroup(group ? group.skills : null);
    setShowAddGroup(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedGroup(null);
    setModalOpen(false);
    window.location.reload();
  };

  const handleDeleteGroup = async (groupKey) => {
    if (
      window.confirm(
        `Are you sure you want to delete this group and all its skills?`
      )
    ) {
      try {
        const group = groups.find((g) => g.groupKey === groupKey);
        await Promise.all(group.skills.map((s) => deleteSkill(s.skillId)));
        window.location.reload();
      } catch (e) {
        alert("Failed to delete skill group.");
      }
    }
  };

  return (
    <div className="resume-outer">
      <div className="upper-title">
        <h4>Skills</h4>
        <div style={{ position: "relative" }}>
          <button
            className="add-info-btn"
            onClick={() => setShowAddGroup((p) => !p)}
          >
            <span className="icon flaticon-plus"></span>
          </button>
          {showAddGroup && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 10,
                width: "220px",
                padding: "8px",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  fontWeight: "600",
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                Add group:
              </div>
              <button
                onClick={() => handleOpenModal("core")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 12px",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                + Core skills
              </button>
              <div
                style={{
                  padding: "8px 12px",
                  color: hasSoftSkillsGroup ? "#aaa" : "inherit",
                  cursor: hasSoftSkillsGroup ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  position: "relative",
                }}
                onClick={() => !hasSoftSkillsGroup && handleOpenModal("soft")}
                onMouseEnter={() =>
                  hasSoftSkillsGroup && setShowSoftSkillTooltip(true)
                }
                onMouseLeave={() => setShowSoftSkillTooltip(false)}
              >
                + Soft skills
                {hasSoftSkillsGroup && (
                  <span className="la la-info-circle"></span>
                )}
                {showSoftSkillTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "20px",
                      background: "#333",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      zIndex: 20,
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                    }}
                  >
                    Maximum of 1 soft skills group
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        marginLeft: "-6px",
                        borderWidth: "6px",
                        borderStyle: "solid",
                        borderColor: "#333 transparent transparent transparent",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {groups.length === 0 && (
        <div style={{ color: "#888", padding: "16px 0" }}>
          Showcase your skills and proficiencies
        </div>
      )}

      {groups.map(({ groupName, type, skills, groupKey, createdAt }) => (
        <div
          className="resume-block"
          key={groupKey || createdAt}
          style={{ borderTop: "1px solid #eee", paddingTop: "16px" }}
        >
          <div className="upper-title" style={{ marginBottom: "12px" }}>
            <h5 style={{ fontWeight: 600 }}>{groupName}</h5>
            <div className="edit-btns">
              <button
                onClick={() =>
                  handleOpenModal(
                    type === 0 ? "core" : "soft",
                    groupKey || createdAt
                  )
                }
              >
                <span
                  className="la la-pencil"
                  style={{ color: "#e60023" }}
                ></span>
              </button>
              <button onClick={() => handleDeleteGroup(groupKey || createdAt)}>
                <span className="la la-trash"></span>
              </button>
            </div>
          </div>
          <div className="inner" style={{ padding: 0 }}>
            {type === 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {skills.map((s) => (
                  <span
                    key={s.skillId}
                    style={{
                      background: "#f0f0f0",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      fontSize: "14px",
                    }}
                  >
                    {s.skillName} ({s.experience})
                  </span>
                ))}
              </div>
            ) : (
              <ul style={{ listStyle: "disc", paddingLeft: "20px" }}>
                {skills.map((s) => (
                  <li key={s.skillId} style={{ marginBottom: "4px" }}>
                    {s.skillName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}

      {modalType === "core" && modalOpen && (
        <CoreSkillsModal
          open={modalOpen}
          onClose={handleCloseModal}
          initialSkills={selectedGroup}
        />
      )}
      {modalType === "soft" && modalOpen && (
        <SoftSkillsModal
          open={modalOpen}
          onClose={handleCloseModal}
          initialSkills={selectedGroup}
        />
      )}
    </div>
  );
};

export default Skills;
