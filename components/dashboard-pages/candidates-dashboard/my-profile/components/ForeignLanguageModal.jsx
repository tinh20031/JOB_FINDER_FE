import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createForeignLanguage, updateForeignLanguage, deleteForeignLanguage } from "@/services/useResumeData";
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
  const [groupName, setGroupName] = useState("Foreign Languages");
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialLanguages && initialLanguages.length > 0) {
        setGroupName(initialLanguages[0]?.groupName || "Foreign Languages");
        setLanguages(initialLanguages);
      } else {
        setGroupName("Foreign Languages");
        setLanguages([]);
      }
      setSelectedLanguage(null);
      setSelectedLevel(null);
      setPendingLanguage(null);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [initialLanguages, open]);

  useEffect(() => {
    if (selectedLanguage && selectedLevel) {
      if (languages.find((l) => l.languageName === selectedLanguage.value)) {
        setPendingLanguage(null);
        return;
      }
      setPendingLanguage({
        foreignLanguageId: `pending_${Date.now()}`,
        languageName: selectedLanguage.value,
        languageLevel: selectedLevel.value,
        groupName: groupName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPending: true,
      });
    } else {
      setPendingLanguage(null);
    }
  }, [selectedLanguage, selectedLevel, groupName, languages]);

  const handleAddLanguage = () => {
    if (!selectedLanguage || !selectedLevel) {
      toast.warn("Please select a language and proficiency level.");
      return;
    }
    if (languages.length >= 10) {
      toast.warn("You can add up to 10 languages only.");
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
        groupName: groupName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: true,
      },
    ]);
    setSelectedLanguage(null);
    setSelectedLevel(null);
    setPendingLanguage(null);
  };

  const handleRemoveLanguage = (id, languageName, languageLevel) => {
    setLanguages(languages.filter((l) => {
      if (id && l.foreignLanguageId) {
        return l.foreignLanguageId !== id;
      }
      // fallback: remove by languageName-languageLevel if id is missing
      return !(l.languageName === languageName && l.languageLevel === languageLevel);
    }));
  };

  // Helper: get backend id from a language object
  const getBackendId = (lang) => {
    // Support both Id and foreignLanguageId (for legacy or new data)
    return lang.Id || lang.foreignLanguageId || lang.id;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let languagesToSave = [...languages];
      if (pendingLanguage) {
        if (languages.length >= 10) {
          toast.warn("You can add up to 10 languages only.");
        } else {
          languagesToSave.push({
            ...pendingLanguage,
            foreignLanguageId: `new_${Date.now()}`,
            isPending: false,
          });
        }
      }
      // Fix: Identify deleted languages by id or by (languageName + languageLevel)
      const toDelete = initialLanguages
        ? initialLanguages.filter(
            (l) =>
              !languagesToSave.some(
                (cur) =>
                  (getBackendId(cur) && getBackendId(l) && getBackendId(cur) == getBackendId(l)) ||
                  (l.languageName === cur.languageName && l.languageLevel === cur.languageLevel)
              )
          )
        : [];
      const toAdd = languagesToSave.filter((l) => String(getBackendId(l)).startsWith("new_") || !getBackendId(l));
      const toUpdate = languagesToSave.filter((l) => {
        if (String(getBackendId(l)).startsWith("new_")) return false;
        const old = initialLanguages.find((i) => getBackendId(i) == getBackendId(l));
        return (
          old &&
          (old.languageLevel !== l.languageLevel ||
            old.languageName !== l.languageName ||
            old.groupName !== l.groupName)
        );
      });
      await Promise.all([
        ...toDelete
          .filter((l) => getBackendId(l) && !String(getBackendId(l)).startsWith("new_"))
          .map((l) => deleteForeignLanguage(getBackendId(l))),
        toAdd.length > 0
          ? createForeignLanguage(toAdd.map((l) => ({ ...l, Id: 0, foreignLanguageId: undefined, id: undefined })))
          : null,
        ...toUpdate.map((l) => updateForeignLanguage(getBackendId(l), { ...l, Id: getBackendId(l) })),
      ].filter(Boolean));
      toast.success("Languages updated successfully!");
      if (typeof refetch === 'function') {
        await refetch();
      }
      setShow(false);
      setTimeout(onClose, 300);
    } catch (e) {
      toast.error("An error occurred while saving.");
      console.error(e);
    }
    setSaving(false);
  };

  const filteredLanguageOptions = languageOptions.filter(
    (opt) => !languages.some((l) => l.languageName === opt.value)
  );

  if (!open && !show) return null;

  return (
    <>
      <div className="modal-overlay-animated" style={{ opacity: show ? 1 : 0, zIndex: 1001 }}>
        <div
          className="modal-content-animated"
          style={{
            maxWidth: "800px",
            transform: show ? "scale(1)" : "scale(0.95)",
            opacity: show ? 1 : 0,
          }}
        >
          <button onClick={() => { setShow(false); setTimeout(onClose, 300); }} className="modal-close-btn">
            ×
          </button>
          <h2 className="modal-title">Foreign Languages</h2>
          <div className="modal-tip">
            📝 Tips: Add your foreign language skills to help employers understand your language proficiency.
          </div>
          <div className="form-group">
            <label>Group name *</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>List languages ({languages.length}/10)</label>
            <div style={{ display: "flex", gap: "10px" }}>
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
                onClick={handleAddLanguage}
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
            {languages.length === 0 && !pendingLanguage ? (
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
                {languages.map((l, idx) => (
                  <span
                    key={l.foreignLanguageId || `${l.languageName}-${l.languageLevel}-${idx}`}
                    className={`skill-tag ${l.isNew ? "new" : ""}`}
                  >
                    {l.languageName} ({l.languageLevel})
                    <button onClick={() => handleRemoveLanguage(l.foreignLanguageId, l.languageName, l.languageLevel)}>
                      ×
                    </button>
                  </span>
                ))}
                {pendingLanguage && (
                  <span className="skill-tag pending">
                    {pendingLanguage.languageName} ({pendingLanguage.languageLevel})
                    <button
                      onClick={() => {
                        setPendingLanguage(null);
                        setSelectedLanguage(null);
                        setSelectedLevel(null);
                      }}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => { setShow(false); setTimeout(onClose, 300); }}
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
        .modal-overlay-animated { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: opacity 0.3s; pointer-events: ${show ? "auto" : "none"}; }
        .modal-content-animated { background: #fff; padding: 24px; border-radius: 8px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; transition: all 0.3s; }
        .modal-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .modal-tip { background: #f0f8ff; border: 1px solid #cce5ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .skill-tag { 
          display: inline-flex; align-items: center; gap: 8px;
          background: #e6f7ff; color: #007bff; border-radius: 8px;
          padding: 6px 12px; font-weight: 600; font-size: 15px;
          transition: all 0.3s; animation: fadeIn 0.4s;
        }
        .skill-tag.new { animation: fadeIn 0.4s; }
        .skill-tag.pending { 
          background: #fffbe6; 
          border: 1px dashed #faad14; 
          color: #d48806; 
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(250, 173, 20, 0); }
          100% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .skill-tag button { 
          background: none; border: none; cursor: pointer; 
          color: inherit; opacity: 0.6; font-size: 16px; 
          line-height: 1;
        }
        .skill-tag button:hover { opacity: 1; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
      `}</style>
    </>
  );
};

export default ForeignLanguageModal;
