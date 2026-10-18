import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      textColor: '#065f46',
      iconColor: '#10b981'
    },
    error: {
      icon: AlertCircle,
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      iconColor: '#ef4444'
    },
    info: {
      icon: Info,
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
      textColor: '#075985',
      iconColor: '#0ea5e9'
    }
  };

  const current = typeConfig[toast.type] || typeConfig.info;
  const IconComponent = current.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: current.bgColor,
        border: `1px solid ${current.borderColor}`,
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        color: current.textColor,
        maxWidth: '420px',
        animation: 'slideIn 0.25s ease-out',
        fontWeight: 500,
        fontSize: '0.9rem'
      }}
    >
      <IconComponent size={20} color={current.iconColor} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: current.textColor,
          opacity: 0.7,
          padding: '2px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
