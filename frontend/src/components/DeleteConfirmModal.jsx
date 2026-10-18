import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  student,
  onClose,
  onConfirm,
  isDeleting
}) {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog delete-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-head">
          <div className="delete-warning-icon-box">
            <AlertTriangle size={28} color="#dc2626" />
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h2 className="delete-title">Confirm Student Deletion</h2>
          <p className="delete-warning-text">
            Are you sure you want to permanently remove this student record from the institution database?
            This operation cannot be reversed.
          </p>

          <div className="delete-target-card">
            <div className="target-name">{student.full_name}</div>
            <div className="target-meta">
              <span className="mono-id">{student.id}</span>
              <span className="bullet-sep">•</span>
              <span className="target-course">{student.course}</span>
            </div>
            <div className="target-email">{student.email}</div>
          </div>
        </div>

        <div className="delete-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-confirm-delete"
            disabled={isDeleting}
            id="btn-confirm-delete-action"
          >
            {isDeleting ? (
              <>
                <span className="btn-spinner" />
                <span>Deleting Record...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Confirm Deletion</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
