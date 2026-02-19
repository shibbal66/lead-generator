import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAjMbYdNcmMT0778xKR9thgUJ_C23r1Jc0",
  authDomain: "lead-generator-pro-0786.firebaseapp.com",
  projectId: "lead-generator-pro-0786",
  storageBucket: "lead-generator-pro-0786.firebasestorage.app",
  messagingSenderId: "356495940717",
  appId: "1:356495940717:web:35a3f34fdf1775f0943364",
  measurementId: "G-9ETCWLKD2C",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analyticsInstance: Analytics | null = null;
let messagingInstance: Messaging | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  const supported = await isAnalyticsSupported();
  if (!supported) return null;
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;
  const supported = await isMessagingSupported();
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
};

void getFirebaseAnalytics();
