// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import {
//   createForeignLanguage,
//   updateForeignLanguage,
//   deleteForeignLanguage,
// } from "@/services/useResumeData";
// import { toast } from "react-toastify";

// const languageOptions = [
//   { value: "Vietnamese", label: "Vietnamese" },
//   { value: "English", label: "English" },
//   { value: "Japanese", label: "Japanese" },
//   { value: "French", label: "French" },
//   { value: "Korean", label: "Korean" },
//   { value: "Chinese", label: "Chinese" },
//   { value: "German", label: "German" },
//   { value: "Spanish", label: "Spanish" },
//   { value: "Russian", label: "Russian" },
// ];
// const levelOptions = [
//   { value: "Basic", label: "Basic" },
//   { value: "Intermediate", label: "Intermediate" },
//   { value: "Advanced", label: "Advanced" },
//   { value: "Fluent", label: "Fluent" },
// ];

// const ForeignLanguageModal = ({ open, onClose, initialLanguages, refetch }) => {
//   const [languages, setLanguages] = useState([]);
//   const [selectedLanguage, setSelectedLanguage] = useState(null);
//   const [selectedLevel, setSelectedLevel] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setLanguages(initialLanguages || []);
//       setSelectedLanguage(null);
//       setSelectedLevel(null);
//       setTimeout(() => setShow(true), 10);
//     } else {
//       setShow(false);
//     }
//   }, [initialLanguages, open]);

//   const handleClose = () => {
//     setShow(false);
//     setTimeout(onClose, 300);
//   };

//   if (!open && !show) return null;

//   const handleAdd = () => {
//     if (!selectedLanguage || !selectedLevel) {
//       toast.warn("Please select a language and proficiency level.");
//       return;
//     }
//     if (languages.length >= 5) {
//       toast.warn("You can add up to 5 languages only.");
//       return;
//     }
//     if (languages.find((l) => l.languageName === selectedLanguage.value)) {
//       toast.warn("This language has already been added.");
//       return;
//     }
//     setLanguages([
//       ...languages,
//       {
//         foreignLanguageId: `new_${Date.now()}`,
//         languageName: selectedLanguage.value,
//         languageLevel: selectedLevel.value,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         isNew: true, // For animation
//       },
//     ]);
//     setSelectedLanguage(null);
//     setSelectedLevel(null);
//   };

//   const handleRemove = (id) => {
//     setLanguages(languages.filter((l) => l.foreignLanguageId !== id));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       // Tách mới/cũ
//       const initialIds = initialLanguages
//         ? initialLanguages.map((l) => l.foreignLanguageId)
//         : [];
//       const currentIds = languages.map((l) => l.foreignLanguageId);
//       const toDelete = initialLanguages
//         ? initialLanguages.filter(
//             (l) => !currentIds.includes(l.foreignLanguageId)
//           )
//         : [];
//       const toAdd = languages.filter((l) =>
//         String(l.foreignLanguageId).startsWith("new_")
//       );
//       const toUpdate = languages.filter((l) => {
//         if (String(l.foreignLanguageId).startsWith("new_")) return false;
//         const old = initialLanguages.find(
//           (i) => i.foreignLanguageId === l.foreignLanguageId
//         );
//         return (
//           old &&
//           (old.languageLevel !== l.languageLevel ||
//             old.languageName !== l.languageName)
//         );
//       });
//       await Promise.all([
//         ...toDelete.map((l) => deleteForeignLanguage(l.foreignLanguageId)),
//         ...toAdd.map((l) =>
//           createForeignLanguage({ ...l, foreignLanguageId: 0 })
//         ),
//         ...toUpdate.map((l) => updateForeignLanguage(l.foreignLanguageId, l)),
//       ]);
//       toast.success("Languages updated successfully!");
//       if (typeof refetch === "function") {
//         await refetch();
//       }
//       handleClose();
//     } catch (e) {
//       toast.error("An error occurred while saving.");
//       console.error(e);
//     }
//     setSaving(false);
//   };

//   // Lọc ngôn ngữ chưa được chọn
//   const filteredLanguageOptions = languageOptions.filter(
//     (opt) => !languages.some((l) => l.languageName === opt.value)
//   );

