import { createAsyncThunk } from "@reduxjs/toolkit";

import { taskApi } from "../../services/taskApi";
import { CreateTaskPayload, GetTasksParams, UpdateTaskPayload } from "../slices/taskSlice";

export const createTask = createAsyncThunk("tasks/createTask", async (payload: CreateTaskPayload, { rejectWithValue }) =>
{
  try
  {
    return await taskApi.createTask(payload);
  } catch (error)
  {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create task");
  }
});

export const getTasks = createAsyncThunk("tasks/getTasks", async (params: GetTasksParams | undefined, { rejectWithValue }) =>
{
  try
  {
    return await taskApi.getTasks(params);
  } catch (error)
  {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch tasks");
  }
});

export const updateTask = createAsyncThunk("tasks/updateTask", async (payload: UpdateTaskPayload, { rejectWithValue }) =>
{
  try
  {
    return await taskApi.updateTask(payload);
  } catch (error)
  {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update task");
  }
});

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (taskId: string, { rejectWithValue }) =>
{
  try
  {
    return await taskApi.deleteTask(taskId);
  } catch (error)
  {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete task");
  }
});
