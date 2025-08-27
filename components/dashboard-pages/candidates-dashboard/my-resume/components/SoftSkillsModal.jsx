import React, { useState, useEffect } from "react";
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const SoftSkillsModal = ({ open, onClose, initialSkills }) => {
  const [groupName, setGroupName] = useState("Soft Skills");
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialSkills) {
        setGroupName(initialSkills[0]?.groupName || "Soft Skills");
        setSkills(initialSkills);
      } else {
        setGroupName("Soft Skills");
        setSkills([]);
      }
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [initialSkills, open]);

  if (!open && !show) return null;

  const handleAddSkill = () => {
    if (!currentSkill.trim()) return;
    if (skills.length >= 20) {
      toast.warn("You can add a maximum of 20 skills.");
      return;
    }
    const newSkill = {
      skillId: `new_${Date.now()}`,
      skillName: currentSkill.trim(),
      experience: null,
      groupName: groupName,
      type: 1, // Soft skill
      isNew: true, // For animation
    };
    setSkills([...skills, newSkill]);
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
        skillsToAdd.length > 0
          ? createSkill(
              skillsToAdd.map((s) => ({
                ...s,
                groupName,
                skillId: 0,
                experience: "",
              }))
            )
          : null,
        ...skillsToUpdate.map((s) =>
          updateSkill(s.skillId, { ...s, groupName, experience: "" })
        ),
      ].filter(Boolean));

      toast.success("Skills updated successfully!");
      handleClose();
    } catch (e) {
      toast.error("An error occurred while saving.");
      console.error(e);
    }
    setSaving(false);
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div className="modal-overlay-animated" style={{ opacity: show ? 1 : 0 }}>
        <div
          className="modal-content-animated"
          style={{
            maxWidth: "800px",
            transform: show ? "scale(1)" : "scale(0.95)",
            opacity: show ? 1 : 0,
          }}
        >
          <button onClick={handleClose} className="modal-close-btn">
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
              onClick={handleClose}
              style={{ background: '#fff', border: '1.5px solid #e60023', color: '#e60023', padding: '12px 36px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{ background: '#e60023', color: '#fff', border: 'none', padding: '12px 36px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .modal-overlay-animated { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: opacity 0.3s; pointer-events: ${
          show ? "auto" : "none"
        }; z-index: 1001; }
        .modal-content-animated { background: #fff; padding: 24px; border-radius: 8px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; transition: all 0.3s; }
        .modal-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .modal-tip { background: #fefbec; border: 1px solid #fde488; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .soft-skill-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f0f0f0; transition: all 0.3s; animation: fadeIn 0.4s; }
        .soft-skill-item.new { animation: fadeIn 0.4s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .soft-skill-item button { background: none; border: none; cursor: pointer; color: #888; font-size: 18px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      `}</style>
    </>
  );
};

export default SoftSkillsModal;
