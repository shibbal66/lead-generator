import {
  AddLeadsToProjectPayload,
  CreateProjectPayload,
  GetProjectsParams,
  ProjectRecord,
  UpdateProjectPayload
} from "../store/slices/projectSlice";
import { request } from "./apiClient";

type ProjectApiResponse = {
  success?: boolean;
  message?: string;
  project?: ProjectRecord;
  projects?: ProjectRecord[];
  total?: number;
  page?: number;
  limit?: number;
};

const parseJsonSafe = async (response: Response): Promise<ProjectApiResponse> => {
  try {
    return (await response.json()) as ProjectApiResponse;
  } catch {
    return {};
  }
};

const apiRequest = async (path: string, init?: RequestInit): Promise<ProjectApiResponse> => {
  const res = await request(path, init);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.message || "Project request failed");
  }
  return data;
};

export const projectApi = {
  createProject: async (payload: CreateProjectPayload): Promise<{ project: ProjectRecord; message: string }> => {
    const response = await apiRequest("/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.project) {
      throw new Error("Created project payload missing");
    }

    return {
      project: response.project,
      message: response.message || "Project created successfully"
    };
  },

  updateProject: async ({ projectId, data }: UpdateProjectPayload): Promise<{ project: ProjectRecord; message: string }> => {
    const response = await apiRequest(`/project/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.project) {
      throw new Error("Updated project payload missing");
    }

    return {
      project: response.project,
      message: response.message || "Project updated successfully"
    };
  },

  getProjects: async (params?: GetProjectsParams): Promise<{ projects: ProjectRecord[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (typeof params?.page === "number") query.set("page", String(params.page));
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/project?${query.toString()}` : "/project";
    const response = await apiRequest(path, { method: "GET" });

    return {
      projects: response.projects || [],
      total: response.total || 0,
      page: response.page || params?.page || 1,
      limit: response.limit || params?.limit || 10
    };
  },

  getProjectById: async (projectId: string): Promise<ProjectRecord> => {
    const response = await apiRequest(`/project/${projectId}`, { method: "GET" });

    if (!response.project) {
      throw new Error("Project not found");
    }

    return response.project;
  },

  addLeadsToProject: async ({ projectId, leadIds }: AddLeadsToProjectPayload): Promise<{ project: ProjectRecord; message: string }> => {
    const response = await apiRequest(`/project/${projectId}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ leadIds })
    });

    if (!response.project) {
      throw new Error("Updated project payload missing after adding leads");
    }

    return {
      project: response.project,
      message: response.message || "Leads added to project successfully"
    };
  },

  removeLeadFromProject: async (projectId: string, leadId: string): Promise<{ projectId: string; leadId: string; message: string }> => {
    const response = await apiRequest(`/project/${projectId}/leads/${leadId}`, {
      method: "DELETE"
    });

    return {
      projectId,
      leadId,
      message: response.message || "Lead removed from project successfully"
    };
  },

  deleteProject: async (projectId: string): Promise<{ projectId: string; message: string }> => {
    const response = await apiRequest(`/project/${projectId}`, {
      method: "DELETE"
    });

    return {
      projectId,
      message: response.message || "Project deleted successfully"
    };
  }
};
