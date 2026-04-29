import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9obiIEfDoh5vlYhXzwQFoMkvGAltoLMo",
  authDomain: "attendance-vihant-2026.firebaseapp.com",
  projectId: "attendance-vihant-2026",
  storageBucket: "attendance-vihant-2026.firebasestorage.app",
  messagingSenderId: "317103311779",
  appId: "1:317103311779:web:b283d1252e5817d3396816"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
