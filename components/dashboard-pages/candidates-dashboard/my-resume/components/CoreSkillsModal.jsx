import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/services/useResumeData";

// Mock data, replace with API call if available
const initialSkillOptions = [
  { value: ".NET", label: ".NET" },
  { value: "ABAP", label: "ABAP" },
  { value: "Ada", label: "Ada" },
  { value: "Angular", label: "Angular" },
  { value: "React", label: "React" },
  { value: "VueJS", label: "VueJS" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "C++", label: "C++" },
];

const experienceLevels = [
  { value: "< 1 year", label: "< 1 year" },
  { value: "1 year", label: "1 year" },
  { value: "2 years", label: "2 years" },
  { value: "3 years", label: "3 years" },
  { value: "4 years", label: "4 years" },
  { value: "6 years", label: "6 years" },
  { value: "7 years", label: "7 years" },
  { value: "8 years", label: "8 years" },
  { value: "9 years", label: "9 years" },
  { value: "10 years", label: "10 years" },
  { value: "10+ years", label: "10+ years" },
];

const CoreSkillsModal = ({ open, onClose, initialSkills }) => {
  const [groupName, setGroupName] = useState("Core Skills");
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState(initialSkillOptions);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [groupKey, setGroupKey] = useState(null);

  useEffect(() => {
    if (initialSkills && initialSkills.length > 0) {
      setGroupName(initialSkills[0]?.groupName || "Core Skills");
      setSkills(initialSkills);
      setGroupKey(
        initialSkills[0]?.groupKey || initialSkills[0]?.createdAt || null
      );
    } else {
      setGroupName("Core Skills");
      setSkills([]);
      setGroupKey(null);
    }
  }, [initialSkills, open]);

  if (!open) return null;

  const handleCreateSkill = (inputValue) => {
    const newSkill = { value: inputValue, label: inputValue };
    setAvailableSkills((prev) => [...prev, newSkill]);
    setSelectedSkill(newSkill);
  };

  const handleAddSkill = () => {
    if (!selectedSkill || !selectedExperience) {
      alert("Please select a skill and experience level.");
      return;
    }
    if (skills.length >= 20) {
      alert("You can add a maximum of 20 skills.");
      return;
    }
    // Avoid duplicates
    if (skills.find((s) => s.skillName === selectedSkill.value)) {
      alert("This skill has already been added.");
      return;
    }

    setSkills([
      ...skills,
      {
        skillId: `new_${Date.now()}`,
        skillName: selectedSkill.value,
        experience: selectedExperience.value,
        groupName: groupName,
        type: 0,
        groupKey: groupKey || new Date().toISOString(),
        createdAt: groupKey || new Date().toISOString(),
      },
    ]);
    setSelectedSkill(null);
    setSelectedExperience(null);
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(skills.filter((s) => s.skillId !== skillId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Tạo groupKey chung cho tất cả skill trong group
      const key = groupKey || new Date().toISOString();
      const initialSkillIds = initialSkills
        ? initialSkills.map((s) => s.skillId)
        : [];
      const currentSkillIds = skills.map((s) => s.skillId);

      // Skills to delete
      const skillsToDelete = initialSkills
        ? initialSkills.filter((s) => !currentSkillIds.includes(s.skillId))
        : [];

      // Skills to add (have temp IDs)
      const skillsToAdd = skills.filter((s) =>
        String(s.skillId).startsWith("new_")
      );

      // Skills to update
      const skillsToUpdate = skills.filter((s) => {
        if (String(s.skillId).startsWith("new_")) return false;
        const initial = initialSkills.find((i) => i.skillId === s.skillId);
        return (
          initial &&
          (initial.experience !== s.experience ||
            initial.groupName !== s.groupName)
        );
      });

      await Promise.all([
        ...skillsToDelete.map((s) => deleteSkill(s.skillId)),
        ...skillsToAdd.map((s) =>
          createSkill({
            ...s,
            groupName,
            skillId: 0,
            groupKey: key,
            createdAt: key,
          })
        ),
        ...skillsToUpdate.map((s) =>
          updateSkill(s.skillId, {
            ...s,
            groupName,
            groupKey: key,
            createdAt: key,
          })
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
          <h2 className="modal-title">Core Skills</h2>

          <div className="modal-tip">
            📝 Tips: Organize your core skills into groups helps recruiters
            quickly understand your professional capabilities.
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
              <CreatableSelect
                options={availableSkills}
                value={selectedSkill}
                onChange={setSelectedSkill}
                onCreateOption={handleCreateSkill}
                placeholder="Search or add skills"
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                isClearable
                styles={{ container: (base) => ({ ...base, flex: 1 }) }}
              />
              <Select
                options={experienceLevels}
                value={selectedExperience}
                onChange={setSelectedExperience}
                placeholder="Select experience"
                isClearable
                styles={{ container: (base) => ({ ...base, flex: 1 }) }}
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {skills.map((s) => (
                  <span key={s.skillId} className="skill-tag">
                    {s.skillName} ({s.experience})
                    <button onClick={() => handleRemoveSkill(s.skillId)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
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
        .skill-tag { background: #f0f0f0; padding: 6px 12px; border-radius: 16px; display: inline-flex; align-items: center; gap: 8px; }
        .skill-tag button { background: #ccc; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      `}</style>
    </>
  );
};

export default CoreSkillsModal;
