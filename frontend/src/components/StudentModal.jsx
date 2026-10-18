import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, BookOpen, Calendar, CheckCircle, AlertCircle, Save, Plus } from 'lucide-react';

const STANDARD_COURSES = [
  'Computer Science',
  'Data Science & AI',
  'Cybersecurity',
  'Business Administration',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Biotechnology',
  'Information Technology',
  'Civil Engineering',
  'Finance & Accounting'
];

export default function StudentModal({
  isOpen,
  mode = 'add', // 'add' or 'edit'
  student = null,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors = []
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    course: STANDARD_COURSES[0],
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [customCourse, setCustomCourse] = useState(false);

  useEffect(() => {
    if (student && mode === 'edit') {
      const isKnown = STANDARD_COURSES.includes(student.course);
      setFormData({
        full_name: student.full_name || '',
        email: student.email || '',
        phone: student.phone || '',
        course: student.course || STANDARD_COURSES[0],
        enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
        status: student.status || 'Active'
      });
      setCustomCourse(!isKnown);
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        course: STANDARD_COURSES[0],
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      setCustomCourse(false);
    }
    setErrors({});
    setTouched({});
  }, [student, mode, isOpen]);

  // Sync server validation errors into field errors
  useEffect(() => {
    if (serverErrors && serverErrors.length > 0) {
      const fieldErrors = {};
      serverErrors.forEach((err) => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    let error = '';
    const trimmed = String(value || '').trim();

    if (name === 'full_name') {
      if (!trimmed) error = 'Full name is required';
      else if (trimmed.length < 2) error = 'Full name must be at least 2 characters';
      else if (trimmed.length > 100) error = 'Full name cannot exceed 100 characters';
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed) error = 'Email address is required';
      else if (!emailRegex.test(trimmed)) error = 'Please enter a valid email (e.g. name@college.edu)';
    }

    if (name === 'phone') {
      const phoneDigits = (trimmed.match(/\d/g) || []).length;
      if (!trimmed) error = 'Phone number is required';
      else if (phoneDigits < 7 || phoneDigits > 15) error = 'Phone must contain 7 to 15 digits';
    }

    if (name === 'course') {
      if (!trimmed) error = 'Course/Department is required';
      else if (trimmed.length < 2) error = 'Course name must be at least 2 characters';
    }

    if (name === 'enrollment_date') {
      if (!trimmed) error = 'Enrollment date is required';
      else if (isNaN(new Date(trimmed).getTime())) error = 'Invalid date';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        full_name: true,
        email: true,
        phone: true,
        course: true,
        enrollment_date: true,
        status: true
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              {mode === 'add' ? <Plus size={20} /> : <Save size={20} />}
            </div>
            <div>
              <h2 className="modal-title">
                {mode === 'add' ? 'Enroll New Student' : 'Edit Student Record'}
              </h2>
              <p className="modal-subtitle">
                {mode === 'add'
                  ? 'Complete the academic information below to register a new student.'
                  : `Updating profile information for ${student?.id}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="form-body">
            {/* Student ID info banner for Edit mode */}
            {mode === 'edit' && student && (
              <div className="form-info-banner">
                <span>Student ID:</span>
                <span className="mono-id">{student.id}</span>
                <span className="info-tag">(Permanent Identifier)</span>
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="student-full-name" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <div className="form-input-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="student-full-name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Eleanor Vance"
                  className={`form-input ${errors.full_name ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.full_name && (
                <div className="field-error-msg">
                  <AlertCircle size={14} />
                  <span>{errors.full_name}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="student-email" className="form-label">
                Email Address <span className="required-star">*</span>
              </label>
              <div className="form-input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="student-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. eleanor.vance@college.edu"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.email ? (
                <div className="field-error-msg">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              ) : (
                <span className="form-hint">Must be unique across all students.</span>
              )}
            </div>

            {/* Phone & Enrollment Date Row */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="student-phone" className="form-label">
                  Phone Number <span className="required-star">*</span>
                </label>
                <div className="form-input-wrap">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    id="student-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+1 (555) 000-0000"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {errors.phone && (
                  <div className="field-error-msg">
                    <AlertCircle size={14} />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="student-enrollment-date" className="form-label">
                  Enrollment Date <span className="required-star">*</span>
                </label>
                <div className="form-input-wrap">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    id="student-enrollment-date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.enrollment_date ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                {errors.enrollment_date && (
                  <div className="field-error-msg">
                    <AlertCircle size={14} />
                    <span>{errors.enrollment_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Course / Department */}
            <div className="form-group">
              <div className="form-label-with-action">
                <label htmlFor="student-course" className="form-label">
                  Academic Department / Course <span className="required-star">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomCourse(!customCourse)}
                  className="btn-toggle-custom"
                >
                  {customCourse ? 'Select from list' : '+ Enter custom department'}
                </button>
              </div>

              {customCourse ? (
                <div className="form-input-wrap">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    type="text"
                    id="student-course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Aerospace Engineering"
                    className={`form-input ${errors.course ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              ) : (
                <div className="form-input-wrap">
                  <BookOpen size={18} className="input-icon" />
                  <select
                    id="student-course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-select ${errors.course ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                    required
                  >
                    {STANDARD_COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {errors.course && (
                <div className="field-error-msg">
                  <AlertCircle size={14} />
                  <span>{errors.course}</span>
                </div>
              )}
            </div>

            {/* Status Radio Selection */}
            <div className="form-group">
              <label className="form-label">
                Enrollment Status <span className="required-star">*</span>
              </label>
              <div className="status-radio-group">
                <label className={`status-radio-card ${formData.status === 'Active' ? 'selected-active' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === 'Active'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <div className="radio-content">
                    <span className="badge badge-active">
                      <span className="badge-dot badge-pulse" /> Active
                    </span>
                    <span className="radio-desc">Currently enrolled and attending lectures</span>
                  </div>
                </label>

                <label className={`status-radio-card ${formData.status === 'Inactive' ? 'selected-inactive' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === 'Inactive'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <div className="radio-content">
                    <span className="badge badge-inactive">
                      <span className="badge-dot" /> Inactive
                    </span>
                    <span className="radio-desc">On leave, suspended, or completed coursework</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
              id="btn-submit-student"
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : mode === 'add' ? (
                <>
                  <Plus size={16} />
                  <span>Enroll Student</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
