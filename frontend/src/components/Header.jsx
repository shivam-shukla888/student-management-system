import React from 'react';
import { Menu, Plus, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({ 
  currentView, 
  onAddStudent, 
  apiHealthy, 
  isRefreshing, 
  onRefresh, 
  setMobileOpen 
}) {
  const viewTitles = {
    dashboard: {
      title: 'Institutional Dashboard',
      subtitle: 'Overview of academic enrollments, student demographics, and analytics'
    },
    students: {
      title: 'Student Directory',
      subtitle: 'Comprehensive student records, search, filters, and profile management'
    },
    departments: {
      title: 'Departments & Programs',
      subtitle: 'Academic disciplines and department-wise enrollment statistics'
    },
    system: {
      title: 'System Diagnostics & API',
      subtitle: 'Server health, SQLite database metrics, and REST endpoint status'
    }
  };

  const currentInfo = viewTitles[currentView] || viewTitles.dashboard;

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-titles">
          <h1 className="page-main-title">{currentInfo.title}</h1>
          <p className="page-main-subtitle">{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* API Health Status Badge */}
        <div className={`api-status-badge ${apiHealthy ? 'status-online' : 'status-offline'}`}>
          {apiHealthy ? (
            <>
              <span className="status-ping"></span>
              <CheckCircle2 size={15} />
              <span>API Online</span>
            </>
          ) : (
            <>
              <AlertTriangle size={15} />
              <span>API Offline</span>
            </>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}
          title="Refresh Data"
          aria-label="Refresh data"
          disabled={isRefreshing}
        >
          <RefreshCw size={18} />
        </button>

        {/* Add Student Primary CTA */}
        <button
          onClick={onAddStudent}
          className="btn-primary"
          id="btn-open-add-student"
        >
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>
    </header>
  );
}
