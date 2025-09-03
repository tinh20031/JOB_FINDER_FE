"use client";
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { cvMatchingService } from '@/services/cvMatchingService';
import { authService } from '@/services/authService';
import ApiService from '@/services/api.service';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/navigation';

const CvMatchingTool = ({ jobId, jobTitle }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingResult, setMatchingResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useExistingCv, setUseExistingCv] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.getToken() ? true : false);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [loadingCvList, setLoadingCvList] = useState(false);
  const [cvListError, setCvListError] = useState("");
  const fileInputRef = useRef(null);
  const [tryMatchRemaining, setTryMatchRemaining] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const router = useRouter();

  // Fetch CV list when modal opens
  useEffect(() => {
    if (showModal && isAuthenticated && useExistingCv) {
      fetchCvList();
    }
  }, [showModal, isAuthenticated, useExistingCv]);

  // Lấy số lượt try-match còn lại khi mở modal
  useEffect(() => {
    if (showModal) {
      fetchTryMatchRemaining();
    }
  }, [showModal]);

  const fetchCvList = async () => {
    try {
      setLoadingCvList(true);
      setCvListError("");
      const data = await ApiService.getMyCVs();
      setCvList(data || []);
      // Auto-select the first CV if available
      if (data && data.length > 0 && !selectedCvId) {
        setSelectedCvId(data[0].cvId || data[0].CVId);
      }
    } catch (err) {
      setCvListError("Failed to load saved CVs. Please try uploading a new CV.");
      setCvList([]);
    } finally {
      setLoadingCvList(false);
    }
  };

  const fetchTryMatchRemaining = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await ApiService.getMySubscription(token);
      if (res?.isSubscribed && res?.subscription?.remainingTryMatches !== undefined) {
        setTryMatchRemaining(res.subscription.remainingTryMatches);
      } else if (res?.freePackage?.remainingFreeMatches !== undefined) {
        setTryMatchRemaining(res.freePackage.remainingFreeMatches);
      } else {
        setTryMatchRemaining(null);
      }
    } catch {
      setTryMatchRemaining(null);
    }
  };

  // Check auth on open
  const handleOpenModal = () => {
    setIsAuthenticated(!!authService.getToken());
    setShowModal(true);
    setShowResult(false);
    setMatchingResult(null);
    setSelectedFile(null);
    setSelectedCvId("");
    setCvListError("");
  };

  // Chỉ hiện modal xác nhận nếu đang loading (isLoading === true)
  const handleCloseModal = () => {
    if (isLoading) {
      setShowCancelConfirmModal(true);
    } else {
      setShowModal(false);
    }
  };

  // Hàm xác nhận hủy
  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
    setShowModal(false);
    setIsLoading(false);
    setMatchingResult(null);
    setShowResult(false);
    setSelectedFile(null);
  };

  // Hàm hủy xác nhận
  const handleCancelCancel = () => {
    setShowCancelConfirmModal(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Please select a file smaller than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCvOptionChange = (option) => {
    setUseExistingCv(option === 'existing');
    setSelectedFile(null);
    setSelectedCvId("");
    if (option === 'existing' && cvList.length === 0) {
      fetchCvList();
    }
  };

  const handleTryMatch = async () => {
    // Kiểm tra số lượt còn lại trước khi thực hiện
    if (tryMatchRemaining !== null && tryMatchRemaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    if (!authService.getToken()) {
      toast.error('Please login to use this feature');
      setIsAuthenticated(false);
      return;
    }
    if (useExistingCv && !selectedCvId) {
      toast.error('Please select a saved CV.');
      return;
    }
    if (!useExistingCv && !selectedFile) {
      toast.error('Please upload a PDF CV file.');
      return;
    }
    setIsLoading(true);
    setShowResult(false);
    setMatchingResult(null);
    try {
      const formData = new FormData();
      formData.append('JobId', jobId);
      if (useExistingCv) {
        formData.append('CvId', selectedCvId);
      } else {
        formData.append('CvFile', selectedFile);
      }
      const response = await cvMatchingService.tryMatch(formData);
      if (response.success) {
        toast.success('Your request is being processed. The result will appear in your try-match history.');
        setTimeout(() => {
          setShowModal(false);
          router.push('/candidates-dashboard/cv-matching-history');
        }, 1000);
      } else {
        toast.error(response.errorMessage || 'An error occurred, please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  // Get selected CV name for display
  const getSelectedCvName = () => {
    if (!selectedCvId) return "";
    const selectedCv = cvList.find(cv => (cv.cvId || cv.CVId) === selectedCvId);
    if (selectedCv) {
      const fileUrl = selectedCv.fileUrl || selectedCv.FileUrl;
      return fileUrl ? fileUrl.split('/').pop() : 'Saved CV';
    }
    return "";
  };

  // Modal content
  const renderModalContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="cv-match-modal-content">
          <h2>Try CV Match</h2>
          <p style={{marginBottom: 32}}>Please login to use the CV Match feature.</p>
          <a href="/login" className="theme-btn btn-style-one" style={{minWidth: 120}}>Login</a>
        </div>
      );
    }
    return (
      <div className="cv-match-modal-content" style={{maxWidth: 540, margin: '0 auto', padding: '0 12px'}}>
        <div className="intro-section">
          <div className="intro-icon"><i className="flaticon-search"></i></div>
          <h2>Try CV Match</h2>
          <p className="intro-desc">Choose a saved CV or upload a PDF file to check how well it matches this job.</p>
        </div>
        <div style={{margin: '32px 0 0 0'}}>
          <h3 style={{fontWeight: 600, fontSize: 24, marginBottom: 20, color: '#222', textAlign: 'left'}}>Choose your CV</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32}}>
            <label style={{display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '14px 18px', border: '1.5px solid #e3e6ee', borderRadius: 10, background: useExistingCv ? '#f5f8ff' : '#fff', transition: 'background 0.2s, border 0.2s', boxShadow: useExistingCv ? '0 2px 8px rgba(102,126,234,0.07)' : 'none'}}>
              <input type="radio" name="cvOption" checked={useExistingCv} onChange={()=>handleCvOptionChange('existing')} style={{width: 20, height: 20, accentColor: '#2563eb', marginTop: 2}} />
              <div style={{flex: 1}}>
                <div style={{fontWeight: 700, fontSize: 17, color: '#222'}}> Use your CV from the list</div>
                <div style={{fontSize: 15, color: '#888', marginTop: 2}}>Your previously uploaded CV</div>
                {useExistingCv && (
                  <div style={{marginTop: 12}}>
                    {loadingCvList ? (
                      <div style={{display: 'flex', alignItems: 'center', gap: 8, color: '#666'}}>
                        <div className="spinner" style={{width: 16, height: 16, border: '2px solid #ddd', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                        <span>Loading CVs...</span>
                      </div>
                    ) : cvListError ? (
                      <div style={{color: '#dc3545', fontSize: 14, marginTop: 8}}>{cvListError}</div>
                    ) : cvList.length === 0 ? (
                      <div style={{color: '#ffc107', fontSize: 14, marginTop: 8}}>No saved CVs found. Please upload a new CV.</div>
                    ) : (
                      <select 
                        value={selectedCvId} 
                        onChange={(e) => setSelectedCvId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: 6,
                          fontSize: 14,
                          marginTop: 8,
                          background: '#fff'
                        }}
                      >
                        <option value="">Select a CV</option>
                        {cvList.map((cv) => {
                          const cvId = cv.cvId || cv.CVId;
                          const fileUrl = cv.fileUrl || cv.FileUrl;
                          const fileName = fileUrl ? fileUrl.split('/').pop() : 'Saved CV';
                          const createdAt = new Date(cv.createdAt || cv.CreatedAt).toLocaleDateString();
                          return (
                            <option key={cvId} value={cvId}>
                              {fileName} (Uploaded: {createdAt})
                            </option>
                          );
                        })}
                      </select>
                    )}
                    {selectedCvId && getSelectedCvName() && (
                      <div style={{marginTop: 8, padding: 8, background: '#e8f5e8', borderRadius: 6, fontSize: 14, color: '#28a745'}}>
                        <i className="flaticon-file" style={{marginRight: 6}}></i>
                        {getSelectedCvName()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
            <label style={{display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '14px 18px', border: '1.5px solid #e3e6ee', borderRadius: 10, background: !useExistingCv ? '#f5f8ff' : '#fff', transition: 'background 0.2s, border 0.2s', boxShadow: !useExistingCv ? '0 2px 8px rgba(102,126,234,0.07)' : 'none'}}>
              <input type="radio" name="cvOption" checked={!useExistingCv} onChange={()=>handleCvOptionChange('upload')} style={{width: 20, height: 20, accentColor: '#2563eb', marginTop: 2}} />
              <div style={{flex: 1}}>
                <div style={{fontWeight: 700, fontSize: 17, color: '#222'}}>Upload New CV</div>
                <div style={{fontSize: 15, color: '#888', marginTop: 2}}>PDF file, max 5MB</div>
                {!useExistingCv && (
                    <div className="file-upload-area" onClick={()=>fileInputRef.current?.click()} style={{border: '2px dashed #b3b8d0', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: '#f8faff', transition: 'border 0.2s'}}>
                      <i className="flaticon-upload" style={{fontSize: 24, color: '#667eea', marginBottom: 8}}></i>
                      <p style={{margin: 0, color: '#222', fontWeight: 500}}>Click to select PDF file</p>
                      <small style={{color: '#888'}}>Or drag and drop here</small>
                      {selectedFile && (
                        <div className="selected-file" style={{marginTop: 12, padding: 10, background: '#e8f5e8', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, color: '#28a745'}}>
                          <i className="flaticon-file"></i>
                          <span>{selectedFile.name}</span>
                        </div>
                      )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{display:'none'}} />
              </div>
            </label>
          </div>
          <button 
            className="theme-btn btn-style-one" 
            style={{width: '100%', marginTop: 18}} 
            onClick={handleTryMatch} 
            disabled={isLoading || (useExistingCv ? !selectedCvId : !selectedFile) || loadingCvList}
          >
            {isLoading ? (
              <><span className="spinner"></span>Analyzing...</>
            ) : (
              <><i className="flaticon-search" style={{marginRight: 8}}></i>Analyze</>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button className="theme-btn btn-style-one" style={{width: '100%', marginTop: 16, marginBottom: 8}} onClick={handleOpenModal}>
        <i className="flaticon-search" style={{marginRight: 8}}></i> Try CV Match
      </button>
      <Modal open={showModal} onClose={handleCloseModal} title="Try CV Match">
        <>
          {isLoading && (
            <div className="modal-loading-overlay">
              <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
            </div>
          )}
          <div style={{textAlign: 'center', margin: '32px 0 24px 0'}}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16}}>
              <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: 32, boxShadow: '0 4px 16px rgba(102,126,234,0.10)'}}>
                <i className="flaticon-search"></i>
              </span>
            </div>
            <h2 style={{fontWeight: 700, fontSize: 32, margin: 0, color: '#222'}}>Try CV Match</h2>
            <p style={{color: '#555', fontSize: 18, margin: '16px 0 0 0', lineHeight: 1.6}}>
              <b>Instantly check how well your CV fits this job!</b><br/>
              This feature helps you analyze your CV against the job requirements for <b>{jobTitle}</b>.<br/>
              <span style={{color: '#888', fontSize: 16, display: 'block', marginTop: 8}}>
                <b>How it works:</b>
                <ol style={{textAlign: 'left', maxWidth: 500, margin: '16px auto 0 auto', color: '#666', fontSize: 15, lineHeight: 1.7}}>
                  <li><b>Choose</b> a saved CV or upload a new PDF CV.</li>
                  <li><b>Click Analyze</b> to see your match score and receive personalized suggestions.</li>
                  <li><b>Improve</b> your CV based on the feedback to boost your chances of getting hired!</li>
                </ol>
              </span>
            </p>
          </div>
          {renderModalContent()}
        </>
      </Modal>
      {/* Modal xác nhận hủy Try Match */}
      <Modal
        open={showCancelConfirmModal}
        onClose={handleCancelCancel}
        title="Cancel CV Match?"
        footer={
          <>
            <button className="btn-cancel" onClick={handleCancelCancel}>No</button>
            <button className="btn-confirm" onClick={handleConfirmCancel}>Yes</button>
          </>
        }
      >
        <div style={{textAlign: 'center', fontSize: 17, color: '#444', padding: '12px 0 4px 0'}}>
          Are you sure you want to cancel CV Match? Your progress will be lost.
        </div>
      </Modal>
      <Modal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Out of Try-match Attempts"
        footer={
          <>
            <button className="btn-cancel" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
            <button className="btn-confirm" onClick={() => { setShowUpgradeModal(false); router.push('/candidates-dashboard/packages/buy'); }}>Buy Package</button>
          </>
        }
      >
        <div style={{textAlign: 'center', fontSize: 17, color: '#444', padding: '12px 0 4px 0'}}>
          You have used up all your try-match attempts. Would you like to upgrade your package to continue using try-match?
        </div>
      </Modal>
      <style jsx>{`
        .cv-match-modal-content {
          max-width: 540px;
          margin: 0 auto;
          padding: 32px 16px 24px 16px;
          text-align: center;
        }
        .intro-section {
          margin-bottom: 32px;
        }
        .intro-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          margin: 0 auto 16px auto;
        }
        .intro-desc {
          color: #495057;
          margin-bottom: 16px;
        }
        .intro-steps {
          text-align: left;
          margin: 0 auto 0 auto;
          max-width: 400px;
          color: #6c757d;
        }
        .intro-steps li {
          margin-bottom: 8px;
        }
        .cv-select-section {
          margin-top: 16px;
        }
        .cv-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .option-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .option-item.active, .option-item:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }
        .option-item input[type="radio"] {
          margin-right: 12px;
          accent-color: #667eea;
        }
        .option-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .option-content i {
          font-size: 20px;
          color: #667eea;
        }
        .option-content strong {
          display: block;
          color: #2c3e50;
          font-weight: 600;
        }
        .option-content small {
          color: #6c757d;
          font-size: 12px;
        }
        .file-upload-section {
          margin-bottom: 20px;
        }
        .file-upload-area {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .file-upload-area:hover {
          border-color: #667eea;
          background-color: #f8f9ff;
        }
        .file-upload-area i {
          font-size: 32px;
          color: #667eea;
          margin-bottom: 12px;
        }
        .file-upload-area p {
          margin: 0 0 4px 0;
          color: #2c3e50;
          font-weight: 500;
        }
        .file-upload-area small {
          color: #6c757d;
        }
        .selected-file {
          margin-top: 16px;
          padding: 12px;
          background: #e8f5e8;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #28a745;
        }
        .matching-btn {
          width: 100%;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .matching-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .matching-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .score-section {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }
        .score-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .score-progress {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .score-content {
          background: white;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .score-number {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1;
        }
        .score-text {
          font-size: 10px;
          color: #6c757d;
          text-align: center;
          margin-top: 2px;
        }
        .suggestions-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        .suggestions-section h4 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-weight: 600;
        }
        .suggestion-item {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
        }
        .suggestion-item:last-child {
          margin-bottom: 0;
        }
        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #667eea;
          font-weight: 600;
        }
        .suggestion-description {
          margin: 0 0 12px 0;
          color: #495057;
          line-height: 1.5;
        }
        .suggestion-actions {
          margin: 0;
          padding-left: 20px;
        }
        .suggestion-actions li {
          margin-bottom: 6px;
          color: #6c757d;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .suggestion-actions li i {
          color: #28a745;
          font-size: 12px;
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .cv-match-modal-content { padding: 16px 4px; }
          .intro-section { margin-bottom: 20px; }
        }
      `}</style>
      <style jsx global>{`
        .modal-body { position: relative; }
      `}</style>
    </>
  );
};

export default CvMatchingTool; 