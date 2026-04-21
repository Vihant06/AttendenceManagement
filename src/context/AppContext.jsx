import { createContext, useContext, useReducer, useEffect } from 'react';

// ─── Mock Credentials (frontend-only; shape mirrors POST /api/auth/login) ────
export const MOCK_CREDENTIALS = {
  teachers: [
    { id: 't-001', email: 'priya.sharma@eduatelier.in', password: 'teacher123' },
  ],
  students: [
    { id: 's-001', email: 'arjun@student.edu',   password: 'student123' },
    { id: 's-002', email: 'zara@student.edu',    password: 'student123' },
    { id: 's-003', email: 'rohan@student.edu',   password: 'student123' },
    { id: 's-004', email: 'ananya@student.edu',  password: 'student123' },
    { id: 's-005', email: 'dev@student.edu',     password: 'student123' },
    { id: 's-006', email: 'isha@student.edu',    password: 'student123' },
    { id: 's-007', email: 'karan@student.edu',   password: 'student123' },
    { id: 's-008', email: 'meera@student.edu',   password: 'student123' },
  ],
};

// ─── Initial Mock Data ───────────────────────────────────────────────────────

const INITIAL_STATE = {
  // ── Auth ── (mirrors JWT payload shape for easy backend swap)
  auth: {
    isLoggedIn: false,
    role: null,       // 'teacher' | 'student'
    userId: null,     // teacher.id or student.id
  },

  teacher: {
    id: 't-001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@eduatelier.in',
    avatar: null,
    department: 'Computer Science',
  },
  students: [
    { id: 's-001', name: 'Arjun Mehta',   email: 'arjun@student.edu',   rollNo: 'CS2021-01', avatar: null },
    { id: 's-002', name: 'Zara Khan',     email: 'zara@student.edu',    rollNo: 'CS2021-02', avatar: null },
    { id: 's-003', name: 'Rohan Verma',   email: 'rohan@student.edu',   rollNo: 'CS2021-03', avatar: null },
    { id: 's-004', name: 'Ananya Nair',   email: 'ananya@student.edu',  rollNo: 'CS2021-04', avatar: null },
    { id: 's-005', name: 'Dev Kapoor',    email: 'dev@student.edu',     rollNo: 'CS2021-05', avatar: null },
    { id: 's-006', name: 'Isha Patel',    email: 'isha@student.edu',    rollNo: 'CS2021-06', avatar: null },
    { id: 's-007', name: 'Karan Singh',   email: 'karan@student.edu',   rollNo: 'CS2021-07', avatar: null },
    { id: 's-008', name: 'Meera Thomas',  email: 'meera@student.edu',   rollNo: 'CS2021-08', avatar: null },
  ],
  classes: [
    {
      id: 'cls-001',
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      schedule: 'Mon / Wed / Fri — 9:00 AM',
      room: 'Lab 4A',
      studentIds: ['s-001', 's-002', 's-003', 's-004', 's-005', 's-006', 's-007', 's-008'],
      semester: 'Spring 2025',
    },
    {
      id: 'cls-002',
      name: 'Database Management Systems',
      code: 'CS302',
      schedule: 'Tue / Thu — 11:00 AM',
      room: 'Room 2B',
      studentIds: ['s-001', 's-002', 's-004', 's-006', 's-008'],
      semester: 'Spring 2025',
    },
    {
      id: 'cls-003',
      name: 'Operating Systems',
      code: 'CS303',
      schedule: 'Mon / Wed — 2:00 PM',
      room: 'Room 3C',
      studentIds: ['s-003', 's-005', 's-007'],
      semester: 'Spring 2025',
    },
  ],
  attendanceRecords: {
    'cls-001': {
      '2025-04-07': { 's-001': 'present', 's-002': 'present', 's-003': 'absent',  's-004': 'present', 's-005': 'late',    's-006': 'present', 's-007': 'present', 's-008': 'absent'  },
      '2025-04-09': { 's-001': 'present', 's-002': 'late',    's-003': 'present', 's-004': 'absent',  's-005': 'present', 's-006': 'present', 's-007': 'absent',  's-008': 'present' },
      '2025-04-11': { 's-001': 'present', 's-002': 'present', 's-003': 'present', 's-004': 'present', 's-005': 'absent',  's-006': 'late',    's-007': 'present', 's-008': 'present' },
      '2025-04-14': { 's-001': 'absent',  's-002': 'present', 's-003': 'present', 's-004': 'present', 's-005': 'present', 's-006': 'present', 's-007': 'late',    's-008': 'present' },
      '2025-04-16': { 's-001': 'present', 's-002': 'present', 's-003': 'late',    's-004': 'present', 's-005': 'present', 's-006': 'absent',  's-007': 'present', 's-008': 'present' },
    },
    'cls-002': {
      '2025-04-08': { 's-001': 'present', 's-002': 'present', 's-004': 'present', 's-006': 'absent',  's-008': 'late'    },
      '2025-04-10': { 's-001': 'late',    's-002': 'present', 's-004': 'present', 's-006': 'present', 's-008': 'present' },
      '2025-04-15': { 's-001': 'present', 's-002': 'absent',  's-004': 'late',    's-006': 'present', 's-008': 'present' },
    },
    'cls-003': {
      '2025-04-07': { 's-003': 'present', 's-005': 'present', 's-007': 'absent'  },
      '2025-04-09': { 's-003': 'late',    's-005': 'present', 's-007': 'present' },
      '2025-04-14': { 's-003': 'present', 's-005': 'absent',  's-007': 'present' },
    },
  },
  activeStudentId: 's-001',

  // ── Geo-fencing sessions ── (mirrors GET /api/classes/:id/geo-session)
  // Shape: { [classId]: GeoSession | null }
  geoSessions: {},
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // ── Auth ──────────────────────────────────────────────────────────────────
    case 'LOGIN': {
      const { role, userId } = action.payload;
      return { ...state, auth: { isLoggedIn: true, role, userId } };
    }
    case 'LOGOUT': {
      return { ...state, auth: { isLoggedIn: false, role: null, userId: null } };
    }

    // ── Geo Sessions ──────────────────────────────────────────────────────────
    case 'OPEN_GEO_SESSION': {
      const { classId, lat, lng, radiusMetres, expiresAt } = action.payload;
      return {
        ...state,
        geoSessions: {
          ...state.geoSessions,
          [classId]: {
            active: true,
            lat, lng, radiusMetres,
            openedAt: new Date().toISOString(),
            expiresAt,
            checkedIn: [],  // studentIds who've geo-marked
          },
        },
      };
    }
    case 'CLOSE_GEO_SESSION': {
      const { classId } = action.payload;
      return {
        ...state,
        geoSessions: { ...state.geoSessions, [classId]: null },
      };
    }
    case 'GEO_MARK_ATTENDANCE': {
      // Student confirmed within geo-fence → mark as present
      const { classId, studentId } = action.payload;
      const today = new Date().toISOString().split('T')[0];
      const classRecords = state.attendanceRecords[classId] || {};
      const dayRecords = classRecords[today] || {};
      const session = state.geoSessions[classId];
      const updatedCheckedIn = session
        ? [...new Set([...(session.checkedIn || []), studentId])]
        : (session?.checkedIn || []);
      return {
        ...state,
        attendanceRecords: {
          ...state.attendanceRecords,
          [classId]: { ...classRecords, [today]: { ...dayRecords, [studentId]: 'present' } },
        },
        geoSessions: {
          ...state.geoSessions,
          [classId]: session ? { ...session, checkedIn: updatedCheckedIn } : session,
        },
      };
    }

    // ── Existing attendance actions ───────────────────────────────────────────
    case 'MARK_ATTENDANCE': {
      const { classId, date, studentId, status } = action.payload;
      const classRecords = state.attendanceRecords[classId] || {};
      const dayRecords = classRecords[date] || {};
      return {
        ...state,
        attendanceRecords: {
          ...state.attendanceRecords,
          [classId]: { ...classRecords, [date]: { ...dayRecords, [studentId]: status } },
        },
      };
    }
    case 'MARK_BULK_ATTENDANCE': {
      const { classId, date, records } = action.payload;
      const classRecords = state.attendanceRecords[classId] || {};
      return {
        ...state,
        attendanceRecords: {
          ...state.attendanceRecords,
          [classId]: { ...classRecords, [date]: records },
        },
      };
    }
    case 'ADD_CLASS': {
      return { ...state, classes: [...state.classes, action.payload] };
    }
    case 'SET_ACTIVE_STUDENT': {
      return { ...state, activeStudentId: action.payload };
    }
    case 'HYDRATE': {
      return action.payload;
    }
    default:
      return state;
  }
}