//   return (
//     <>
//       <div
//         className="modal-overlay-animated"
//         style={{ zIndex: 1001, opacity: show ? 1 : 0 }}
//       >
//         <div
//           className="modal-content-animated"
//           style={{
//             maxWidth: "800px",
//             transform: show ? "scale(1)" : "scale(0.95)",
//             opacity: show ? 1 : 0,
//           }}
//         >
//           <button onClick={handleClose} className="modal-close-btn">
//             ×
//           </button>
//           <h2 className="modal-title">Foreign Language</h2>
//           <div className="form-group">
//             <label>List languages ({languages.length}/5)</label>
//             <div style={{ display: "flex", gap: "10px", marginBottom: 25 }}>
//               <Select
//                 options={filteredLanguageOptions}
//                 value={selectedLanguage}
//                 onChange={setSelectedLanguage}
//                 placeholder="Search language"
//                 isClearable
//                 styles={{ container: (base) => ({ ...base, flex: 1 }) }}
//               />
//               <Select
//                 options={levelOptions}
//                 value={selectedLevel}
//                 onChange={setSelectedLevel}
//                 placeholder="Select level"
//                 isClearable
//                 styles={{ container: (base) => ({ ...base, flex: 1 }) }}
//               />
//               <button
//                 onClick={handleAdd}
//                 className="theme-btn btn-style-one"
//                 style={{ padding: "10px 20px" }}
//               >
//                 +
//               </button>
//             </div>
//             <div
//               className="skills-list"
//               style={{
//                 minHeight: "100px",
//                 border: "1px solid #eee",
//                 borderRadius: "8px",
//                 padding: "10px",
//                 marginTop: "10px",
//               }}
//             >
//               {languages.length === 0 ? (
//                 <div
//                   style={{
//                     textAlign: "center",
//                     color: "#888",
//                     padding: "50px 0",
//                   }}
//                 >
//                   No items selected
//                 </div>
//               ) : (
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//                   {languages.map((l) => (
//                     <span
//                       key={l.foreignLanguageId}
//                       className={`skill-tag ${l.isNew ? "new" : ""}`}
//                     >
//                       <b>{l.languageName}</b> (
//                       <span style={{ color: "#555" }}>{l.languageLevel}</span>)
//                       <button onClick={() => handleRemove(l.foreignLanguageId)}>
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="modal-actions">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="theme-btn btn-style-three"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSave}
//               className="theme-btn btn-style-one"
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </div>
//       </div>
//       <style>{`
//         .modal-overlay-animated { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: opacity 0.3s; pointer-events: ${
//           show ? "auto" : "none"
//         }; }
//         .modal-content-animated { background: #fff; padding: 24px; border-radius: 8px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; transition: all 0.3s; }
//         .modal-close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
//         .modal-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
//         .form-group { margin-bottom: 16px; }
//         .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
//         .skill-tag {
//           display: inline-flex; align-items: center; gap: 8px;
//           background: #f0f0f0; color: #333; border-radius: 16px;
//           padding: 8px 14px; font-size: 15px;
//           transition: all 0.3s; animation: fadeIn 0.4s;
//         }
//         .skill-tag.new { animation: fadeIn 0.4s; }
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
//         .skill-tag button {
//           background: #d0d0d0; color: #fff; border: none;
//           border-radius: 50%; width: 20px; height: 20px;
//           display: flex; align-items: center; justify-content: center;
//           cursor: pointer; font-size: 14px; line-height: 1;
//         }
//         .skill-tag button:hover { background: #bb0c24; }
//         .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
//       `}</style>
//     </>
//   );
// };

