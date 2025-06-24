import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

export default function Modal({ open, onClose, title, children, footer }) {
  if (typeof window === "undefined") return null; // SSR guard

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && <div className="modal-header"><h3>{title}</h3></div>}
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
            <button className="modal-close" onClick={onClose}>×</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
} 