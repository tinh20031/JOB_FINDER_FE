import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  createForeignLanguage,
  updateForeignLanguage,
  deleteForeignLanguage,
} from "@/services/useResumeData";
import { toast } from "react-toastify";

const languageOptions = [
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "English", label: "English" },
  { value: "Japanese", label: "Japanese" },
  { value: "French", label: "French" },
  { value: "Korean", label: "Korean" },
  { value: "Chinese", label: "Chinese" },
  { value: "German", label: "German" },
  { value: "Spanish", label: "Spanish" },
  { value: "Russian", label: "Russian" },
];
const levelOptions = [
  { value: "Basic", label: "Basic" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Fluent", label: "Fluent" },
];

const ForeignLanguageModal = ({ open, onClose, initialLanguages, refetch }) => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setLanguages(initialLanguages || []);
      setSelectedLanguage(null);
      setSelectedLevel(null);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [initialLanguages, open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!open && !show) return null;

  const handleAdd = () => {
    if (!selectedLanguage || !selectedLevel) {
      toast.warn("Please select a language and proficiency level.");
      return;
    }
    if (languages.length >= 5) {
      toast.warn("You can add up to 5 languages only.");
      return;
    }
    if (languages.find((l) => l.languageName === selectedLanguage.value)) {
      toast.warn("This language has already been added.");
      return;
    }
    setLanguages([
      ...languages,
      {
        foreignLanguageId: `new_${Date.now()}`,
        languageName: selectedLanguage.value,
        languageLevel: selectedLevel.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: true, // For animation
      },
    ]);
    setSelectedLanguage(null);
    setSelectedLevel(null);
  };

  const handleRemove = (id) => {
    setLanguages(languages.filter((l) => l.foreignLanguageId !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Tách mới/cũ
      const initialIds = initialLanguages
        ? initialLanguages.map((l) => l.foreignLanguageId)
        : [];
      const currentIds = languages.map((l) => l.foreignLanguageId);
      const toDelete = initialLanguages
        ? initialLanguages.filter(
            (l) => !currentIds.includes(l.foreignLanguageId)
          )
        : [];
      const toAdd = languages.filter((l) =>
        String(l.foreignLanguageId).startsWith("new_")
      );
      const toUpdate = languages.filter((l) => {
        if (String(l.foreignLanguageId).startsWith("new_")) return false;
        const old = initialLanguages.find(
          (i) => i.foreignLanguageId === l.foreignLanguageId
        );
        return (
          old &&
          (old.languageLevel !== l.languageLevel ||
            old.languageName !== l.languageName)
        );
      });
      await Promise.all([
        ...toDelete.map((l) => deleteForeignLanguage(l.foreignLanguageId)),
        ...toAdd.map((l) =>
          createForeignLanguage({ ...l, foreignLanguageId: 0 })
        ),
        ...toUpdate.map((l) => updateForeignLanguage(l.foreignLanguageId, l)),
      ]);
      toast.success("Languages updated successfully!");
      if (typeof refetch === "function") {
        await refetch();
      }
      handleClose();
    } catch (e) {
      toast.error("An error occurred while saving.");
      console.error(e);
    }
    setSaving(false);
  };

  // Lọc ngôn ngữ chưa được chọn
  const filteredLanguageOptions = languageOptions.filter(
    (opt) => !languages.some((l) => l.languageName === opt.value)
  );

  return (
    <>
      <div
        className="modal-overlay-animated"
        style={{ zIndex: 1001, opacity: show ? 1 : 0 }}
      >
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
          <h2 className="modal-title">Foreign Language</h2>
          <div className="form-group">
            <label>List languages ({languages.length}/5)</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: 25 }}>
              <Select
                options={filteredLanguageOptions}
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                placeholder="Search language"
                isClearable
                styles={{ container: (base) => ({ ...base, flex: 1 }) }}
              />
              <Select
                options={levelOptions}
                value={selectedLevel}
                onChange={setSelectedLevel}
                placeholder="Select level"
                isClearable
                styles={{ container: (base) => ({ ...base, flex: 1 }) }}
              />
              <button
                onClick={handleAdd}
                className="theme-btn btn-style-one"
                style={{ padding: "10px 20px" }}
              >
                +
              </button>
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
              {languages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "50px 0",
                  }}
                >
                  No items selected
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {languages.map((l) => (
                    <span
                      key={l.foreignLanguageId}
                      className={`skill-tag ${l.isNew ? "new" : ""}`}
                    >
                      <b>{l.languageName}</b> (
                      <span style={{ color: "#555" }}>{l.languageLevel}</span>)
                      <button onClick={() => handleRemove(l.foreignLanguageId)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
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
        .modal-overlay-animated { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: opacity 0.3s; pointer-events: ${
          show ? "auto" : "none"
        }; }
        .modal-content-animated { background: #fff; padding: 24px; border-radius: 8px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; transition: all 0.3s; }
        .modal-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .skill-tag { 
          display: inline-flex; align-items: center; gap: 8px;
          background: #f0f0f0; color: #333; border-radius: 16px;
          padding: 8px 14px; font-size: 15px;
          transition: all 0.3s; animation: fadeIn 0.4s;
        }
        .skill-tag.new { animation: fadeIn 0.4s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .skill-tag button { 
          background: #d0d0d0; color: #fff; border: none;
          border-radius: 50%; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; font-size: 14px; line-height: 1;
        }
        .skill-tag button:hover { background: #bb0c24; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      `}</style>
    </>
  );
};

export default ForeignLanguageModal;
