const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let dbInstance = null;

/**
 * Initialize or get SQLite database instance
 * @param {string} [customPath] - Optional override path (e.g. for testing in memory or temp db)
 * @returns {Database.Database}
 */
function getDatabase(customPath) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbFilePath = customPath || config.dbPath;

  if (dbFilePath !== ':memory:') {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbFilePath, {
    verbose: config.nodeEnv === 'development' && process.env.DEBUG_SQL === 'true' ? console.log : null
  });

  // Enable WAL mode for better concurrency and performance
  if (dbFilePath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');

  // Initialize schema
  initializeSchema(db);

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

/**
 * Creates tables and indexes if they do not exist
 * @param {Database.Database} db
 */
function initializeSchema(db) {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      phone TEXT NOT NULL,
      course TEXT NOT NULL,
      enrollment_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
      created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
      updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
    CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
    CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
    CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
  `;

  db.exec(schemaSQL);
}

/**
 * Generates a unique, standardized Student ID (e.g., STU-2026-0001)
 * @param {Database.Database} db
 * @returns {string}
 */
function generateStudentId(db) {
  const currentYear = new Date().getFullYear();
  const prefix = `STU-${currentYear}-`;

  // Find the highest sequence number for this year
  const stmt = db.prepare(`
    SELECT id FROM students 
    WHERE id LIKE ? 
    ORDER BY id DESC 
    LIMIT 1
  `);

  const lastRecord = stmt.get(`${prefix}%`);
  let nextSeq = 1;

  if (lastRecord && lastRecord.id) {
    const parts = lastRecord.id.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  }

  // Check if ID already exists (in case of manual inserts) and increment if needed
  let candidateId = `${prefix}${String(nextSeq).padStart(4, '0')}`;
  const existsStmt = db.prepare('SELECT 1 FROM students WHERE id = ?');
  
  while (existsStmt.get(candidateId)) {
    nextSeq += 1;
    candidateId = `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  return candidateId;
}

function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  initializeSchema,
  generateStudentId,
  closeDatabase
};
