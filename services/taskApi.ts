import { BACKEND_URL } from "../config/env";
import { CreateTaskPayload, GetTasksParams, TaskRecord, UpdateTaskPayload } from "../store/slices/taskSlice";

type TaskApiResponse = {
  success?: boolean;
  message?: string;
  task?: TaskRecord;
  tasks?: TaskRecord[];
  total?: number;
  page?: number;
  limit?: number;
};
type TaskWithLeadItem = { tasks: TaskRecord; leads?: unknown };

const parseJsonSafe = async (response: Response): Promise<TaskApiResponse> => {
  try {
    return (await response.json()) as TaskApiResponse;
  } catch {
    return {};
  }
};

const request = async (path: string, init?: RequestInit): Promise<TaskApiResponse> => {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      credentials: "include",
      ...init
    });
  } catch {
    throw new Error("Network/CORS error: unable to reach task service.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data.message || "Task request failed");
  }

  return data;
};

export const taskApi = {
  createTask: async (payload: CreateTaskPayload): Promise<{ task: TaskRecord; message: string }> => {
    const response = await request("/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.task) {
      throw new Error("Created task payload missing");
    }

    return {
      task: response.task,
      message: response.message || "Task created successfully"
    };
  },

  getTasks: async (params?: GetTasksParams): Promise<{ tasks: TaskRecord[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params?.assignedTo) query.set("assignedTo", params.assignedTo);
    if (params?.leadId) query.set("leadId", params.leadId);
    if (typeof params?.completed === "boolean") query.set("completed", String(params.completed));
    if (typeof params?.page === "number") query.set("page", String(params.page));
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/task?${query.toString()}` : "/task";
    const response = await request(path, { method: "GET" });
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

  updateTask: async ({ taskId, data }: UpdateTaskPayload): Promise<{ task: TaskRecord; message: string }> => {
    const response = await request(`/task/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.task) {
      throw new Error("Updated task payload missing");
    }

    return {
      task: response.task,
      message: response.message || "Task updated successfully"
    };
  }
};
