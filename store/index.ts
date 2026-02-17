import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import commentsReducer from "./slices/commentSlice";
import dashboardReducer from "./slices/dashboardSlice";
import dealsReducer from "./slices/dealSlice";
import leadsReducer from "./slices/leadSlice";
import notificationsReducer from "./slices/notificationSlice";
import projectsReducer from "./slices/projectSlice";
import tasksReducer from "./slices/taskSlice";
import teamReducer from "./slices/teamSlice";
import usersReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    comments: commentsReducer,
    dashboard: dashboardReducer,
    deals: dealsReducer,
    leads: leadsReducer,
    notifications: notificationsReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    team: teamReducer,
    users: usersReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