// ─── Context + Provider ───────────────────────────────────────────────────────

const AppContext = createContext(null);
const STORAGE_KEY = 'attendance_app_state_v2';

export function AppProvider({ children }) {
  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [state, dispatch] = useReducer(reducer, saved || INITIAL_STATE);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* storage full */ }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

export function validateLogin(role, email, password) {
  const list = role === 'teacher'
    ? MOCK_CREDENTIALS.teachers
    : MOCK_CREDENTIALS.students;
  return list.find(u => u.email === email && u.password === password) || null;
}

// ─── Geo helpers ─────────────────────────────────────────────────────────────

/** Haversine formula → distance in metres between two coords */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isGeoSessionActive(session) {
  if (!session?.active) return false;
  return new Date() < new Date(session.expiresAt);
}

// ─── Existing derived data helpers ───────────────────────────────────────────

export function getStudentAttendanceSummary(state, studentId) {
  const summary = {};
  for (const cls of state.classes) {
    const records = state.attendanceRecords[cls.id] || {};
    if (!cls.studentIds.includes(studentId)) continue;
    let total = 0, present = 0, late = 0, absent = 0;
    for (const date of Object.keys(records)) {
      const status = records[date][studentId];
      if (!status) continue;
      total++;
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'absent') absent++;
    }
    summary[cls.id] = { total, present, late, absent, percentage: total ? Math.round(((present + late) / total) * 100) : 100 };
  }
  return summary;
}

export function getClassAttendanceSummary(state, classId) {
  const records = state.attendanceRecords[classId] || {};
  const cls = state.classes.find(c => c.id === classId);
  if (!cls) return {};
  const summary = {};
  for (const studentId of cls.studentIds) {
    let total = 0, present = 0, late = 0, absent = 0;
    for (const date of Object.keys(records)) {
      const status = records[date][studentId];
      if (!status) continue;
      total++;
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'absent') absent++;
    }
    summary[studentId] = { total, present, late, absent, percentage: total ? Math.round(((present + late) / total) * 100) : 100 };
  }
  return summary;
}

export function getTodayAttendanceStatus(state, classId, studentId) {
  const today = new Date().toISOString().split('T')[0];
  return state.attendanceRecords[classId]?.[today]?.[studentId] || null;
}
