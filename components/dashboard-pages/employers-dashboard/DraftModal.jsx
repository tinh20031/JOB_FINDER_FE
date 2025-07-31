'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DraftModal = ({ isOpen, onClose, onLoadDraft, drafts = [], isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDraft, setSelectedDraft] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedDraft(null);
    }
  }, [isOpen]);

  const filteredDrafts = drafts.filter(draft =>
    draft.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadDraft = () => {
    if (selectedDraft) {
      onLoadDraft(selectedDraft);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop with animation */}
          <motion.div 
            className="modal-backdrop fade show" 
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)', 
              zIndex: 1040,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          ></motion.div>
          
          {/* Modal with animation */}
          <motion.div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              zIndex: 1050,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'auto'
            }} 
            tabIndex="-1"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px', margin: '1.75rem auto' }}>
              <motion.div 
                className="modal-content border-0 shadow-lg" 
                style={{ borderRadius: '16px' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {/* Header with gradient */}
                <motion.div 
                  className="modal-header border-0" 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px 16px 0 0',
                    padding: '0.75rem 1.25rem'
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h5 className="modal-title text-white mb-0" style={{ fontSize: '1rem', fontWeight: '600' }}>
                    <i className="fas fa-folder-open me-2"></i>
                    Select Draft Job
                  </h5>
                  <motion.button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={onClose}
                    aria-label="Close"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  ></motion.button>
                </motion.div>

                {/* Body */}
                <motion.div 
                  className="modal-body p-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  {/* Search Bar with animation */}
                  <motion.div 
                    className="mb-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-search text-muted" style={{ fontSize: '0.8rem' }}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search drafts by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderLeft: 'none', fontSize: '0.85rem' }}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  {isLoading ? (
                    <motion.div 
                      className="text-center py-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="spinner-border text-primary spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>Loading drafts...</p>
                    </motion.div>
                  ) : filteredDrafts.length === 0 ? (
                    <motion.div 
                      className="text-center py-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <i className="fas fa-folder-open text-muted" style={{ fontSize: '2rem' }}></i>
                      <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                        {searchTerm ? 'No drafts found matching your search.' : 'No drafts available.'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="draft-list" 
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {filteredDrafts.map((draft, index) => (
                        <motion.div
                          key={draft.jobId}
                          onClick={() => setSelectedDraft(draft)}
                          className={`list-group-item list-group-item-action ${
                            selectedDraft?.jobId === draft.jobId ? 'active' : ''
                          }`}
                          style={{
                            borderRadius: '8px',
                            marginBottom: '4px',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            border: selectedDraft?.jobId === draft.jobId ? '2px solid #667eea' : '1px solid #dee2e6',
                            background: selectedDraft?.jobId === draft.jobId ? '#f8f9ff' : '#fff',
                            transition: 'all 0.2s ease'
                          }}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            background: selectedDraft?.jobId === draft.jobId ? '#f8f9ff' : '#f8f9fa'
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: selectedDraft?.jobId === draft.jobId 
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <i className={`fas fa-file-alt ${selectedDraft?.jobId === draft.jobId ? 'text-white' : 'text-muted'}`} style={{ fontSize: '0.8rem' }}></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold" style={{ fontSize: '0.8rem', color: selectedDraft?.jobId === draft.jobId ? '#667eea' : '#212529' }}>
                                {draft.title || 'Untitled Job'}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Created: {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : 'Unknown'}
                              </small>
                            </div>
                            {selectedDraft?.jobId === draft.jobId && (
                              <motion.div 
                                className="ms-2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <i className="fas fa-check-circle text-primary" style={{ fontSize: '0.9rem' }}></i>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Footer */}
                <motion.div 
                  className="modal-footer border-0 bg-light" 
                  style={{ borderRadius: '0 0 16px 16px', padding: '0.75rem 1.25rem' }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <motion.button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onClose}
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleLoadDraft}
                    disabled={!selectedDraft}
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fas fa-folder-open me-1"></i>
                    Load Draft
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DraftModal; 