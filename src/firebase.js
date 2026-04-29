import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZI_kP5q0A2NIgLLAvPF_8CZ-UBh3qbZI",
  authDomain: "geo-attend-tracker.firebaseapp.com",
  projectId: "geo-attend-tracker",
  storageBucket: "geo-attend-tracker.firebasestorage.app",
  messagingSenderId: "629937865421",
  appId: "1:629937865421:web:0257a0cb16d2f29b265f84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
