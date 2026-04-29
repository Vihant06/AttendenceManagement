import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Sign up a new user and store their profile in Firestore.
 */
export async function signupUser({ email, password, role, name, rollNo, department }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the user profile in Firestore
    const userProfile = {
      email,
      role, // 'teacher' or 'student'
      name: name || '',
      createdAt: new Date().toISOString()
    };

    if (role === 'student') userProfile.rollNo = rollNo || '';
    if (role === 'teacher') userProfile.department = department || '';

    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return { user, profile: userProfile };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

/**
 * Log in an existing user and fetch their profile.
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user profile to get the role
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { user, profile: docSnap.data() };
    } else {
      throw new Error("User profile not found in database.");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Log out the current user.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes (used in Context to auto-login).
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        callback({ user, profile: docSnap.data() });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}
