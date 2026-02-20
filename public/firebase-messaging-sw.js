// Firebase Cloud Messaging background handler (service worker)
// Same config as firebase.ts – must stay in sync
const firebaseConfig = {
  apiKey: "AIzaSyAjMbYdNcmMT0778xKR9thgUJ_C23r1Jc0",
  authDomain: "lead-generator-pro-0786.firebaseapp.com",
  projectId: "lead-generator-pro-0786",
  storageBucket: "lead-generator-pro-0786.firebasestorage.app",
  messagingSenderId: "356495940717",
  appId: "1:356495940717:web:35a3f34fdf1775f0943364",
  measurementId: "G-9ETCWLKD2C",
};

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) =>
{
  const notification = payload.notification || {};
  const title = notification.title || "Lead Generator";
  const options = {
    body: notification.body || "",
    icon: notification.icon || "/logo.png",
    tag: payload.data?.tag || "fcm",
    data: payload.data || {},
  };
  return self.registration.showNotification(title, options);
});
