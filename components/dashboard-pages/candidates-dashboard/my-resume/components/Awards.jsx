import React, { useState, useEffect } from "react";
import AwardModal from "./AwardModal";
import { updateAward, creatAward, deleteAward } from "@/services/useResumeData";
import { toast } from "react-toastify";

const Awards = ({ awards = [], refetch, openExternal, setOpenExternal }) => {
  const [open, setOpen] = useState(false);
  const [selectAwards, setselectedAwards] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeletedAward, setLastDeletedAward] = useState(null);

  // Sync with external open prop
  useEffect(() => {
    if (openExternal) setOpen(true);
  }, [openExternal]);

  const handleEdit = (item) => {
    setselectedAwards(item);
    setOpen(true);
  };

  const handleAdd = () => {
    setselectedAwards(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (setOpenExternal) setOpenExternal(false);
  };

  const handleSave = async (awardData) => {
    try {
      if (awardData.awardId && awardData.awardId > 0) {
        await updateAward(awardData);
      } else {
        await creatAward(awardData);
      }
      setOpen(false);
      if (setOpenExternal) setOpenExternal(false);
      if (typeof refetch === "function") await refetch();
      toast.success("Award updated successfully!");
    } catch (e) {
      toast.error("Update failed!");
    }
  };

  const handleUndo = async (award) => {
    try {
      const { awardId, ...rest } = award;
      await creatAward({ ...rest, awardId: 0 });
      if (typeof refetch === "function") await refetch();
      toast.success("Restored successfully");
      setLastDeletedAward(null);
    } catch {
      toast.error("Undo failed!");
    }
  };

  const handleDelete = async (id) => {
    const award = awards.find((a) => a.awardId === id);
    if (!award) return;

    setDeletingId(id);
    try {
      await deleteAward(id);
      setLastDeletedAward(award);
      if (typeof refetch === "function") {
        await refetch();
      }
      toast.info(
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>
            You deleted an Award.
          </span>
          <button
            style={{
              color: "#fff",
              background: "#28a745",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 16,
              padding: "6px 18px",
              marginLeft: 8,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
            }}
            onClick={async (e) => {
              e.preventDefault();
              await handleUndo(award);
            }}
          >
            Undo
          </button>
        </span>,
        { autoClose: 10000 }
      );
    } catch (e) {
      toast.error("Delete failed!");
    }
    setDeletingId(null);
  };

  // Helper to format date MM/YYYY
  const formatMonthYear = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;
  };

  const isArray = Array.isArray(awards);
  const list = isArray ? awards : [];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
        padding: 24,
        marginBottom: 24,
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
        <span style={{ fontWeight: 700, fontSize: 24 }}>Awards</span>
        <button
          onClick={handleAdd}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#e60023",
            fontSize: 24,
          }}
          title="Add"
        >
          <span className="icon flaticon-plus"></span>
        </button>
      </div>
      <style>{`
        .text p { margin-bottom: 2px !important; }
        .text ul, .text ol { margin-bottom: 2px !important; }
      `}</style>
      <hr style={{ margin: "8px 0 16px 0" }} />
      {list.length === 0 && (
        <div style={{ color: "#888", fontStyle: "italic" }}>No Award info.</div>
      )}
      {list.map((item, idx) => (
        <div
          key={item.awardId || idx}
          style={{
            padding: "0 0 24px 0",
            borderBottom: idx !== list.length - 1 ? "1px solid #eee" : "none",
            marginBottom: idx !== list.length - 1 ? 24 : 0,
            position: "relative",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {item.awardName}
          </div>
          <div style={{ color: "#888", marginBottom: 8, fontSize: 15 }}>
            {item.awardOrganization}
          </div>
          <div style={{ color: "#888", marginBottom: 8, fontSize: 15 }}>
            {formatMonthYear(item.month)}
          </div>
          <div
            className="text"
            style={{ margin: "0 0 12px 0", color: "#222", fontSize: 16 }}
            dangerouslySetInnerHTML={{ __html: item.awardDescription }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <button
              onClick={() => handleEdit(item)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e60023",
                fontSize: 20,
                padding: 4,
              }}
              title="Edit"
            >
              <span className="la la-pencil"></span>
            </button>
            <button
              onClick={() => handleDelete(item.awardId)}
              disabled={deletingId === item.awardId}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 20,
                padding: 4,
              }}
              title="Delete"
            >
              <span className="la la-trash"></span>
            </button>
          </div>
        </div>
      ))}
      <AwardModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        award={selectAwards}
      />
    </div>
  );
};

export default Awards;
