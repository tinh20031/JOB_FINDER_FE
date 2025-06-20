import React, { useState, useEffect } from "react";
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/services/useResumeData";

const SoftSkillsModal = ({ open, onClose, initialSkills }) => {
  const [groupName, setGroupName] = useState("Soft Skills");
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSkills) {
      setGroupName(initialSkills[0]?.groupName || "Soft Skills");
      setSkills(initialSkills);
    } else {
      setGroupName("Soft Skills");
      setSkills([]);
    }
  }, [initialSkills, open]);

  if (!open) return null;

  const handleAddSkill = () => {
    if (!currentSkill.trim()) return;
    if (skills.length >= 20) {
      alert("You can add a maximum of 20 skills.");
      return;
    }
    setSkills([
      ...skills,
      {
        skillId: `new_${Date.now()}`,
        skillName: currentSkill.trim(),
        experience: null,
        groupName: groupName,
        type: 1, // Soft skill
      },
    ]);
    setCurrentSkill("");
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(skills.filter((s) => s.skillId !== skillId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const initialSkillIds = initialSkills
        ? initialSkills.map((s) => s.skillId)
        : [];
      const currentSkillIds = skills.map((s) => s.skillId);

      // Skills to delete
      const skillsToDelete = initialSkills
        ? initialSkills.filter((s) => !currentSkillIds.includes(s.skillId))
        : [];

      // Skills to add
      const skillsToAdd = skills.filter((s) =>
        String(s.skillId).startsWith("new_")
      );

      // Skills to update (only groupName can be updated for the whole group)
      const skillsToUpdate = skills.filter((s) => {
        if (String(s.skillId).startsWith("new_")) return false;
        const initial = initialSkills.find((i) => i.skillId === s.skillId);
        return initial && initial.groupName !== s.groupName;
      });

      await Promise.all([
        ...skillsToDelete.map((s) => deleteSkill(s.skillId)),
        ...skillsToAdd.map((s) =>
          createSkill({ ...s, groupName, skillId: 0, experience: "" })
        ),
        ...skillsToUpdate.map((s) =>
          updateSkill(s.skillId, { ...s, groupName, experience: "" })
        ),
      ]);

      onClose();
    } catch (e) {
      alert("An error occurred while saving.");
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="modal-overlay-animated" style={{ zIndex: 1001 }}>
        <div className="modal-content-animated" style={{ maxWidth: "800px" }}>
          <button onClick={onClose} className="modal-close-btn">
            ×
          </button>
          <h2 className="modal-title">Soft Skills</h2>

          <div className="modal-tip">
            📝 Tips: Highlight soft skills that demonstrate how you add value
            beyond professional abilities.
          </div>

          <div className="form-group">
            <label>Group name *</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>List skills ({skills.length}/20)</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Enter skill"
                style={{ flex: 1 }}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
              />
              <button
                onClick={handleAddSkill}
                className="theme-btn btn-style-one"
                style={{ padding: "10px 20px" }}
              >
                +
              </button>
            </div>
          </div>

          <div
            className="skills-list"
            style={{
              minHeight: "100px",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px",
              marginTop: "10px",
            }}
          >
            {skills.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#888",
                  padding: "30px 0",
                }}
              >
                No items selected
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {skills.map((s) => (
                  <li key={s.skillId} className="soft-skill-item">
                    <span>{s.skillName}</span>
                    <button onClick={() => handleRemoveSkill(s.skillId)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="theme-btn btn-style-three"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="theme-btn btn-style-one"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .modal-overlay-animated { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
        .modal-content-animated { background: #fff; padding: 24px; border-radius: 8px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; }
        .modal-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .modal-tip { background: #fefbec; border: 1px solid #fde488; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .soft-skill-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f0f0f0; }
        .soft-skill-item button { background: none; border: none; cursor: pointer; color: #888; font-size: 18px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      `}</style>
    </>
  );
};

export default SoftSkillsModal;
