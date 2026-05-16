importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyDRfVwgYp1KYzi-8Jkmd_lj4xD4shIIbQA",
  authDomain: "mediassist-cd09e.firebaseapp.com",
  projectId: "mediassist-cd09e",
  storageBucket: "mediassist-cd09e.firebasestorage.app",
  messagingSenderId: "471151833316",
  appId: "1:471151833316:web:fffce7f99e4b46ca55fcf1",
  measurementId: "G-D603RMJ8M5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body
  });
});