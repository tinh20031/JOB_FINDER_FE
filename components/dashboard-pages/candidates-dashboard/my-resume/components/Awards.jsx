import React, { useState } from "react";
import AwardModal from "./AwardModal";
import { updateAward, creatAward } from "@/services/useResumeData";

const Awards = ({ awards = [] }) => {
  const [open, setOpen] = useState(false);
  const [selectAwards, setselectedAwards] = useState(null);
  const [reload, setReload] = useState(0);

  const handleEdit = (item) => {
    setselectedAwards(item);
    setOpen(true);
  };

  const handleAdd = () => {
    setselectedAwards(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async (awardData) => {
    try {
      if (awardData.awardId && awardData.awardId > 0) {
        await updateAward(awardData);
      } else {
        await creatAward(awardData);
      }
      setOpen(false);
      setReload((r) => r + 1);
      window.location.reload();
    } catch (e) {
      alert("Cập nhật thất bại!");
    }
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
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>
            {item.awardName}
          </div>
          <div style={{ color: "#444", marginBottom: 2 }}>
            {item.awardOrganization}
          </div>
          <div style={{ color: "#888", marginBottom: 2 }}>
            {formatMonthYear(item.month)}
          </div>
          {item.awardDescription && (
            <div style={{ fontWeight: 600, marginBottom: 2 }}></div>
          )}
          <div style={{ color: "#222", fontSize: 16 }}>
            {item.awardDescription}
          </div>
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
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: 20,
                padding: 4,
              }}
              title="Delete"
              // TODO: Thêm logic xóa nếu cần
            >
              <span className="la la-trash"></span>
            </button>
          </div>
        </div>
      ))}
      <AwardModal
        key={open ? selectAwards?.awardId || "new" : "closed"}
        open={open}
        onClose={handleClose}
        onSubmit={handleSave}
        award={selectAwards}
      />
    </div>
  );
};

export default Awards;
