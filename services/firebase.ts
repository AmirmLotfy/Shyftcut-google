// This file configures the Firebase SDK and exports the necessary services.

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from "firebase/analytics";

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
let functions: Functions;
let storage: FirebaseStorage;
let analytics: Analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  storage = getStorage(app);
  analytics = getAnalytics(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}


export { app, auth, db, functions, storage, analytics };