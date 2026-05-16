import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDRfVwgYp1KYzi-8Jkmd_lj4xD4shIIbQA",
  authDomain: "mediassist-cd09e.firebaseapp.com",
  projectId: "mediassist-cd09e",
  storageBucket: "mediassist-cd09e.firebasestorage.app",
  messagingSenderId: "471151833316",
  appId: "1:471151833316:web:fffce7f99e4b46ca55fcf1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👉 IMPORTANT: export messaging
export const messaging = getMessaging(app);