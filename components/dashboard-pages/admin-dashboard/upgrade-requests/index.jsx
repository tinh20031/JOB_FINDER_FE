"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import MainHeader from "../../../header/MainHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userService } from "@/services/userService";
import Modal from "@/components/common/Modal";
import "./user-manager-animations.css";

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  // Adjust to Vietnam timezone (UTC+7)
  date.setHours(date.getHours() + 7);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const statusBadgeClass = (status) => {
  const statusNum = parseInt(status);
  if (statusNum === 1) return "badge bg-success";
  if (statusNum === 2) return "badge bg-danger";
  if (statusNum === 0) return "badge bg-warning text-dark";
  return "badge bg-secondary";
};

const getStatusText = (status) => {
  const statusNum = parseInt(status);
  if (statusNum === 1) return "Approved";
  if (statusNum === 2) return "Rejected";
  if (statusNum === 0) return "Pending";
  return "Unknown";
};

const UpgradeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmModal, setConfirmModal] = useState({ show: false, request: null, action: null });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await userService.getUpgradeRequests();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setRequests(list || []);
    } catch (e) {
      // Only show error toast for real errors (not 404 which is handled in service)
      if (e?.message && !e.message.includes("404")) {
        toast.error(e?.message || "Failed to load requests");
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (req, action) => {
    try {
      setActionLoadingId(req.userId);
      await userService.processUpgrade(req.userId, action);
      toast.success(`${action === "approve" ? "Approved" : "Rejected"} successfully`);
      fetchRequests();
    } catch (e) {
      toast.error(e?.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const showConfirmModal = (request, action) => {
    setConfirmModal({ show: true, request, action });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ show: false, request: null, action: null });
  };

  const confirmAction = async () => {
    if (confirmModal.request && confirmModal.action) {
      await handleAction(confirmModal.request, confirmModal.action);
      hideConfirmModal();
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = (requests || []).filter((r) => {
      const name = (r.fullName || r.user?.fullName || "").toLowerCase();
      const email = (r.email || r.user?.email || "").toLowerCase();
      const company = (r.companyName || "").toLowerCase();
      const industry = (r.industryName || r.industry?.industryName || "").toLowerCase();
      const status = (r.status || 0).toString();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || company.includes(q) || industry.includes(q);
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "pending" && r.status === 0) ||
        (statusFilter === "approved" && r.status === 1) ||
        (statusFilter === "rejected" && r.status === 2);
      return matchesSearch && matchesStatus;
    });
    // Sort newest first by createdAt
    return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [requests, search, statusFilter]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-wrapper dashboard">
        <span className="header-span"></span>
        <MainHeader />
        <DashboardAdminSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Upgrade Requests" />
            <MenuToggler />
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <h4>Upgrade Requests ({filtered.length})</h4>
                    <div className="filter-container d-flex gap-2">
                      <div className="search-group">
                        <input
                          className="search-input form-control"
                          placeholder="Search name"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <div className="filter-group">
                        <select
                          className="filter-select form-select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All statuses</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={`widget-content ${!loading ? "fade-in" : ""}`}>
                    {loading ? (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              {/* <th>Avatar</th> */}
                              <th>Candidate</th>
                              <th>Email</th>
                              <th>Company Name</th>
                              <th>Industry</th>
                              <th>Status</th>
                              <th>Requested At</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(8)].map((_, idx) => (
                              <tr key={idx}>
                                <td><div className="skeleton-line" style={{ width: 50, height: 50, borderRadius: "50%" }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 120, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 160, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 120, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 100, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 80, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 120, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 120, height: 32, borderRadius: 8 }}></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            {/* <th>Avatar</th> */}
                            <th>Candidate</th>
                            <th>Email</th>
                            <th>Company Name</th>
                            <th>Industry</th>
                            <th>Status</th>
                            <th>Requested At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr>
                              <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                                No matching requests
                              </td>
                            </tr>
                          ) : (
                            filtered.map((r, i) => {
                              // const avatar = r.image || r.user?.image || "/images/resource/candidate-1.png";
                              const fullName = r.fullName || r.user?.fullName || "";
                              const email = r.email || r.user?.email || "";
                              const industry = r.industryName || r.industry?.industryName || r.industryId;
                              const statusText = (r.status || 0).toString();
                              const isPending = r.status === 0;
                              return (
                                <tr key={`${r.candidateToCompanyRequestId || i}`}>
                                  {/* <td>
                                    <img
                                      src={avatar}
                                      alt="avatar"
                                      style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                  </td> */}
                                  <td>{fullName}</td>
                                  <td>{email}</td>
                                  <td>{r.companyName}</td>
                                  <td>{industry}</td>
                                  <td>
                                    <span className={statusBadgeClass(statusText)}>{getStatusText(statusText)}</span>
                                  </td>
                                  <td>{r.createdAt ? timeAgo(r.createdAt) : ""}</td>
                                  <td>
                                    <div className="action-buttons d-flex gap-2">
                                      {isPending ? (
                                        <>
                                          <button
                                            disabled={actionLoadingId === r.userId}
                                            className="btn btn-sm btn-success"
                                            onClick={() => showConfirmModal(r, "approve")}
                                            style={{ minWidth: "80px", borderRadius: "8px", fontWeight: "600" }}
                                          >
                                            <i className="fas fa-check me-1"></i>
                                            Approve
                                          </button>
                                          <button
                                            disabled={actionLoadingId === r.userId}
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => showConfirmModal(r, "reject")}
                                            style={{ minWidth: "80px", borderRadius: "8px", fontWeight: "600" }}
                                          >
                                            <i className="fas fa-times me-1"></i>
                                            Reject
                                          </button>
                                        </>
                                      ) : (
                                        <span style={{ color: "#6c757d" }}>No actions</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: 400,
            maxWidth: '90vw',
            padding: '32px 28px 24px 28px',
            position: 'relative',
            textAlign: 'center',
          }}>
            <button
              onClick={hideConfirmModal}
              style={{
                position: 'absolute', top: 16, right: 18, border: 'none', background: 'transparent', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 400
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 style={{fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#222'}}>
              {confirmModal.action === "approve" ? "Approve Upgrade Request?" : "Reject Upgrade Request?"}
            </h3>
            <div style={{fontSize: 16, color: '#444', marginBottom: 28}}>
              Are you sure you want to{" "}
              <strong>{confirmModal.action === "approve" ? "approve" : "reject"}</strong>{" "}
              the upgrade request for{" "}
              <strong>{confirmModal.request?.fullName || confirmModal.request?.user?.fullName}</strong>?
            </div>
            <div style={{fontSize: 14, color: '#666', marginBottom: 32}}>
              Company: {confirmModal.request?.companyName}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
              <button 
                className="btn-cancel" 
                style={{
                  minWidth: 80, 
                  padding: '10px 24px', 
                  borderRadius: 6, 
                  border: '1px solid #ccc', 
                  background: '#f7f7f7', 
                  color: '#333', 
                  fontWeight: 500, 
                  fontSize: 16,
                  cursor: 'pointer'
                }} 
                onClick={hideConfirmModal}
              >
                No
              </button>
              <button 
                className="btn-confirm" 
                style={{
                  minWidth: 80, 
                  padding: '10px 24px', 
                  borderRadius: 6, 
                  border: 'none', 
                  background: '#1967d2', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: 16,
                  cursor: 'pointer'
                }} 
                onClick={confirmAction}
                disabled={actionLoadingId === confirmModal.request?.userId}
              >
                {actionLoadingId === confirmModal.request?.userId ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  "Yes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpgradeRequests;