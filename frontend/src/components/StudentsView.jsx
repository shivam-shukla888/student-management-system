import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Download, 
  RotateCcw, 
  Eye, 
  Edit2, 
  Trash2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  UserX,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';

export default function StudentsView({
  students,
  pagination,
  loading,
  filters,
  onFilterChange,
  coursesList = [],
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
  onExportCSV
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasActiveFilters = 
    Boolean(filters.search) || 
    (filters.course && filters.course !== 'All') || 
    (filters.status && filters.status !== 'All') ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      course: 'All',
      status: 'All',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1
    });
  };

  const handleSortToggle = (field) => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1
      });
    } else {
      onFilterChange({
        sortBy: field,
        sortOrder: 'asc',
        page: 1
      });
    }
  };

  return (
    <div className="students-view-container">
      {/* Search and Filter Control Bar */}
      <div className="filters-control-panel">
        <div className="filters-top-row">
          {/* Live Search Input */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, ID, email, or course..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              className="search-input"
              id="student-search-input"
              aria-label="Search student records"
            />
            {filters.search && (
              <button 
                onClick={() => onFilterChange({ search: '', page: 1 })}
                className="search-clear-btn"
                title="Clear search"
                aria-label="Clear search input"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="filter-actions-group">
            <button
              onClick={onExportCSV}
              className="btn-secondary"
              title="Export filtered records to CSV"
              id="btn-export-csv"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddStudent}
              className="btn-primary"
              id="btn-add-student-table"
            >
              <Plus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Second Row: Dropdown Filters & Sorting */}
        <div className="filters-bottom-row">
          <div className="dropdown-filter-group">
            <label htmlFor="filter-course-select" className="filter-label">
              <Layers size={14} /> Course:
            </label>
            <select
              id="filter-course-select"
              value={filters.course}
              onChange={(e) => onFilterChange({ course: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="All">All Courses & Departments</option>
              {coursesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-filter-group">
            <label htmlFor="filter-status-select" className="filter-label">
              <Filter size={14} /> Status:
            </label>
            <select
              id="filter-status-select"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          <div className="dropdown-filter-group">
            <label htmlFor="filter-sort-select" className="filter-label">
              <ArrowUpDown size={14} /> Sort By:
            </label>
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="created_at">Recently Added</option>
              <option value="full_name">Student Name (A-Z)</option>
              <option value="id">Student ID</option>
              <option value="enrollment_date">Enrollment Date</option>
              <option value="course">Course</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() => onFilterChange({ 
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc', 
                page: 1 
              })}
              className="btn-sort-direction"
              title={`Sorting ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
              aria-label="Toggle sort order"
            >
              {filters.sortOrder === 'asc' ? (
                <>
                  <ArrowUp size={14} /> <span>Asc</span>
                </>
              ) : (
                <>
                  <ArrowDown size={14} /> <span>Desc</span>
                </>
              )}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-reset-filters"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary line */}
      <div className="table-header-meta">
        <span className="results-counter">
          {loading ? (
            'Fetching records...'
          ) : (
            `Showing ${pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}–${Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )} of ${pagination.total} students`
          )}
        </span>
      </div>

      {/* Table Container */}
      <div className="table-card-wrapper">
        <div className="table-responsive">
          <table className="students-data-table" aria-label="Student records">
            <thead>
              <tr>
                <th onClick={() => handleSortToggle('full_name')} className="sortable-col">
                  <div className="th-content">
                    <span>Student Profile</span>
                    {filters.sortBy === 'full_name' && (
                      filters.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSortToggle('id')} className="sortable-col">
                  <div className="th-content">
                    <span>Student ID</span>
                    {filters.sortBy === 'id' && (
                      filters.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    )}
                  </div>
                </th>
                <th>Phone</th>
                <th onClick={() => handleSortToggle('course')} className="sortable-col">
                  <div className="th-content">
                    <span>Department / Course</span>
                    {filters.sortBy === 'course' && (
                      filters.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSortToggle('enrollment_date')} className="sortable-col">
                  <div className="th-content">
                    <span>Enrollment Date</span>
                    {filters.sortBy === 'enrollment_date' && (
                      filters.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSortToggle('status')} className="sortable-col">
                  <div className="th-content">
                    <span>Status</span>
                    {filters.sortBy === 'status' && (
                      filters.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    )}
                  </div>
                </th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="table-skeleton-row">
                    <td colSpan={7}>
                      <div className="skeleton-line" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} className="table-empty-cell">
                    <div className="table-empty-state">
                      <div className="empty-state-icon">
                        <UserX size={40} />
                      </div>
                      <h3>No Students Found</h3>
                      <p>
                        {hasActiveFilters
                          ? 'No student records match your current search and filter criteria.'
                          : 'There are currently no students registered in the system.'}
                      </p>
                      <div className="empty-actions">
                        {hasActiveFilters ? (
                          <button onClick={resetFilters} className="btn-secondary">
                            <RotateCcw size={16} />
                            <span>Reset Filters</span>
                          </button>
                        ) : (
                          <button onClick={onAddStudent} className="btn-primary">
                            <Plus size={16} />
                            <span>Enroll First Student</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const initials = student.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={student.id} className="student-table-row">
                      {/* Name & Email */}
                      <td>
                        <div className="student-cell-profile">
                          <div className="table-avatar">{initials}</div>
                          <div className="student-names">
                            <span className="student-full-name">{student.full_name}</span>
                            <span className="student-email">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Student ID with Copy */}
                      <td>
                        <div className="student-id-badge-wrap">
                          <span className="mono-id">{student.id}</span>
                          <button
                            onClick={() => handleCopyId(student.id)}
                            className="btn-copy-id"
                            title="Copy Student ID"
                            aria-label={`Copy student ID ${student.id}`}
                          >
                            {copiedId === student.id ? (
                              <Check size={14} color="#10b981" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <span className="student-phone-text">{student.phone}</span>
                      </td>

                      {/* Course */}
                      <td>
                        <span className="student-course-pill">{student.course}</span>
                      </td>

                      {/* Enrollment Date */}
                      <td>
                        <span className="student-date-text">{student.enrollment_date}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            student.status === 'Active' ? 'badge-active' : 'badge-inactive'
                          }`}
                        >
                          <span
                            className={`badge-dot ${
                              student.status === 'Active' ? 'badge-pulse' : ''
                            }`}
                          ></span>
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions-cell">
                          <button
                            onClick={() => onViewStudent(student)}
                            className="action-btn view-btn"
                            title="View Student Details"
                            aria-label={`View details of ${student.full_name}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="action-btn edit-btn"
                            title="Edit Student Record"
                            aria-label={`Edit ${student.full_name}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student)}
                            className="action-btn delete-btn"
                            title="Delete Student Record"
                            aria-label={`Delete ${student.full_name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && pagination.total > 0 && (
          <div className="pagination-bar">
            <div className="pagination-limit-select">
              <span>Rows per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  onFilterChange({ limit: parseInt(e.target.value, 10), page: 1 })
                }
                className="select-limit"
                aria-label="Rows per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => onFilterChange({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="btn-page-nav"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="pagination-pages-list">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and pages around current page
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="pagination-ellipsis">...</span>}
                        <button
                          onClick={() => onFilterChange({ page: p })}
                          className={`btn-page-num ${
                            p === pagination.page ? 'page-active' : ''
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => onFilterChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-page-nav"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
