// seedFirestore.js  –– run once to populate Firestore with demo data
// Usage: node src/scripts/seedFirestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZI_kP5q0A2NIgLLAvPF_8CZ-UBh3qbZI",
  authDomain: "geo-attend-tracker.firebaseapp.com",
  projectId: "geo-attend-tracker",
  storageBucket: "geo-attend-tracker.firebasestorage.app",
  messagingSenderId: "629937865421",
  appId: "1:629937865421:web:0257a0cb16d2f29b265f84"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.now();

// ── Users ──────────────────────────────────────────────────────────────────────
// NOTE: These user docs need to match real Firebase Auth UIDs.
// We seed with placeholder IDs – teacher1/student1/student2 – which are used by
// the classes/attendance/geoSessions collections for relational integrity.
// The actual auth users (alice@example.com / bob@example.com) were created during
// sign-up and already have their own Firestore docs.  These extra docs are for
// the additional demo roster.
const users = [
  {
    id: 'teacher1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@eduatelier.in',
    role: 'teacher',
    department: 'Computer Science',
  },
  {
    id: 'student1',
    name: 'Arjun Mehta',
    email: 'arjun@student.edu',
    role: 'student',
    rollNo: 'CS2021-01',
  },
  {
    id: 'student2',
    name: 'Zara Khan',
    email: 'zara@student.edu',
    role: 'student',
    rollNo: 'CS2021-02',
  },
  {
    id: 'student3',
    name: 'Rohan Verma',
    email: 'rohan@student.edu',
    role: 'student',
    rollNo: 'CS2021-03',
  },
  {
    id: 'student4',
    name: 'Ananya Nair',
    email: 'ananya@student.edu',
    role: 'student',
    rollNo: 'CS2021-04',
  },
];

// ── Classes ────────────────────────────────────────────────────────────────────
// studentIds ties each class to the demo student roster
const classes = [
  {
    id: 'class1',
    name: 'Data Structures',
    code: 'CS-101',
    teacherId: 'teacher1',
    schedule: 'Mon / Wed  10:00–12:00',
    room: 'Room 101',
    time: 'Mon 10:00-12:00',
    location: 'Room 101',
    studentIds: ['student1', 'student2', 'student3', 'student4'],
  },
  {
    id: 'class2',
    name: 'Algorithms',
    code: 'CS-102',
    teacherId: 'teacher1',
    schedule: 'Tue / Thu  14:00–16:00',
    room: 'Room 102',
    time: 'Tue 14:00-16:00',
    location: 'Room 102',
    studentIds: ['student1', 'student3', 'student4'],
  },
  {
    id: 'class3',
    name: 'Operating Systems',
    code: 'CS-201',
    teacherId: 'teacher1',
    schedule: 'Fri  09:00–11:00',
    room: 'Lab 3',
    time: 'Fri 09:00-11:00',
    location: 'Lab 3',
    studentIds: ['student2', 'student3', 'student4'],
  },
];

// ── Attendance records ─────────────────────────────────────────────────────────
const attendanceDates = ['2026-04-21', '2026-04-23', '2026-04-25', '2026-04-28'];

const attendanceData = [];
let attCounter = 1;

const statusMap = {
  class1: {
    'student1': ['present', 'present', 'present', 'present'],
    'student2': ['present', 'absent',  'present', 'present'],
    'student3': ['absent',  'present', 'present', 'absent' ],
    'student4': ['present', 'present', 'absent',  'present'],
  },
  class2: {
    'student1': ['present', 'present', 'absent',  'present'],
    'student3': ['present', 'absent',  'present', 'present'],
    'student4': ['absent',  'present', 'present', 'present'],
  },
  class3: {
    'student2': ['present', 'present', 'present', 'absent' ],
    'student3': ['present', 'absent',  'absent',  'present'],
    'student4': ['present', 'present', 'present', 'present'],
  },
};

for (const [classId, students] of Object.entries(statusMap)) {
  const classObj = classes.find(c => c.id === classId);
  const classAttDates = classId === 'class2'
    ? ['2026-04-22', '2026-04-24', '2026-04-26', '2026-04-28']
    : attendanceDates;

  for (const [studentId, statuses] of Object.entries(students)) {
    statuses.forEach((status, i) => {
      attendanceData.push({
        id: `att${attCounter++}`,
        classId,
        studentId,
        date: classAttDates[i],
        status,
      });
    });
  }
}

// ── Geo Sessions ───────────────────────────────────────────────────────────────
const geoSessions = [
  {
    id: 'geo1',
    classId: 'class1',
    teacherId: 'teacher1',
    latitude: 28.6448,   // New Delhi coordinates (demo)
    longitude: 77.2167,
    radius: 10,
    isActive: true,
  },
];

// ── Write to Firestore ─────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding Firestore...');

  for (const u of users) {
    const { id, ...data } = u;
    await setDoc(doc(db, 'users', id), { ...data, createdAt: now });
    console.log(`  ✓ user/${id}`);
  }

  for (const c of classes) {
    const { id, ...data } = c;
    await setDoc(doc(db, 'classes', id), { ...data, createdAt: now });
    console.log(`  ✓ classes/${id}`);
  }

  for (const a of attendanceData) {
    const { id, ...data } = a;
    await setDoc(doc(db, 'attendance', id), { ...data, timestamp: now });
    console.log(`  ✓ attendance/${id}`);
  }

  for (const g of geoSessions) {
    const { id, ...data } = g;
    await setDoc(doc(db, 'geoSessions', id), { ...data, timestamp: now });
    console.log(`  ✓ geoSessions/${id}`);
  }

  console.log('\n✅ Firestore seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
