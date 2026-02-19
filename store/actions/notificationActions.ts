import { createAsyncThunk } from "@reduxjs/toolkit";

import { firebaseNotificationApi } from "../../services/firebaseNotificationApi";
import { notificationConnectionError, notificationReceived } from "../slices/notificationSlice";

export const initializeFirebaseNotifications = createAsyncThunk(
  "notifications/initializeFirebase",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { token } = await firebaseNotificationApi.subscribe({
        onMessage: (notification) => {
          console.log("[Notification] Firebase message", notification);
          dispatch(
            notificationReceived({
              ...notification,
              source: "firebase"
            })
          );
        },
      });

      return { connected: true, token };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initialize Firebase notifications";
      dispatch(notificationConnectionError(message));
      return rejectWithValue(message);
    }
  }
);

export const stopFirebaseNotifications = createAsyncThunk("notifications/stopFirebase", async () => {
  firebaseNotificationApi.unsubscribe();
  return { connected: false };
});
