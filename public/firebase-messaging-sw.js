importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAjMbYdNcmMT0778xKR9thgUJ_C23r1Jc0",
  authDomain: "lead-generator-pro-0786.firebaseapp.com",
  projectId: "lead-generator-pro-0786",
  storageBucket: "lead-generator-pro-0786.firebasestorage.app",
  messagingSenderId: "356495940717",
  appId: "1:356495940717:web:35a3f34fdf1775f0943364",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title || "New Notification",
    {
      body: payload.notification?.body,
      icon: "/logo192.png",
    }
  );
});
