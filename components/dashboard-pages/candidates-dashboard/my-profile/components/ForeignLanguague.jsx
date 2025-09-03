import { FiEdit2 } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import ForeignLanguageModal from "./ForeignLanguageModal";
import { toast } from "react-toastify";

const ForeignLanguague = ({
  foreignlanguage = [],
  refetch,
  openExternal,
  setOpenExternal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (openExternal) setModalOpen(true);
  }, [openExternal]);

  const handleOpenModal = () => {
    setModalOpen(true);
    if (setOpenExternal) setOpenExternal(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (setOpenExternal) setOpenExternal(false);
    if (typeof refetch === "function") refetch();
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
        padding: 24,
        marginBottom: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 24 }}>Foreign Language</span>
        <button
          onClick={handleOpenModal}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#e60023",
            fontSize: 24,
          }}
          title="Edit"
        >
          <FiEdit2 />
        </button>
      </div>
      <hr style={{ margin: "8px 0 16px 0" }} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {foreignlanguage && foreignlanguage.length > 0 ? (
          foreignlanguage.map((l, idx) => (
            <span
              key={l.foreignLanguageId || `${l.languageName}-${l.languageLevel}-${idx}`}
              style={{
                background: "#f3f3f3",
                borderRadius: 20,
                padding: "8px 20px",
                fontWeight: 700,
                fontSize: 18,
                display: "inline-flex",
                alignItems: "center",
                color: "#222",
              }}
            >
              <span style={{ fontWeight: 700 }}>{l.languageName}</span>
              <span style={{ fontWeight: 400, color: "#888", marginLeft: 4 }}>
                ({l.languageLevel})
              </span>
            </span>
          ))
        ) : (
          <span style={{ color: "#888", fontStyle: "italic" }}>
            No Foreign Language info.
          </span>
        )}
      </div>
      {modalOpen && (
        <ForeignLanguageModal
          open={modalOpen}
          onClose={handleCloseModal}
          initialLanguages={foreignlanguage}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default ForeignLanguague;
