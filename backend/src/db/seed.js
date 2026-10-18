const { getDatabase, generateStudentId } = require('./database');

const DEMO_STUDENTS = [
  {
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.edu',
    phone: '+1 (555) 234-5678',
    course: 'Computer Science',
    enrollment_date: '2025-08-15',
    status: 'Active'
  },
  {
    full_name: 'Sophia Chen',
    email: 'sophia.chen@example.edu',
    phone: '+1 (555) 345-6789',
    course: 'Data Science & AI',
    enrollment_date: '2025-09-01',
    status: 'Active'
  },
  {
    full_name: 'Marcus Johnson',
    email: 'marcus.j@example.edu',
    phone: '+1 (555) 456-7890',
    course: 'Cybersecurity',
    enrollment_date: '2025-09-10',
    status: 'Active'
  },
  {
    full_name: 'Elena Rostova',
    email: 'elena.rostova@example.edu',
    phone: '+1 (555) 567-8901',
    course: 'Business Administration',
    enrollment_date: '2025-01-20',
    status: 'Active'
  },
  {
    full_name: 'David Kim',
    email: 'david.kim@example.edu',
    phone: '+1 (555) 678-9012',
    course: 'Mechanical Engineering',
    enrollment_date: '2024-08-25',
    status: 'Inactive'
  },
  {
    full_name: 'Priya Patel',
    email: 'priya.patel@example.edu',
    phone: '+1 (555) 789-0123',
    course: 'Electrical & Electronics',
    enrollment_date: '2025-08-15',
    status: 'Active'
  },
  {
    full_name: 'Liam O\'Connor',
    email: 'liam.oconnor@example.edu',
    phone: '+1 (555) 890-1234',
    course: 'Computer Science',
    enrollment_date: '2025-02-01',
    status: 'Active'
  },
  {
    full_name: 'Amara Okafor',
    email: 'amara.okafor@example.edu',
    phone: '+1 (555) 901-2345',
    course: 'Biotechnology',
    enrollment_date: '2025-03-12',
    status: 'Active'
  },
  {
    full_name: 'Lucas Silva',
    email: 'lucas.silva@example.edu',
    phone: '+1 (555) 012-3456',
    course: 'Data Science & AI',
    enrollment_date: '2024-09-05',
    status: 'Inactive'
  },
  {
    full_name: 'Zara Al-Mansoor',
    email: 'zara.mansoor@example.edu',
    phone: '+1 (555) 123-4567',
    course: 'Cybersecurity',
    enrollment_date: '2025-08-20',
    status: 'Active'
  },
  {
    full_name: 'Noah Williams',
    email: 'noah.williams@example.edu',
    phone: '+1 (555) 234-9876',
    course: 'Business Administration',
    enrollment_date: '2025-09-15',
    status: 'Active'
  },
  {
    full_name: 'Chloe Dubois',
    email: 'chloe.dubois@example.edu',
    phone: '+1 (555) 345-8765',
    course: 'Information Technology',
    enrollment_date: '2024-11-10',
    status: 'Inactive'
  }
];

/**
 * Seed database with initial demo records without duplicating on repeated runs
 * @param {Database.Database} [db]
 * @returns {number} Count of newly inserted records
 */
function seedDatabase(db) {
  const database = db || getDatabase();

  const checkStmt = database.prepare('SELECT id FROM students WHERE email = ?');
  const insertStmt = database.prepare(`
    INSERT INTO students (id, full_name, email, phone, course, enrollment_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
  `);

  let insertedCount = 0;

  const insertMany = database.transaction((students) => {
    for (const student of students) {
      const existing = checkStmt.get(student.email.toLowerCase().trim());
      if (!existing) {
        const id = generateStudentId(database);
        insertStmt.run(
          id,
          student.full_name.trim(),
          student.email.toLowerCase().trim(),
          student.phone.trim(),
          student.course.trim(),
          student.enrollment_date,
          student.status
        );
        insertedCount++;
      }
    }
  });

  insertMany(DEMO_STUDENTS);

  return insertedCount;
}

if (require.main === module) {
  try {
    const inserted = seedDatabase();
    console.log(`Database seeded successfully. ${inserted} new records inserted.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
}

module.exports = {
  seedDatabase,
  DEMO_STUDENTS
};
