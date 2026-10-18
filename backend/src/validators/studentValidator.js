/**
 * Student Validation and Sanitization Module
 * Implements strict type checking, regex normalization, and boundary enforcement
 */

// Simplified RFC 5322 email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// E.164-compatible phone character regex (7 to 15 digits)
const PHONE_CHARS_REGEX = /^[0-9+\-()\s.]+$/;

// Standard ISO date pattern YYYY-MM-DD
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Valid student ID pattern: STU-YYYY-XXXX (e.g., STU-2026-0001) or alphanumeric identifier (3 to 30 chars)
const STUDENT_ID_REGEX = /^[A-Za-z0-9\-_]{3,30}$/;

// Disallow dangerous script injection or tag patterns in text fields
const SCRIPT_INJECTION_REGEX = /<[^>]*>|javascript:|data:/i;

/**
 * Validates a student ID parameter
 * @param {string} id
 * @returns {boolean}
 */
function isValidStudentId(id) {
  if (!id || typeof id !== 'string') return false;
  return STUDENT_ID_REGEX.test(id.trim());
}

/**
 * Validates a calendar date for real calendar existence (prevents Feb 30, etc.)
 * @param {string} dateStr YYYY-MM-DD
 * @returns {boolean}
 */
function isValidCalendarDate(dateStr) {
  if (!DATE_REGEX.test(dateStr)) return false;
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/**
 * Validates and normalizes student payload
 * @param {object} data
 * @param {boolean} [isUpdate=false]
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }>, sanitized: object }}
 */
function validateStudent(data, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Request payload must be a valid JSON object' }],
      sanitized: {}
    };
  }

  // full_name
  if (data.full_name !== undefined || !isUpdate) {
    if (!data.full_name || typeof data.full_name !== 'string') {
      errors.push({ field: 'full_name', message: 'Full name is required and must be text.' });
    } else {
      const trimmed = data.full_name.trim();
      if (trimmed.length < 2) {
        errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters.' });
      } else if (trimmed.length > 100) {
        errors.push({ field: 'full_name', message: 'Full name cannot exceed 100 characters.' });
      } else if (SCRIPT_INJECTION_REGEX.test(trimmed)) {
        errors.push({ field: 'full_name', message: 'Full name contains prohibited HTML or script characters.' });
      } else {
        sanitized.full_name = trimmed;
      }
    }
  }

  // email
  if (data.email !== undefined || !isUpdate) {
    if (!data.email || typeof data.email !== 'string') {
      errors.push({ field: 'email', message: 'Email address is required.' });
    } else {
      const trimmed = data.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmed)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address (e.g. name@college.edu).' });
      } else if (trimmed.length > 120) {
        errors.push({ field: 'email', message: 'Email address cannot exceed 120 characters.' });
      } else if (SCRIPT_INJECTION_REGEX.test(trimmed)) {
        errors.push({ field: 'email', message: 'Email address contains invalid characters.' });
      } else {
        sanitized.email = trimmed;
      }
    }
  }

  // phone
  if (data.phone !== undefined || !isUpdate) {
    if (!data.phone || typeof data.phone !== 'string') {
      errors.push({ field: 'phone', message: 'Phone number is required.' });
    } else {
      const trimmed = data.phone.trim();
      const digitCount = (trimmed.match(/\d/g) || []).length;
      if (!PHONE_CHARS_REGEX.test(trimmed) || digitCount < 7 || digitCount > 15) {
        errors.push({ field: 'phone', message: 'Phone number must contain 7 to 15 digits (e.g. +1 (555) 000-0000).' });
      } else if (SCRIPT_INJECTION_REGEX.test(trimmed)) {
        errors.push({ field: 'phone', message: 'Phone number contains invalid characters.' });
      } else {
        sanitized.phone = trimmed;
      }
    }
  }

  // course
  if (data.course !== undefined || !isUpdate) {
    if (!data.course || typeof data.course !== 'string') {
      errors.push({ field: 'course', message: 'Academic Department / Course is required.' });
    } else {
      const trimmed = data.course.trim();
      if (trimmed.length < 2) {
        errors.push({ field: 'course', message: 'Course name must be at least 2 characters.' });
      } else if (trimmed.length > 100) {
        errors.push({ field: 'course', message: 'Course name cannot exceed 100 characters.' });
      } else if (SCRIPT_INJECTION_REGEX.test(trimmed)) {
        errors.push({ field: 'course', message: 'Course name contains prohibited characters.' });
      } else {
        sanitized.course = trimmed;
      }
    }
  }

  // enrollment_date
  if (data.enrollment_date !== undefined || !isUpdate) {
    if (!data.enrollment_date || typeof data.enrollment_date !== 'string') {
      errors.push({ field: 'enrollment_date', message: 'Enrollment date is required.' });
    } else {
      const trimmed = data.enrollment_date.trim();
      if (!isValidCalendarDate(trimmed)) {
        errors.push({ field: 'enrollment_date', message: 'Enrollment date must be a valid calendar date in YYYY-MM-DD format.' });
      } else {
        sanitized.enrollment_date = trimmed;
      }
    }
  }

  // status
  if (data.status !== undefined || !isUpdate) {
    if (!data.status || !['Active', 'Inactive'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status must be either "Active" or "Inactive".' });
    } else {
      sanitized.status = data.status;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

module.exports = {
  validateStudent,
  isValidStudentId,
  isValidCalendarDate,
  EMAIL_REGEX,
  STUDENT_ID_REGEX
};