// export default ForeignLanguageModal;
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
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setLanguages(initialLanguages || []);
      setSelectedLanguage(null);
      setSelectedLevel(null);
      setPendingLanguage(null);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [initialLanguages, open]);

  // Effect to track changes in selected language and level
  useEffect(() => {
    if (selectedLanguage && selectedLevel) {
      // Check if this combination would create a duplicate
      if (languages.find((l) => l.languageName === selectedLanguage.value)) {
        // Don't show duplicates
        setPendingLanguage(null);
        return;
      }

      // Store as pending language
      setPendingLanguage({
        foreignLanguageId: `pending_${Date.now()}`,
        languageName: selectedLanguage.value,
        languageLevel: selectedLevel.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPending: true, // Mark as pending for styling
      });
    } else {
      // Clear pending language if either selection is cleared
      setPendingLanguage(null);
    }
  }, [selectedLanguage, selectedLevel, languages]);

  const handleClose = () => {
    setShowConfirmDialog(false);
    setShow(false);
    setTimeout(onClose, 300);
  };

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
    setPendingLanguage(null);
  };

  const handleRemove = (id) => {
    setLanguages(languages.filter((l) => l.foreignLanguageId !== id));
  };

  const handleSave = async () => {
    // If we have a pending language, show confirmation dialog
    if (pendingLanguage) {
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, proceed with saving directly
    await saveLanguages(false);
  };

  const saveLanguages = async (includePending = false) => {
    setSaving(true);
    try {
      // Create a copy of the languages array to work with
      let languagesToSave = [...languages];

      // If we should include the pending language, add it to the array
      if (includePending && pendingLanguage) {
        // Check max limit
        if (languages.length >= 5) {
          toast.warn("You can add up to 5 languages only.");
          setSaving(false);
          return;
        }

        // Add pending language to languages to save
        languagesToSave.push({
          ...pendingLanguage,
          foreignLanguageId: `new_${Date.now()}`,
          isPending: false,
        });
      }

      // Tách mới/cũ
      const initialIds = initialLanguages
        ? initialLanguages.map((l) => l.foreignLanguageId)
        : [];
      const currentIds = languagesToSave.map((l) => l.foreignLanguageId);
      const toDelete = initialLanguages
        ? initialLanguages.filter(
            (l) => !currentIds.includes(l.foreignLanguageId)
          )
        : [];
      const toAdd = languagesToSave.filter((l) =>
        String(l.foreignLanguageId).startsWith("new_")
      );
      const toUpdate = languagesToSave.filter((l) => {
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

  if (!open && !show) return null;

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
              {languages.length === 0 && !pendingLanguage ? (
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

                  {/* Show pending language if exists */}
                  {pendingLanguage && (
                    <span className="skill-tag pending">
                      <b>{pendingLanguage.languageName}</b> (
                      <span style={{ color: "#555" }}>
                        {pendingLanguage.languageLevel}
                      </span>
                      )
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

      {/* Confirm Dialog for Pending Language */}
      {showConfirmDialog && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <h3>Save Pending Language?</h3>
            <p>
              Do you want to save the language "{pendingLanguage.languageName}"
              with {pendingLanguage.languageLevel} proficiency?
            </p>
            <div className="confirm-modal-actions">
              <button
                className="theme-btn btn-style-three"
                onClick={() => {
                  setShowConfirmDialog(false);
                  saveLanguages(false);
                }}
              >
                No
              </button>
              <button
                className="theme-btn btn-style-one"
                onClick={() => {
                  setShowConfirmDialog(false);
                  saveLanguages(true);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

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
          background: #d0d0d0; color: #fff; border: none;
          border-radius: 50%; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; font-size: 14px; line-height: 1;
        }
        .skill-tag button:hover { background: #bb0c24; }
        .skill-tag.pending button {
          background: #faad14;
        }
        .skill-tag.pending button:hover {
          background: #d48806;
        }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
        
        /* Confirmation Modal Styles */
        .confirm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1002;
          animation: fadeIn 0.2s;
        }
        .confirm-modal-content {
          background: #fff;
          padding: 24px;
          border-radius: 8px;
          width: 95%;
          max-width: 450px;
          text-align: center;
          animation: scaleIn 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .confirm-modal-content h3 {
          font-size: 20px;
          margin-bottom: 16px;
          color: #333;
        }
        .confirm-modal-content p {
          margin-bottom: 24px;
          color: #555;
          font-size: 16px;
        }
        .confirm-modal-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ForeignLanguageModal;
