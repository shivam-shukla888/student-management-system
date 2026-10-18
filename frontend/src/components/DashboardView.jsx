import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  ArrowUpRight, 
  Clock, 
  Eye, 
  BookOpen, 
  Plus, 
  ChevronRight 
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  loading, 
  onViewStudent, 
  onNavigateToStudents, 
  onAddStudent 
}) {
  if (loading && !stats) {
    return (
      <div className="dashboard-loading-skeleton">
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
        <div className="skeleton-content-row">
          <div className="skeleton-box large" />
          <div className="skeleton-box medium" />
        </div>
      </div>
    );
  }

  const {
    totalStudents = 0,
    activeStudents = 0,
    inactiveStudents = 0,
    totalCourses = 0,
    courseDistribution = [],
    recentStudents = []
  } = stats || {};

  const activeRate = totalStudents > 0 
    ? Math.round((activeStudents / totalStudents) * 100) 
    : 0;

  return (
    <div className="dashboard-view-content">
      {/* Top Banner / Welcome Callout */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-banner-text">
          <h2>Academic Management Overview</h2>
          <p>
            Welcome to the centralized student administration portal. Monitor student admissions, 
            academic statuses, and departmental distributions in real-time.
          </p>
        </div>
        <div className="welcome-banner-actions">
          <button onClick={onAddStudent} className="btn-banner-primary">
            <Plus size={16} />
            <span>Enroll New Student</span>
          </button>
          <button onClick={onNavigateToStudents} className="btn-banner-secondary">
            <span>Browse Directory</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-cards-grid">
        {/* Card 1: Total Students */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Enrolled Students</span>
            <div className="stat-icon-wrap icon-blue">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-meta">
            <span className="stat-meta-badge positive">
              <ArrowUpRight size={14} /> 100%
            </span>
            <span className="stat-meta-text">Registered records</span>
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Students</span>
            <div className="stat-icon-wrap icon-green">
              <UserCheck size={22} />
            </div>
          </div>
          <div className="stat-value">{activeStudents}</div>
          <div className="stat-meta">
            <span className="stat-meta-badge positive">
              {activeRate}%
            </span>
            <span className="stat-meta-text">Active enrollment rate</span>
          </div>
        </div>

        {/* Card 3: Inactive Students */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Inactive / On Leave</span>
            <div className="stat-icon-wrap icon-amber">
              <UserX size={22} />
            </div>
          </div>
          <div className="stat-value">{inactiveStudents}</div>
          <div className="stat-meta">
            <span className="stat-meta-badge neutral">
              {totalStudents > 0 ? 100 - activeRate : 0}%
            </span>
            <span className="stat-meta-text">Inactive or alumni</span>
          </div>
        </div>

        {/* Card 4: Total Courses */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Academic Programs</span>
            <div className="stat-icon-wrap icon-purple">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="stat-value">{totalCourses}</div>
          <div className="stat-meta">
            <span className="stat-meta-badge info">
              Distinct
            </span>
            <span className="stat-meta-text">Specialized departments</span>
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Course Distribution & Recent Students */}
      <div className="dashboard-content-split">
        {/* Left Column: Department Breakdown */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <BookOpen size={20} className="panel-icon" />
              <h3>Course & Department Distribution</h3>
            </div>
            <span className="panel-counter-badge">{courseDistribution.length} Courses</span>
          </div>

          <div className="course-distribution-list">
            {courseDistribution.length === 0 ? (
              <div className="empty-panel-text">No courses recorded yet.</div>
            ) : (
              courseDistribution.map((item, idx) => {
                const percentage = totalStudents > 0 
                  ? Math.round((item.count / totalStudents) * 100) 
                  : 0;

                // Color accents for progress bars
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={item.course} className="distribution-item">
                    <div className="dist-item-header">
                      <span className="dist-course-name">{item.course}</span>
                      <div className="dist-counts">
                        <span className="dist-count-num">{item.count} {item.count === 1 ? 'student' : 'students'}</span>
                        <span className="dist-percent">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="dist-progress-track">
                      <div 
                        className="dist-progress-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: barColor 
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recently Added Students */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Clock size={20} className="panel-icon" />
              <h3>Recently Enrolled Students</h3>
            </div>
            <button 
              onClick={onNavigateToStudents}
              className="panel-view-all-link"
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="recent-students-list">
            {recentStudents.length === 0 ? (
              <div className="empty-panel-text">No recently added students.</div>
            ) : (
              recentStudents.map((student) => {
                const initials = student.full_name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div key={student.id} className="recent-student-row">
                    <div className="recent-student-avatar">
                      {initials}
                    </div>
                    <div className="recent-student-details">
                      <div className="recent-student-top">
                        <span className="recent-student-name">{student.full_name}</span>
                        <span className={`badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                          <span className={`badge-dot ${student.status === 'Active' ? 'badge-pulse' : ''}`}></span>
                          {student.status}
                        </span>
                      </div>
                      <div className="recent-student-bottom">
                        <span className="mono-id">{student.id}</span>
                        <span className="recent-bullet">•</span>
                        <span className="recent-course">{student.course}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewStudent(student)}
                      className="btn-icon-subtle"
                      title="View Student Profile"
                      aria-label={`View profile of ${student.full_name}`}
                    >
                      <Eye size={17} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
