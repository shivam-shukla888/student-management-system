import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import StudentsView from './components/StudentsView';
import DepartmentsView from './components/DepartmentsView';
import SystemView from './components/SystemView';
import StudentModal from './components/StudentModal';
import StudentDetailsModal from './components/StudentDetailsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import './App.css';

export default function App() {
  // Navigation & Layout
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // System & Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Students Table & Filters
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    search: '',
    course: 'All',
    status: 'All',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  // Modal Controls
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch Dashboard Stats
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.getStats();
      if (res && res.success) {
        setStats(res.data);
        setApiHealthy(true);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setApiHealthy(false);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Students with current filters
  const loadStudents = useCallback(async (currentFilters = filters) => {
    try {
      setLoadingStudents(true);
      const res = await api.getStudents(currentFilters);
      if (res && res.success) {
        setStudents(res.data);
        setPagination(res.pagination);
        setApiHealthy(true);
      }
    } catch (err) {
      console.error('Error fetching student list:', err);
      setApiHealthy(false);
      showToast(err.message || 'Failed to load students. Please verify backend is running.', 'error');
    } finally {
      setLoadingStudents(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadStats();
    loadStudents();
  }, []);

  // When filters change, refetch
  const handleFilterChange = (updates) => {
    const updatedFilters = { ...filters, ...updates };
    setFilters(updatedFilters);
    loadStudents(updatedFilters);
  };

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStats(), loadStudents()]);
    setIsRefreshing(false);
    showToast('Dashboard data refreshed successfully.', 'info');
  };

  // Open Add Student Modal
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setModalMode('add');
    setServerErrors([]);
    setIsStudentModalOpen(true);
  };

  // Open Edit Student Modal
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setModalMode('edit');
    setServerErrors([]);
    setIsStudentModalOpen(true);
  };

  // Open View Details Modal
  const handleOpenDetailsModal = (student) => {
    setViewingStudent(student);
    setDetailsModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (student) => {
    setDeletingStudent(student);
    setDeleteModalOpen(true);
  };

  // Submit Student Form (Add or Edit)
  const handleStudentSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerErrors([]);

    try {
      if (modalMode === 'add') {
        const res = await api.createStudent(formData);
        showToast(`Student "${res.data.full_name}" registered successfully with ID ${res.data.id}!`, 'success');
      } else {
        const res = await api.updateStudent(editingStudent.id, formData);
        showToast(`Student "${res.data.full_name}" (${res.data.id}) updated successfully!`, 'success');
        
        // Update viewingStudent if open
        if (viewingStudent && viewingStudent.id === editingStudent.id) {
          setViewingStudent(res.data);
        }
      }

      setIsStudentModalOpen(false);
      await Promise.all([loadStats(), loadStudents()]);
    } catch (err) {
      console.error('Error saving student:', err);
      if (err.details) {
        setServerErrors(err.details);
      }
      showToast(err.message || 'An error occurred while saving student.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Student
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);

    try {
      await api.deleteStudent(deletingStudent.id);
      showToast(`Student "${deletingStudent.full_name}" (${deletingStudent.id}) was permanently deleted.`, 'success');
      setDeleteModalOpen(false);
      setDeletingStudent(null);

      // Close details modal if open on the deleted student
      if (viewingStudent && viewingStudent.id === deletingStudent.id) {
        setDetailsModalOpen(false);
        setViewingStudent(null);
      }

      await Promise.all([loadStats(), loadStudents()]);
    } catch (err) {
      console.error('Error deleting student:', err);
      showToast(err.message || 'Failed to delete student record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter by department from Departments view or Dashboard
  const handleFilterByDepartment = (deptName) => {
    const updatedFilters = {
      ...filters,
      course: deptName,
      search: '',
      status: 'All',
      page: 1
    };
    setFilters(updatedFilters);
    setCurrentView('students');
    loadStudents(updatedFilters);
  };

  // Export filtered records to CSV
  const handleExportCSV = async () => {
    try {
      showToast('Generating CSV export...', 'info');
      // Fetch all matching records without pagination limit for complete export
      const exportParams = { ...filters, page: 1, limit: 500 };
      const res = await api.getStudents(exportParams);
      const dataToExport = res?.data || students;

      if (!dataToExport || dataToExport.length === 0) {
        showToast('No student records available to export.', 'info');
        return;
      }

      const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Course/Department', 'Enrollment Date', 'Status', 'Registered At'];
      const csvRows = [headers.join(',')];

      dataToExport.forEach((s) => {
        const row = [
          `"${s.id || ''}"`,
          `"${(s.full_name || '').replace(/"/g, '""')}"`,
          `"${(s.email || '').replace(/"/g, '""')}"`,
          `"${(s.phone || '').replace(/"/g, '""')}"`,
          `"${(s.course || '').replace(/"/g, '""')}"`,
          `"${s.enrollment_date || ''}"`,
          `"${s.status || ''}"`,
          `"${s.created_at || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(csvBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast(`Exported ${dataToExport.length} student records to CSV!`, 'success');
    } catch (err) {
      console.error('Error generating CSV:', err);
      showToast('Failed to export CSV. Please try again.', 'error');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Body */}
      <div className="app-main">
        {/* Header Bar */}
        <Header
          currentView={currentView}
          onAddStudent={handleOpenAddModal}
          apiHealthy={apiHealthy}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshAll}
          setMobileOpen={setMobileOpen}
        />

        {/* View Router */}
        <main className="app-view-container">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              loading={loadingStats}
              onViewStudent={handleOpenDetailsModal}
              onNavigateToStudents={() => setCurrentView('students')}
              onAddStudent={handleOpenAddModal}
            />
          )}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              pagination={pagination}
              loading={loadingStudents}
              filters={filters}
              onFilterChange={handleFilterChange}
              coursesList={stats?.coursesList || []}
              onViewStudent={handleOpenDetailsModal}
              onEditStudent={handleOpenEditModal}
              onDeleteStudent={handleOpenDeleteModal}
              onAddStudent={handleOpenAddModal}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentView === 'departments' && (
            <DepartmentsView
              stats={stats}
              onFilterByDepartment={handleFilterByDepartment}
            />
          )}

          {currentView === 'system' && (
            <SystemView
              apiHealthy={apiHealthy}
              onRefreshAll={handleRefreshAll}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        mode={modalMode}
        student={editingStudent}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleStudentSubmit}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={detailsModalOpen}
        student={viewingStudent}
        onClose={() => setDetailsModalOpen(false)}
        onEdit={(student) => {
          setDetailsModalOpen(false);
          handleOpenEditModal(student);
        }}
        onDelete={(student) => {
          setDetailsModalOpen(false);
          handleOpenDeleteModal(student);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        student={deletingStudent}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
