import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import "@/styles/modal.css";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

export default function PendingApplicationsModal({ 
  open, 
  onClose, 
  onViewApplications, 
  onProceedAnyway,
  jobTitle,
  pendingCount 
}) {
  if (typeof window === "undefined") return null; // SSR guard

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative'
            }}
          >
            <div className="modal-header" style={{ marginBottom: '16px', paddingRight: '40px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#dc3545',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                Important Notice
              </h3>
            </div>
            
            <div className="modal-body" style={{ marginBottom: '24px' }}>
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: '16px', 
                lineHeight: '1.5',
                color: '#333'
              }}>
                Job <strong>"{jobTitle}"</strong> currently still{' '}
                <strong style={{ color: '#dc3545' }}>{pendingCount}</strong> application pending
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#666',
                lineHeight: '1.4'
              }}>
                Would you like to view and process these applications before deactivating the job?
              </p>
            </div>
            
            <div className="modal-footer" style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              
              <button 
                className="btn-primary"
                onClick={onViewApplications}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#1967d2',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#1557b0';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = '#1967d2';
                }}
              >
                Yes, see application
              </button>
            </div>
            
            <button 
              className="modal-close" 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1
              }}
              onMouseEnter={e => {
                e.target.style.color = '#374151';
              }}
              onMouseLeave={e => {
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
