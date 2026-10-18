import React from 'react';
import { BookOpen, Users, UserCheck, ArrowRight, Award } from 'lucide-react';

export default function DepartmentsView({ stats, onFilterByDepartment }) {
  const courseDistribution = stats?.courseDistribution || [];
  const totalStudents = stats?.totalStudents || 0;

  return (
    <div className="departments-view-container">
      <div className="departments-header-card">
        <div className="dept-header-info">
          <h2>Academic Departments & Programs</h2>
          <p>
            Detailed overview of academic majors, active enrollment quotas, and departmental 
            capacity across all recognized curriculum tracks.
          </p>
        </div>
        <div className="dept-summary-chip">
          <Award size={20} color="#3b82f6" />
          <span>{courseDistribution.length} Certified Academic Departments</span>
        </div>
      </div>

      <div className="departments-grid">
        {courseDistribution.length === 0 ? (
          <div className="departments-empty">
            <BookOpen size={48} color="#94a3b8" />
            <h3>No Academic Programs Registered</h3>
            <p>Enroll students into courses to automatically track departmental records.</p>
          </div>
        ) : (
          courseDistribution.map((dept, index) => {
            const share = totalStudents > 0 
              ? Math.round((dept.count / totalStudents) * 100) 
              : 0;

            return (
              <div key={dept.course} className="department-card">
                <div className="dept-card-top">
                  <div className="dept-icon-box">
                    <BookOpen size={22} color="#2563eb" />
                  </div>
                  <span className="dept-share-tag">{share}% of student body</span>
                </div>

                <h3 className="dept-name">{dept.course}</h3>

                <div className="dept-metrics-row">
                  <div className="dept-metric">
                    <Users size={16} className="metric-icon" />
                    <div>
                      <span className="metric-val">{dept.count}</span>
                      <span className="metric-lbl">Total Students</span>
                    </div>
                  </div>
                </div>

                <div className="dept-progress-wrap">
                  <div className="dept-progress-bar">
                    <div 
                      className="dept-progress-inner" 
                      style={{ width: `${Math.max(10, share)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onFilterByDepartment(dept.course)}
                  className="dept-action-btn"
                >
                  <span>View Department Students</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
