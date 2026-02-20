import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { FIREBASE_VAPID_KEY } from "../config/env";
import { getFirebaseMessaging } from "../firebase";

export type ForegroundMessageHandler = (payload: MessagePayload) => void;

/**
 * Request browser notification permission.
 * @returns "granted" | "denied" | "default"
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.requestPermission();
}

/**
 * Request permission and get FCM token for this device.
 * Returns null if unsupported, permission denied, or getToken fails.
 */
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const permission = await requestNotificationPermission();
    if (permission !== "granted") return null;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to foreground FCM messages (when app is open).
 * Returns an unsubscribe function.
 */
export async function subscribeForegroundMessages(handler: ForegroundMessageHandler): Promise<() => void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, handler);
  return unsubscribe;
}
