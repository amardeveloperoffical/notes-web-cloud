
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfMSudyz8zYBKBP7cD3AGJxHWxMZCdD14",
  authDomain: "merchandise-store-9e549.firebaseapp.com",
  projectId: "merchandise-store-9e549",
  storageBucket: "merchandise-store-9e549.firebasestorage.app",
  messagingSenderId: "417891063991",
  appId: "1:417891063991:web:94bb8562e060d4f8bbd532",
  measurementId: "G-J8THHXKHX2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, db };
