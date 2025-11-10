// This file configures the Firebase SDK and exports the necessary services.

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration from the user prompt
const firebaseConfig = {
  apiKey: "AIzaSyBwd-07ShO5ndPY5LsETxktMh4InnlHbSc",
  authDomain: "shyftcut.firebaseapp.com",
  projectId: "shyftcut",
  storageBucket: "shyftcut.appspot.com", // Corrected the storage bucket domain
  messagingSenderId: "730490300919",
  appId: "1:730490300919:web:3be840377fc1edeba1a6f2",
  measurementId: "G-30XM8HXYDG"
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