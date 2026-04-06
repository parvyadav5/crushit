// =============================================
//  Firebase Configuration — CrushIt (React)
// =============================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc,
  getDoc,
  onSnapshot,
  connectFirestoreEmulator
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

const requiredFirebaseEnvKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

function readRequiredFirebaseEnv(key) {
  const value = import.meta.env[key];

  return value || null;
}

const missingFirebaseEnvKeys = requiredFirebaseEnvKeys.filter(
  (key) => !readRequiredFirebaseEnv(key),
);

const firebaseConfigError = missingFirebaseEnvKeys.length > 0
  ? `[Firebase] Missing ${missingFirebaseEnvKeys.join(", ")}. Copy .env.example to .env locally and add the same variables in Vercel Project Settings.`
  : null;

const firebaseConfig = {
  apiKey: readRequiredFirebaseEnv("VITE_FIREBASE_API_KEY") || "missing-api-key",
  authDomain: readRequiredFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN") || "missing-auth-domain",
  projectId: readRequiredFirebaseEnv("VITE_FIREBASE_PROJECT_ID") || "missing-project-id",
  storageBucket: readRequiredFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET") || "missing-storage-bucket",
  messagingSenderId: readRequiredFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "missing-sender-id",
  appId: readRequiredFirebaseEnv("VITE_FIREBASE_APP_ID") || "missing-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const shouldUseEmulators =
  typeof window !== "undefined" &&
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

// Emulators are opt-in for local work so normal sign-in uses the real Firebase project.
if (shouldUseEmulators && !window.__CRUSHIT_FIREBASE_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  window.__CRUSHIT_FIREBASE_EMULATORS_CONNECTED__ = true;
  console.log("Connected to Firebase emulators");
}

// Initialize Cloud Messaging (FCM)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn('FCM not supported in this browser:', err.message);
}

// Export everything needed
export {
  app, auth, db, messaging, firebaseConfigError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp, Timestamp,
  setDoc, getDoc, onSnapshot,
  getToken, onMessage
};
