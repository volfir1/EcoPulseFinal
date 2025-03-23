// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAzWSHsLzekHXcsULz096dKaOqnd22Vuxg",
  authDomain: "ecopulse-ba84f.firebaseapp.com",
  projectId: "ecopulse-ba84f",
  storageBucket: "ecopulse-ba84f.firebasestorage.app",
  messagingSenderId: "34035725627",
  appId: "1:34035725627:web:522e8687fb5906e9dfb31e",
  measurementId: "G-62FVNBXCL1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };