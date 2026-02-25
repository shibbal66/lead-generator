import { AppUser, GetUsersParams, UpdateUserPasswordPayload, UpdateUserPayload } from "../store/slices/userSlice";
import { request } from "./apiClient";

type UserApiResponse = {
  success?: boolean;
  message?: string;
  users?: AppUser[];
  user?: AppUser;
  total?: number;
  page?: number;
  limit?: number;
};

const parseJsonSafe = async (response: Response): Promise<UserApiResponse> =>
{
  try
  {
    return (await response.json()) as UserApiResponse;
  } catch
  {
    return {};
  }
};

const apiRequest = async (path: string, init?: RequestInit): Promise<UserApiResponse> =>
{
  const response = await request(path, init);
  const data = await parseJsonSafe(response);
  if (!response.ok)
  {
    throw new Error(data.message || "User request failed");
  }
  return data;
};

export const userApi = {
  getUsers: async (params?: GetUsersParams) =>
  {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.teamId) query.set("teamId", params.teamId);

    const path = query.toString() ? `/user?${ query.toString() }` : "/user";
    const data = await apiRequest(path, { method: "GET" });

    return {
      users: data.users || [],
      total: data.total || 0,
      page: data.page || params?.page || 1,
      limit: data.limit || params?.limit || 10
    };
  },

  getUserById: async (userId: string): Promise<AppUser> =>
  {
    const data = await apiRequest(`/user/${ userId }`, { method: "GET" });

    if (!data.user)
    {
      throw new Error("User not found");
    }

    return data.user;
  },

  updateUser: async ({ userId, data }: UpdateUserPayload): Promise<{ user: AppUser; message: string; }> =>
  {
    const paths = ["/user", `/user/${ userId }`];
    let lastError: unknown = null;

    for (const path of paths)
    {
      try
      {
        const response = await apiRequest(path, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (!response.user)
        {
          throw new Error("Updated user payload missing");
        }

        return {
          user: response.user,
          message: response.message || "User updated successfully"
        };
      } catch (error)
      {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Failed to update user");
  },

  updateUserPassword: async ({
    oldPassword,
    newPassword
  }: UpdateUserPasswordPayload): Promise<{ user?: AppUser; message: string; }> =>
  {
    const body = new URLSearchParams();
    body.set("oldPassword", oldPassword);
    body.set("newPassword", newPassword);

    const response = await apiRequest("/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    return {
      user: response.user,
      message: response.message || "Password updated successfully"
    };
  },

  deleteUser: async (userId: string): Promise<{ message: string; }> =>
  {
    const data = await apiRequest(`/user/${ userId }`, { method: "DELETE" });
    return {
      message: data.message || "User deleted successfully"
    };
  }
};
