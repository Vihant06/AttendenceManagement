import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// CLASSES
// ==========================================

export async function createClass(classData) {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...classData };
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
}

export function subscribeToUsers(callback) {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  }, (error) => {
    console.error("Error subscribing to users:", error);
  });
}

export function subscribeToClasses(callback) {
  const q = query(collection(db, 'classes'));
  return onSnapshot(q, (snapshot) => {
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(classes);
  }, (error) => {
    console.error("Error subscribing to classes:", error);
  });
}

// ==========================================
// ATTENDANCE
// ==========================================

export async function markAttendance(studentId, classId, dateStr, status = 'present') {
  try {
    const docId = `${classId}_${dateStr}_${studentId}`;
    const docRef = doc(db, 'attendance', docId);
    await setDoc(docRef, {
      studentId,
      classId,
      date: dateStr,
      status,
      timestamp: serverTimestamp()
    }, { merge: true });
    return { id: docId, studentId, classId, date: dateStr, status };
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
}

export function subscribeToAttendance(callback) {
  const q = query(collection(db, 'attendance'));
  return onSnapshot(q, (snapshot) => {
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(attendance);
  }, (error) => {
    console.error("Error subscribing to attendance:", error);
  });
}

import { writeBatch } from 'firebase/firestore';

export async function markBulkAttendance(classId, dateStr, recordsObj) {
  try {
    const batch = writeBatch(db);
    for (const [studentId, status] of Object.entries(recordsObj)) {
      // For a proper bulk, we'd need to check if exists, but we can also use composite ID
      // To simplify and avoid reading all, we set a doc ID based on class_date_student
      const docId = `${classId}_${dateStr}_${studentId}`;
      const docRef = doc(db, 'attendance', docId);
      batch.set(docRef, {
        studentId,
        classId,
        date: dateStr,
        status,
        timestamp: serverTimestamp()
      }, { merge: true });
    }
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error marking bulk attendance:", error);
    throw error;
  }
}

// ==========================================
// GEO SESSIONS
// ==========================================

export async function startGeoSession(classId, teacherId, latitude, longitude, radius = 10, expiresAt) {
  try {
    const sessionRef = doc(db, 'geoSessions', classId);
    await setDoc(sessionRef, {
      classId,
      teacherId,
      latitude,
      longitude,
      radius,
      isActive: true,
      expiresAt: expiresAt || null,
      timestamp: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error starting geo session:", error);
    throw error;
  }
}

export async function stopGeoSession(classId) {
  try {
    const sessionRef = doc(db, 'geoSessions', classId);
    await updateDoc(sessionRef, {
      isActive: false
    });
    return true;
  } catch (error) {
    console.error("Error stopping geo session:", error);
    throw error;
  }
}

export function subscribeToGeoSessions(callback) {
  const q = query(collection(db, 'geoSessions'));
  return onSnapshot(q, (snapshot) => {
    const sessions = {};
    snapshot.docs.forEach(doc => {
      sessions[doc.id] = { id: doc.id, ...doc.data() };
    });
    callback(sessions);
  }, (error) => {
    console.error("Error subscribing to geoSessions:", error);
  });
}
