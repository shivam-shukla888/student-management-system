import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Activity, 
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, stats, mobileOpen, setMobileOpen }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      badge: stats ? stats.totalStudents : null
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: BookOpen,
      badge: stats ? stats.totalCourses : null
    },
    {
      id: 'system',
      label: 'System & API',
      icon: Activity,
      badge: 'Live'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <GraduationCap size={24} className="brand-logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">EduTrack</span>
            <span className="brand-subtitle">Student Portal</span>
          </div>

          <button 
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Academic Session Badge */}
        <div className="academic-session-card">
          <div className="session-indicator">
            <span className="session-dot"></span>
            <span className="session-label">Session 2025–2026</span>
          </div>
          <span className="session-sub">Semester 2 • Fall</span>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">MAIN MENU</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileOpen(false);
                    }}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="nav-link-left">
                      <Icon size={19} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={`nav-badge ${isActive ? 'badge-on-active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer info */}
        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <div className="admin-info">
              <span className="admin-name">Academic Admin</span>
              <span className="admin-role">System Administrator</span>
            </div>
          </div>
          <div className="version-tag">Version 1.0.0 • SQLite</div>
        </div>
      </aside>
    </>
  );
}
