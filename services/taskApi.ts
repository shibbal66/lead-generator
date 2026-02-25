import { CreateTaskPayload, GetTasksParams, TaskRecord, UpdateTaskPayload } from "../store/slices/taskSlice";
import { request } from "./apiClient";

type TaskApiResponse = {
  success?: boolean;
  message?: string;
  task?: TaskRecord;
  tasks?: TaskRecord[];
  total?: number;
  page?: number;
  limit?: number;
};
type TaskWithLeadItem = { tasks: TaskRecord; leads?: unknown; };

const parseJsonSafe = async (response: Response): Promise<TaskApiResponse> =>
{
  try
  {
    return (await response.json()) as TaskApiResponse;
  } catch
  {
    return {};
  }
};

const apiRequest = async (path: string, init?: RequestInit): Promise<TaskApiResponse> =>
{
  const res = await request(path, init);
  const data = await parseJsonSafe(res);
  if (!res.ok)
  {
    throw new Error(data.message || "Task request failed");
  }
  return data;
};

export const taskApi = {
  createTask: async (payload: CreateTaskPayload): Promise<{ task: TaskRecord; message: string; }> =>
  {
    const response = await apiRequest("/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.task)
    {
      throw new Error("Created task payload missing");
    }

    return {
      task: response.task,
      message: response.message || "Task created successfully"
    };
  },

  getTasks: async (params?: GetTasksParams): Promise<{ tasks: TaskRecord[]; total: number; page: number; limit: number; }> =>
  {
    const query = new URLSearchParams();
    if (params?.assignedTo) query.set("assignedTo", params.assignedTo);
    if (params?.leadId) query.set("leadId", params.leadId);
    if (typeof params?.completed === "boolean") query.set("completed", String(params.completed));
    if (typeof params?.page === "number") query.set("page", String(params.page));
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/task?${ query.toString() }` : "/task";
    const response = await apiRequest(path, { method: "GET" });
    const raw = response.tasks as TaskWithLeadItem[] | TaskRecord[] | undefined;
    const tasks: TaskRecord[] = Array.isArray(raw)
      ? raw.map((item: TaskWithLeadItem | TaskRecord) =>
        "tasks" in item && item.tasks && typeof item.tasks === "object" ? item.tasks : (item as TaskRecord)
      )
      : [];

    return {
      tasks,
      total: response.total || 0,
      page: response.page || params?.page || 1,
      limit: response.limit || params?.limit || 10
    };
  },

  updateTask: async ({ taskId, data }: UpdateTaskPayload): Promise<{ task: TaskRecord; message: string; }> =>
  {
    const response = await apiRequest(`/task/${ taskId }`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.task)
    {
      throw new Error("Updated task payload missing");
    }

    return {
      task: response.task,
      message: response.message || "Task updated successfully"
    };
  },

  deleteTask: async (taskId: string): Promise<{ message: string; }> =>
  {
    const response = await apiRequest(`/task/${ taskId }`, {
      method: "DELETE"
    });

    return {
      message: response.message || "Task deleted successfully"
    };
  }
};
