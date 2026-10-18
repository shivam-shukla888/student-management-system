import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Clock, 
  Edit2, 
  Trash2,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

export default function StudentDetailsModal({
  isOpen,
  student,
  onClose,
  onEdit,
  onDelete
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(student.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = student.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog details-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header with Background Gradient */}
        <div className="details-header-card">
          <button onClick={onClose} className="details-close-btn" aria-label="Close details">
            <X size={20} />
          </button>

          <div className="details-profile-head">
            <div className="details-avatar">{initials}</div>
            <div className="details-title-info">
              <h2 className="details-name">{student.full_name}</h2>
              <div className="details-id-row">
                <span className="mono-id details-mono">{student.id}</span>
                <button 
                  onClick={handleCopyId} 
                  className="details-copy-btn"
                  title="Copy Student ID"
                  aria-label="Copy student ID"
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>
            </div>
            <div className="details-status-badge">
              <span className={`badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                <span className={`badge-dot ${student.status === 'Active' ? 'badge-pulse' : ''}`} />
                {student.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid Body */}
        <div className="details-body">
          <div className="details-section-title">ACADEMIC & CONTACT INFORMATION</div>
          <div className="details-grid-2">
            <div className="details-info-item">
              <div className="info-item-icon">
                <BookOpen size={18} color="#2563eb" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Major / Department</span>
                <span className="info-value font-medium">{student.course}</span>
              </div>
            </div>

            <div className="details-info-item">
              <div className="info-item-icon">
                <Calendar size={18} color="#2563eb" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Date of Enrollment</span>
                <span className="info-value">{student.enrollment_date}</span>
              </div>
            </div>

            <div className="details-info-item">
              <div className="info-item-icon">
                <Mail size={18} color="#2563eb" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Official Email Address</span>
                <a href={`mailto:${student.email}`} className="info-value info-link">
                  {student.email}
                </a>
              </div>
            </div>

            <div className="details-info-item">
              <div className="info-item-icon">
                <Phone size={18} color="#2563eb" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Primary Phone Contact</span>
                <a href={`tel:${student.phone}`} className="info-value info-link">
                  {student.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="details-section-title">METADATA & AUDIT LOG</div>
          <div className="details-grid-2">
            <div className="details-info-item subtle">
              <div className="info-item-icon">
                <Clock size={16} color="#64748b" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Created In System</span>
                <span className="info-value text-muted">{student.created_at || 'N/A'}</span>
              </div>
            </div>

            <div className="details-info-item subtle">
              <div className="info-item-icon">
                <Clock size={16} color="#64748b" />
              </div>
              <div className="info-item-text">
                <span className="info-label">Last Record Modification</span>
                <span className="info-value text-muted">{student.updated_at || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="details-footer">
          <button
            onClick={() => {
              onClose();
              onDelete(student);
            }}
            className="btn-delete-record"
            id="btn-details-delete"
          >
            <Trash2 size={16} />
            <span>Delete Student</span>
          </button>

          <div className="details-right-actions">
            <button onClick={onClose} className="btn-cancel">
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="btn-primary"
              id="btn-details-edit"
            >
              <Edit2 size={16} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
