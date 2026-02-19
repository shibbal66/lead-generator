import { MessagePayload, getToken, onMessage } from "firebase/messaging";

import { FIREBASE_VAPID_KEY } from "../config/env";
import { getFirebaseMessaging } from "../firebase";

export type FirebaseNotificationEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

type SubscribeHandlers = {
  onMessage: (event: FirebaseNotificationEvent) => void;
};

let unsubscribeForegroundListener: (() => void) | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

const mapPayloadToEvent = (payload: MessagePayload): FirebaseNotificationEvent => {
  const type = payload.data?.type || payload.notification?.title || "INFO";
  const message = payload.data?.message || payload.notification?.body || "New notification received.";
  return {
    id: payload.messageId || payload.data?.id || `fcm-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    message,
    createdAt: new Date().toISOString()
  };
};

const ensureNotificationPermission = async (): Promise<NotificationPermission> => {
  console.log("[FCM] Current notification permission:", Notification.permission);
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const permission = await Notification.requestPermission();
  console.log("[FCM] Notification permission after request:", permission);
  return permission;
};

const ensureServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  if (swRegistration) {
    console.log("[FCM] Reusing existing service worker registration");
    return swRegistration;
  }

  const swUrl = "/firebase-messaging-sw.js";
  console.log("[FCM] Checking service worker script:", swUrl);
  const swScriptResponse = await fetch(swUrl, { cache: "no-store" });
  if (!swScriptResponse.ok) {
    throw new Error(`[FCM] Service worker script not reachable (${swScriptResponse.status}) at ${swUrl}`);
  }

  try {
    swRegistration = await navigator.serviceWorker.register(swUrl, {
      scope: "/",
      updateViaCache: "none"
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown service worker registration error";
    throw new Error(
      `[FCM] Failed to register service worker. ${errorMessage}. On HTTPS localhost, ensure your local certificate is trusted and /firebase-messaging-sw.js opens without browser SSL warnings.`
    );
  }

  console.log("[FCM] Service worker registered:", swRegistration.scope);
  return swRegistration;
};

export const firebaseNotificationApi = {
  subscribe: async ({ onMessage: handleMessage }: SubscribeHandlers): Promise<{ token: string }> => {
    console.log("[FCM] Initializing Firebase notifications...");
    if (typeof window === "undefined") {
      throw new Error("Firebase notifications are only available in the browser.");
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      throw new Error("This browser does not support push notifications.");
    }

    if (!FIREBASE_VAPID_KEY) {
      throw new Error("Firebase VAPID key is missing. Set VITE_FIREBASE_VAPID_KEY in your env.");
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error("Firebase messaging is not supported in this browser.");
    }

    const permission = await ensureNotificationPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted.");
    }

    const serviceWorkerRegistration = await ensureServiceWorkerRegistration();
    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration
    });

    if (!token) {
      throw new Error("Unable to fetch FCM token.");
    }
    console.log("[FCM] FCM token fetched successfully");

    if (unsubscribeForegroundListener) {
      unsubscribeForegroundListener();
    }

    unsubscribeForegroundListener = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message received:", payload);
      handleMessage(mapPayloadToEvent(payload));
    });

    console.log("[FCM] Foreground listener attached");
    return { token };
  },

  unsubscribe: () => {
    if (unsubscribeForegroundListener) {
      unsubscribeForegroundListener();
      unsubscribeForegroundListener = null;
      console.log("[FCM] Foreground listener removed");
    }
  }
};
