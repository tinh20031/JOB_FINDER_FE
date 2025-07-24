'use client'

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ApiService from '@/services/api.service';
import Modal from "@/components/common/Modal";
import "@/styles/modal.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Chỉ cho phép PDF
function checkFileTypes(files) {
    const allowedTypes = ["application/pdf"];
    for (let i = 0; i < files.length; i++) {
        if (!allowedTypes.includes(files[i].type)) {
            return false;
        }
    }
    return true;
}

// Định dạng ngày/giờ: HH:mm dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
const formatDateVN = (str) => {
  if (!str) return '';
  const dateObj = new Date(str);
  dateObj.setHours(dateObj.getHours() + 7);
  return dateObj.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  });
};

const CvUploader = () => {
    const [getManager, setManager] = useState([]);
    const [getError, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [cvList, setCvList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch CV list on mount
    useEffect(() => {
        const fetchCVs = async () => {
            try {
                const data = await ApiService.request("CV/my-cvs", "GET");
                setCvList(data);
            } catch (err) {
                setError("Không thể tải danh sách CV.");
            } finally {
                setLoading(false);
            }
        };
        fetchCVs();
    }, []);

    const cvManagerHandler = async (e) => {
        const data = Array.from(e.target.files);

        if (!checkFileTypes(data)) {
            setError("Only PDF files (.pdf) are accepted");
            return;
        }
        setError("");

        // Chỉ upload file đầu tiên (nếu muốn cho nhiều file thì lặp)
        const file = data[0];
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        if (!userId) {
            setError("User information not found.");
            return;
        }

        setUploading(true);
        setSuccessMsg("");
        try {
            await ApiService.uploadCV({ file, userId });
            setManager([...getManager, file]);
            toast.success("Upload CV successfully!");
            // Refresh CV list after upload
            const data = await ApiService.request("CV/my-cvs", "GET");
            setCvList(data);
        } catch (err) {
            setError(
                err?.message || "Failed to upload. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    // Xóa file khỏi danh sách hiển thị (không xóa trên server)
    const deleteHandler = (name) => {
        const deleted = getManager?.filter((file) => file.name !== name);
        setManager(deleted);
    };

    // Thêm hàm mở modal xác nhận xoá
    const confirmDelete = (cvId) => {
        setDeleteTargetId(cvId);
        setShowDeleteModal(true);
    };

    // Sửa lại handleDelete để dùng với modal
    const handleDelete = async () => {
        if (!deleteTargetId) return;
        setShowDeleteModal(false);
        try {
            await ApiService.deleteCV(deleteTargetId);
            toast.success("CV deleted successfully!");
            // Reload danh sách CV
            const data = await ApiService.getMyCVs();
            setCvList(data);
        } catch (err) {
            setError(err?.message || "Failed to delete CV. Please try again.");
        } finally {
            setDeleteTargetId(null);
        }
    };

    return (
        <>
            <style>{`
                .spinner {
                  display: inline-block;
                  width: 18px;
                  height: 18px;
                  border: 2px solid #fff;
                  border-top: 2px solid #1967d2;
                  border-radius: 50%;
                  animation: spin 0.7s linear infinite;
                  margin-right: 8px;
                  vertical-align: middle;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
            `}</style>
            <div className="uploading-resume">
                <div className="uploadButton">
                    <input
                        ref={fileInputRef}
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept=".pdf,application/pdf"
                        id="upload"
                        onChange={cvManagerHandler}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <div
                        className="cv-uploadButton"
                        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                        onClick={() => {
                            if (uploading) return;
                            if (cvList.length >= 5) {
                                setShowLimitModal(true);
                                return;
                            }
                            fileInputRef.current.click();
                        }}
                    >
                        <span className="title">Drop files here to upload</span>
                        <span className="text">
                            Only PDF files (.pdf) are allowed, maximum size 5MB
                        </span>
                        <button
                            className="theme-btn btn-style-one"
                            type="button"
                            disabled={uploading}
                            style={{ marginTop: 16 }}
                        >
                            {uploading && <span className="spinner" />}
                            {uploading ? "Uploading..." : "Upload Resume"}
                        </button>
                        {getError && <p className="ui-danger mb-0">{getError}</p>}
                        {successMsg && <p className="ui-success mb-0">{successMsg}</p>}
                        {cvList.length >= 5 && (
                            <p className="ui-danger mb-0">
                                You can only upload and store up to 5 CVs. Please delete an old CV to upload a new one.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Table styled like job listing */}
            <div style={{ marginTop: 32 }}>
                <div className="widget-title">
                    <h4>My Uploaded CVs</h4>
                </div>
                <div className="widget-content">
                    {loading ? (
                        <div className="table-outer">
                            <table className="default-table manage-job-table">
                                <thead>
                                    <tr>
                                        {/* <th>#</th> */}
                                        <th style={{ width: '50%' }}>File</th>
                                        <th style={{ width: '30%' }}>Created At</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(5)].map((_, idx) => (
                                        <tr key={idx}>
                                            {/* <td><div className="skeleton-line medium" style={{ height: 16, borderRadius: 6 }}></div></td> */}
                                            <td><div className="skeleton-line long" style={{ height: 18, marginBottom: 8, borderRadius: 6 }}></div></td>
                                            <td><div className="skeleton-line medium" style={{ height: 16, borderRadius: 6 }}></div></td>
                                            <td><div className="skeleton-line short" style={{ height: 16, borderRadius: 6 }}></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-outer">
                            <table className="default-table manage-job-table">
                                <thead>
                                    <tr>
                                        {/* <th>#</th> */}
                                        <th style={{ width: '50%' }}>File</th>
                                        <th style={{ width: '30%' }}>Created At</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cvList.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>No CV uploaded yet.</td>
                                        </tr>
                                    ) : (
                                        cvList.map((cv, idx) => (
                                            <tr
                                                key={cv.cvId || cv.CVId}
                                                className="job-row"
                                                style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                                            >
                                                {/* <td style={{ padding: '10px 8px' }}>{idx + 1}</td> */}
                                                <td style={{
                                                    padding: '10px 8px',
                                                    maxWidth: 320,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <a href={cv.fileUrl || cv.FileUrl} target="_blank" rel="noopener noreferrer">
                                                        {cv.fileUrl?.split('/').pop() || cv.FileUrl?.split('/').pop() || 'View CV'}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '10px 8px' }}>{formatDateVN(cv.createdAt || cv.CreatedAt)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div className="option-box">
                                                        <ul className="option-list">
                                                            <li>
                                                                <a
                                                                    href={cv.fileUrl || cv.FileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    data-text="View"
                                                                    style={{ marginRight: 4 }}
                                                                >
                                                                    <span className="la la-eye"></span>
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    data-text="Delete"
                                                                    onClick={() => confirmDelete(cv.cvId || cv.CVId)}
                                                                >
                                                                    <span className="la la-trash"></span>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Delete CV"
                footer={
                    <>
                        <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button className="btn-confirm" onClick={handleDelete}>Delete</button>
                    </>
                }
            >
                <div>Are you sure you want to delete this CV? This action cannot be undone.</div>
            </Modal>
            <Modal
                open={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                title="Upload Limit"
                footer={
                    <button className="btn-confirm" onClick={() => setShowLimitModal(false)}>
                        OK
                    </button>
                }
            >
                <div>
                    You can only upload and store up to 5 CVs. Please delete an old CV to upload a new one.
                </div>
            </Modal>
        </>
    );
};

export default CvUploader;
