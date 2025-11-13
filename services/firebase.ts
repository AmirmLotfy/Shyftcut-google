// This file configures the Firebase SDK and exports the necessary services.

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from "firebase/analytics";
// FIX: Import getFunctions and Functions to make it available for other modules.
import { getFunctions, Functions } from 'firebase/functions';

// Your web app's Firebase configuration from the user prompt
const firebaseConfig = {
  apiKey: "AIzaSyCL3EtP9FtoSDuDlvSBMOv_rbBIZVgI_p0",
  authDomain: "shyftcutnew.firebaseapp.com",
  projectId: "shyftcutnew",
  storageBucket: "shyftcutnew.firebasestorage.app",
  messagingSenderId: "320083219145",
  appId: "1:320083219145:web:3060fa286486dc4eef3318",
  measurementId: "G-5HVZ8Q08D7"
};


// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics;
// FIX: Declare the functions variable.
let functions: Functions;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  analytics = getAnalytics(app);
  // FIX: Initialize the functions service.
  functions = getFunctions(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}


// FIX: Export the functions service.
export { app, auth, db, storage, analytics, functions };
