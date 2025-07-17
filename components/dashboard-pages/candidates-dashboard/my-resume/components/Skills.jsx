import React, { useState, useMemo } from "react";
import CoreSkillsModal from "./CoreSkillsModal";
import SoftSkillsModal from "./SoftSkillsModal";
import { deleteSkill, createSkill } from "@/services/useResumeData";
import { toast } from "react-toastify";

const Skills = ({
  skills: initialSkills = [],
  refetch,
  openExternal,
  setOpenExternal,
  forceCoreSkillModal,
}) => {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [modalType, setModalType] = useState(null); // 'core' or 'soft'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSoftSkillTooltip, setShowSoftSkillTooltip] = useState(false);
  const [lastDeletedGroup, setLastDeletedGroup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Sync with external open prop
  React.useEffect(() => {
    if (openExternal) {
      if (forceCoreSkillModal) {
        setModalType("core");
        setSelectedGroup(null);
      }
      setModalOpen(true);
    }
  }, [openExternal, forceCoreSkillModal]);

  const normalizedSkills = useMemo(
    () =>
      (initialSkills || []).map((s) => ({
        ...s,
        skillId: s.skillId ?? s.id ?? s.Id, // Ưu tiên skillId, fallback sang id hoặc Id
      })),
    [initialSkills]
  );

  // Group by unique group (groupName + min skillId)
  const groups = useMemo(() => {
    // Sort skills by createdAt or skillId to keep order
    const sorted = [...normalizedSkills].sort((a, b) => {
      if (a.type !== b.type) return a.type - b.type;
      if (a.groupName && b.groupName) {
        if (a.groupName < b.groupName) return -1;
        if (a.groupName > b.groupName) return 1;
      }
      if (a.createdAt && b.createdAt)
        return new Date(a.createdAt) - new Date(b.createdAt);
      return a.skillId - b.skillId;
    });

    // Group by groupName + type
    const groupMap = new Map();
    for (const s of sorted) {
      const key = `${s.groupName || ""}_${s.type}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          groupName: s.groupName,
          type: s.type,
          skills: [],
          groupKey: key,
          createdAt: s.createdAt,
        });
      }
      groupMap.get(key).skills.push(s);
    }
    return Array.from(groupMap.values());
  }, [normalizedSkills]);

  const hasSoftSkillsGroup = useMemo(
    () => groups.some((g) => g.type === 1),
    [groups]
  );

  const handleOpenModal = (type, groupKey = null) => {
    let group = null;
    if (type === "core") {
      // Always use the first core group if it exists
      group = groups.find((g) => g.type === 0);
      groupKey = group ? group.groupKey : null;
    } else if (groupKey) {
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
    if (setOpenExternal) setOpenExternal(false);
    if (typeof refetch === "function") {
      refetch();
    }
  };

  const handleUndo = async (group) => {
    if (!group) return;
    try {
      const skillsToRestore = group.skills.map((s) => {
        const { skillId, ...rest } = s;
        return { ...rest, skillId: 0, id: 0, Id: 0 }; // Đảm bảo không gửi id cũ lên BE
      });
      if (skillsToRestore.length > 0) {
        await createSkill(skillsToRestore);
      }
      toast.success("Group restored successfully!");
      if (typeof refetch === "function") refetch();
      setLastDeletedGroup(null);
    } catch {
      toast.error("Failed to restore group.");
    }
  };

  const handleDeleteGroup = async (groupKey) => {
    const groupToDelete = groups.find((g) => g.groupKey === groupKey);
    if (!groupToDelete) return;

    setDeletingId(groupKey);
    try {
      // Xóa tuần tự từng skill trong group để tránh lỗi bất đồng bộ
      for (const s of groupToDelete.skills) {
        await deleteSkill(s.skillId);
      }
      setLastDeletedGroup(groupToDelete);
      if (typeof refetch === "function") {
        refetch();
      }
      toast.info(
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>
            You deleted a Skill Group.
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
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={async (e) => {
              e.preventDefault();
              await handleUndo(groupToDelete);
            }}
          >
            <span style={{ fontSize: 18, marginRight: 4 }}>⟲</span> Undo
          </button>
        </span>,
        { autoClose: 10000 }
      );
    } catch (e) {
      toast.error("Failed to delete skill group.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        position: "relative",
        minHeight: 100,
      }}
    >
      {/* Popup chọn loại group khi bấm add group */}
      {showAddGroup && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 32,
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
              color: "inherit",
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
            {hasSoftSkillsGroup && <span className="la la-info-circle"></span>}
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

      <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 12 }}>
        Skills
      </div>

      {groups.length === 0 && (
        <div style={{ color: "#888", padding: "16px 0" }}>
          Showcase your skills and proficiencies
        </div>
      )}

      {groups.map((group, idx) => (
        <div
          key={group.groupKey}
          style={{
            background: "#f8f9fa",
            borderRadius: 14,
            padding: 20,
            marginBottom: 18,
            boxShadow: "0 1px 4px #0001",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={(e) => {
            // Không mở modal nếu click vào nút edit/delete
            if (e.target.closest("button")) return;
            handleOpenModal(group.type === 0 ? "core" : "soft", group.groupKey);
          }}
        >
          {/* Nút edit và delete group căn phải */}
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={() =>
                handleOpenModal(
                  group.type === 0 ? "core" : "soft",
                  group.groupKey
                )
              }
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
            {/* Nút delete group - chỉ xuất hiện 1 lần cho mỗi group */}
            <button
              onClick={() => handleDeleteGroup(group.groupKey)}
              disabled={deletingId === group.groupKey}
              style={{
                background: "none",
                border: "none",
                cursor:
                  deletingId === group.groupKey ? "not-allowed" : "pointer",
                color: deletingId === group.groupKey ? "#ccc" : "#888",
                fontSize: 20,
                padding: 4,
                opacity: deletingId === group.groupKey ? 0.6 : 1,
              }}
              title="Delete"
            >
              <span className="la la-trash"></span>
            </button>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            {group.groupName}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {group.skills.map((skill) => (
              <span
                key={skill.skillId}
                style={{
                  background: group.type === 0 ? "#e6f7ff" : "#fff3cd",
                  color: group.type === 0 ? "#007bff" : "#856404",
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 6,
                  display: "inline-block",
                }}
              >
                {skill.skillName}
                {group.type === 0 && skill.experienceLevel && (
                  <span
                    style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}
                  >
                    ({skill.experienceLevel})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Khi bấm add group sẽ mở modal với selectedGroup=null */}
      <button
        className="add-info-btn"
        onClick={() => setShowAddGroup((p) => !p)}
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          background: "none",
          border: "none",
          color: "#e60023",
          fontSize: 28,
          cursor: "pointer",
          padding: 0,
        }}
        title="Add group"
      >
        <span className="icon flaticon-plus"></span>
      </button>

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
