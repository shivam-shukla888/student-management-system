const { getDatabase, generateStudentId } = require('../db/database');
const { validateStudent, isValidStudentId } = require('../validators/studentValidator');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/health
 */
function getHealth(req, res) {
  const db = getDatabase();
  let dbStatus = 'healthy';
  try {
    db.prepare('SELECT 1').get();
  } catch (e) {
    dbStatus = 'unhealthy';
  }

  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Student Management System API',
    database: dbStatus,
    version: '1.0.0'
  });
}

/**
 * GET /api/students
 * Query parameters:
 *  - search: string (matches name, email, student ID, course)
 *  - course: string (exact match)
 *  - status: 'Active' | 'Inactive'
 *  - sortBy: 'full_name' | 'email' | 'course' | 'enrollment_date' | 'status' | 'id' | 'created_at'
 *  - sortOrder: 'asc' | 'desc'
 *  - page: number (default 1)
 *  - limit: number (default 10, max 100)
 */
function getStudents(req, res, next) {
  try {
    const db = getDatabase();
    const {
      search = '',
      course = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const parsedPage = Math.min(10000, Math.max(1, parseInt(page, 10) || 1));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    // Strict whitelist of allowable sort columns to prevent SQL injection
    const allowedSortFields = {
      id: 'id',
      full_name: 'full_name',
      name: 'full_name',
      email: 'email',
      course: 'course',
      enrollment_date: 'enrollment_date',
      date: 'enrollment_date',
      status: 'status',
      created_at: 'created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'created_at';
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    // Search filter across ID, full_name, email, and course
    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedSearch = search.trim().slice(0, 100);
      const term = `%${sanitizedSearch}%`;
      conditions.push('(id LIKE ? OR full_name LIKE ? OR email LIKE ? OR course LIKE ?)');
      params.push(term, term, term, term);
    }

    // Specific Course filter
    if (course && typeof course === 'string' && course.trim() !== '' && course !== 'All') {
      const sanitizedCourse = course.trim().slice(0, 100);
      conditions.push('course = ?');
      params.push(sanitizedCourse);
    }

    // Specific Status filter
    if (status && ['Active', 'Inactive'].includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countQuery = `SELECT COUNT(*) as total FROM students ${whereClause}`;
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult ? totalResult.total : 0;
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    // Fetch paginated records with parameterized limit and offset
    const dataQuery = `
      SELECT id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at
      FROM students
      ${whereClause}
      ORDER BY ${sortColumn} ${direction}
      LIMIT ? OFFSET ?
    `;

    const students = db.prepare(dataQuery).all(...params, parsedLimit, offset);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/students/:id
 */
function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidStudentId(id)) {
      throw new AppError('Invalid student ID format provided.', 400);
    }

    const db = getDatabase();
    const student = db.prepare(`
      SELECT id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at
      FROM students
      WHERE id = ?
    `).get(id);

    if (!student) {
      throw new AppError(`Student with ID "${id}" was not found.`, 404);
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/students
 */
function createStudent(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateStudent(req.body, false);

    if (!isValid) {
      throw new AppError('Validation failed. Please correct the highlighted errors.', 400, errors);
    }

    const db = getDatabase();

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM students WHERE email = ?').get(sanitized.email);
    if (existing) {
      throw new AppError(
        `A student with email "${sanitized.email}" already exists.`,
        409,
        [{ field: 'email', message: 'Email address is already in use by another student.' }]
      );
    }

    const studentId = generateStudentId(db);

    const insertStmt = db.prepare(`
      INSERT INTO students (id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
    `);

    insertStmt.run(
      studentId,
      sanitized.full_name,
      sanitized.email,
      sanitized.phone,
      sanitized.course,
      sanitized.enrollment_date,
      sanitized.status
    );

    const createdStudent = db.prepare(`
      SELECT id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at
      FROM students
      WHERE id = ?
    `).get(studentId);

    res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: createdStudent
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/students/:id
 */
function updateStudent(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidStudentId(id)) {
      throw new AppError('Invalid student ID format provided.', 400);
    }

    const db = getDatabase();

    // Check student existence
    const current = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!current) {
      throw new AppError(`Student with ID "${id}" was not found.`, 404);
    }

    const { isValid, errors, sanitized } = validateStudent(req.body, false);
    if (!isValid) {
      throw new AppError('Validation failed. Please correct the highlighted errors.', 400, errors);
    }

    // Check duplicate email for another student
    if (sanitized.email && sanitized.email !== current.email.toLowerCase()) {
      const emailConflict = db.prepare('SELECT id FROM students WHERE email = ? AND id != ?').get(sanitized.email, id);
      if (emailConflict) {
        throw new AppError(
          `A student with email "${sanitized.email}" already exists.`,
          409,
          [{ field: 'email', message: 'Email address is already in use by another student.' }]
        );
      }
    }

    const updateStmt = db.prepare(`
      UPDATE students
      SET full_name = ?,
          email = ?,
          phone = ?,
          course = ?,
          enrollment_date = ?,
          status = ?,
          updated_at = DATETIME('now')
      WHERE id = ?
    `);

    updateStmt.run(
      sanitized.full_name,
      sanitized.email,
      sanitized.phone,
      sanitized.course,
      sanitized.enrollment_date,
      sanitized.status,
      id
    );

    const updatedStudent = db.prepare(`
      SELECT id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at
      FROM students
      WHERE id = ?
    `).get(id);

    res.status(200).json({
      success: true,
      message: 'Student details updated successfully.',
      data: updatedStudent
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/students/:id
 */
function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidStudentId(id)) {
      throw new AppError('Invalid student ID format provided.', 400);
    }

    const db = getDatabase();
    const current = db.prepare('SELECT id, full_name FROM students WHERE id = ?').get(id);
    if (!current) {
      throw new AppError(`Student with ID "${id}" was not found.`, 404);
    }

    db.prepare('DELETE FROM students WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: `Student "${current.full_name}" (${id}) deleted successfully.`,
      data: { id }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/stats
 */
function getDashboardStats(req, res, next) {
  try {
    const db = getDatabase();

    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const activeStudents = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'Active'").get().count;
    const inactiveStudents = totalStudents - activeStudents;
    const totalCourses = db.prepare('SELECT COUNT(DISTINCT course) as count FROM students').get().count;

    const coursesList = db.prepare('SELECT DISTINCT course FROM students ORDER BY course ASC')
      .all()
      .map(r => r.course);

    const courseDistribution = db.prepare(`
      SELECT course, COUNT(*) as count 
      FROM students 
      GROUP BY course 
      ORDER BY count DESC
    `).all();

    const recentStudents = db.prepare(`
      SELECT id, full_name, email, course, enrollment_date, status, created_at
      FROM students
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalCourses,
        coursesList,
        courseDistribution,
        recentStudents
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats
};
