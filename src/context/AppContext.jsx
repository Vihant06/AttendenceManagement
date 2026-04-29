import { createContext, useContext, useReducer, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';
import { subscribeToClasses, subscribeToAttendance, subscribeToGeoSessions, subscribeToUsers } from '../services/firestoreService';

// ─── Initial Data (mock data for classes/attendance kept for Phase 3) ────────

const INITIAL_STATE = {
  // ── Auth ──
  auth: {
    isLoggedIn: false,
    role: null,       // 'teacher' | 'student'
    userId: null,     // Firebase uid
  },
  authLoading: true, // Firebase auth initialization

  // Mock users for UI until full user collection is integrated
  users: [],
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
  classes: [],
  attendanceRecords: {},
  activeStudentId: 's-001',
  geoSessions: {},
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // ── Auth ──────────────────────────────────────────────────────────────────
    case 'LOGIN': {
      const { role, userId } = action.payload;
      return { ...state, auth: { isLoggedIn: true, role, userId }, authLoading: false };
    }
    case 'LOGOUT': {
      return { ...state, auth: { isLoggedIn: false, role: null, userId: null }, authLoading: false };
    }
    case 'AUTH_LOADING': {
      return { ...state, authLoading: true };
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
            checkedIn: [],
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
    // ── Database Sync Actions ────────────────────────────────────────────────
    case 'SET_CLASSES': {
      return { ...state, classes: action.payload };
    }
    case 'SET_ATTENDANCE_RECORDS': {
      return { ...state, attendanceRecords: action.payload };
    }
    case 'SET_GEO_SESSIONS': {
      // Map firebase format to expected UI format
      const newGeo = { ...action.payload };
      for (const key of Object.keys(newGeo)) {
        newGeo[key].active = newGeo[key].isActive;
        newGeo[key].radiusMetres = newGeo[key].radius;
      }
      return { ...state, geoSessions: newGeo };
    }
    case 'SET_STUDENTS': {
      return { ...state, students: action.payload };
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
const STORAGE_KEY = 'attendance_app_state_v3';

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

  // Handle Firebase Auth State changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authData) => {
      if (authData) {
        dispatch({ type: 'LOGIN', payload: { role: authData.profile.role, userId: authData.user.uid } });
        if (authData.profile.role === 'student') {
          // Temporarily sync activeStudentId for backwards compatibility until Phase 3
          // For now, if role is student, set to their auth uid or mock id
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Firestore Data Sync
  useEffect(() => {
    // Only subscribe if we are logged in
    if (!state.auth.isLoggedIn) return;

    const unsubClasses = subscribeToClasses((classes) => {
      dispatch({ type: 'SET_CLASSES', payload: classes });
    });

    const unsubAttendance = subscribeToAttendance((attendanceList) => {
      // transform flat list to nested dictionary
      const records = {};
      attendanceList.forEach(att => {
        if (!records[att.classId]) records[att.classId] = {};
        if (!records[att.classId][att.date]) records[att.classId][att.date] = {};
        records[att.classId][att.date][att.studentId] = att.status;
      });
      dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: records });
    });

    const unsubGeo = subscribeToGeoSessions((sessions) => {
      dispatch({ type: 'SET_GEO_SESSIONS', payload: sessions });
    });

    const unsubUsers = subscribeToUsers((usersList) => {
      // Map to keep the old UI working seamlessly
      const students = usersList.filter(u => u.role === 'student').map(s => ({
        id: s.id,
        name: s.name,
        email: s.email
      }));
      dispatch({ type: 'SET_STUDENTS', payload: students });
    });

    return () => {
      unsubClasses();
      unsubAttendance();
      unsubGeo();
      unsubUsers();
    };
  }, [state.auth.isLoggedIn]);

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

// ─── Geo helpers ─────────────────────────────────────────────────────────────

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
  // If we have an expiresAt, check it. Otherwise, assume active if active is true.
  if (session.expiresAt) {
    return new Date() < new Date(session.expiresAt);
  }
  return true;
}

// ─── Existing derived data helpers ───────────────────────────────────────────

export function getStudentAttendanceSummary(state, studentId) {
  const summary = {};
  for (const cls of state.classes) {
    const records = state.attendanceRecords[cls.id] || {};
    const sIds = cls.studentIds || [];
    if (!sIds.includes(studentId)) continue;
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
  for (const studentId of (cls.studentIds || [])) {
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
