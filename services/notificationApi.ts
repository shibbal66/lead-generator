import { BACKEND_URL } from "../config/env";
import { getAccessToken } from "../store/storage";

type NotificationStreamHandlers = {
  onOpen?: () => void;
  onMessage?: (rawData: string) => void;
  onError?: (errorMessage: string) => void;
};

let notificationEventSource: EventSource | null = null;

export const notificationApi = {
  subscribe: (handlers: NotificationStreamHandlers) => {
    if (notificationEventSource) {
      return () => {
        if (!notificationEventSource) return;
        notificationEventSource.close();
        notificationEventSource = null;
      };
    }

    const token = getAccessToken();
    const baseUrl = `${BACKEND_URL}/notification/subscribe`;
    const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
    notificationEventSource = new EventSource(url);

    notificationEventSource.onopen = () => {
      handlers.onOpen?.();
    };

    notificationEventSource.onmessage = (event) => {
      handlers.onMessage?.(event.data || "");
    };

    notificationEventSource.onerror = () => {
      handlers.onError?.("Notification stream disconnected.");
    };

    return () => {
      if (!notificationEventSource) return;
      notificationEventSource.close();
      notificationEventSource = null;
    };
  },

  unsubscribe: () => {
    if (!notificationEventSource) return;
    notificationEventSource.close();
    notificationEventSource = null;
  }
};

