import { createSlice } from "@reduxjs/toolkit";

import { createTask, getTasks, updateTask, deleteTask } from "../actions/taskActions";

export type TaskRecord = {
  id: string;
  description: string;
  assignedTo?: string;
  leadId?: string;
  deadline?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskPayload = {
  description: string;
  assignedTo: string;
  leadId?: string;
  deadline?: string;
  completed?: boolean;
};

export type GetTasksParams = {
  assignedTo?: string;
  leadId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
};

export type UpdateTaskBody = Partial<CreateTaskPayload> & {
  completed?: boolean;
};

export type UpdateTaskPayload = {
  taskId: string;
  data: UpdateTaskBody;
};

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type TasksState = {
  tasks: TaskRecord[];
  total: number;
  page: number;
  limit: number;
  listStatus: AsyncStatus;
  createStatus: AsyncStatus;
  updateStatus: AsyncStatus;
  deleteStatus: AsyncStatus;
  error: string | null;
  successMessage: string | null;
};

const initialState: TasksState = {
  tasks: [],
  total: 0,
  page: 1,
  limit: 10,
  listStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
  successMessage: null
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskMessages: (state) =>
    {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) =>
  {
    builder
      .addCase(getTasks.pending, (state) =>
      {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) =>
      {
        state.listStatus = "succeeded";
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getTasks.rejected, (state, action) =>
      {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch tasks";
      })
      .addCase(createTask.pending, (state) =>
      {
        state.createStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTask.fulfilled, (state, action) =>
      {
        state.createStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.tasks = [action.payload.task, ...state.tasks];
        state.total += 1;
      })
      .addCase(createTask.rejected, (state, action) =>
      {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create task";
      })
      .addCase(updateTask.pending, (state) =>
      {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTask.fulfilled, (state, action) =>
      {
        state.updateStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.tasks = state.tasks.map((task) => (task.id === action.payload.task.id ? action.payload.task : task));
      })
      .addCase(updateTask.rejected, (state, action) =>
      {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update task";
      })
      .addCase(deleteTask.pending, (state) =>
      {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) =>
      {
        state.deleteStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.tasks = state.tasks.filter((task) => task.id !== action.meta.arg);
        state.total -= 1;
      })
      .addCase(deleteTask.rejected, (state, action) =>
      {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete task";
      });
  }
});

export const { clearTaskMessages } = taskSlice.actions;
export default taskSlice.reducer;
