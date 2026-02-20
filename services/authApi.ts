import { BACKEND_URL } from "../config/env";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../store/storage";
import {
  AuthUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyAccountPayload
} from "../store/slices/authTypes";

type ApiResponse = {
  success?: boolean;
  message?: string;
  user?: AuthUser & { id?: string };
  accessToken?: string;
  refreshToken?: string;
};

const toFormBody = (payload: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value);
  });
  return params;
};

const parseJsonSafe = async (response: Response): Promise<ApiResponse> => {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
};

const extractErrorMessage = (data: ApiResponse, fallback: string) => {
  return data.message || fallback;
};

const normalizeUser = (raw: ApiResponse["user"]): AuthUser | undefined => {
  if (!raw?.email) return undefined;
  return {
    ...raw,
    userId: raw.id ?? raw.userId,
    email: raw.email
  } as AuthUser;
};

/** Unauthenticated request (login, refresh, signup, verify, forgot/reset password). */
const request = async (path: string, init?: RequestInit): Promise<ApiResponse> => {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      ...init
    });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Network/CORS error: unable to reach authentication server. Check backend CORS origin settings."
        : "Unable to reach authentication server.";
    throw new Error(message);
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Request failed"));
  }

  return data;
};

/** Authenticated request: adds Authorization Bearer token from localStorage. */
const requestWithAuth = async (path: string, init?: RequestInit): Promise<ApiResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Network/CORS error: unable to reach authentication server. Check backend CORS origin settings."
        : "Unable to reach authentication server.";
    throw new Error(message);
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, "Request failed"));
  }

  return data;
};

export const authApi = {
  signup: async (payload: SignUpPayload): Promise<string> => {
    const data = await request("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        name: payload.fullName,
        email: payload.email,
        password: payload.password,
        invitation: payload.invitation
      })
    });

    return data.message || "Verification email sent.";
  },

  verifyAccount: async (payload: VerifyAccountPayload): Promise<string> => {
    const query = new URLSearchParams({ email: payload.email, code: payload.code }).toString();
    const data = await request(`/auth/verify-code?${query}`, {
      method: "GET"
    });

    return data.message || "Account verified successfully.";
  },

  login: async (payload: SignInPayload): Promise<AuthUser> => {
    const data = await request("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        email: payload.email,
        password: payload.password
      })
    });
    if (!data.accessToken || !data.refreshToken || !data.user?.email) {
      throw new Error(data.message || "Invalid login response");
    }
    setTokens(data.accessToken, data.refreshToken);
    const user = normalizeUser(data.user);
    if (!user) throw new Error("Unable to load authenticated user");
    return user;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<string> => {
    const data = await request("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        email: payload.email
      })
    });

    return data.message || "Password reset email sent.";
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<string> => {
    const data = await request("/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        id: payload.id,
        newPassword: payload.newPassword
      })
    });

    return data.message || "Password reset successful.";
  },

  refreshToken: async (): Promise<AuthUser> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");
    const data = await request("/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!data.accessToken || !data.refreshToken || !data.user?.email) {
      throw new Error(data.message || "Invalid refresh response");
    }
    setTokens(data.accessToken, data.refreshToken);
    const user = normalizeUser(data.user);
    if (!user) throw new Error("Unable to load authenticated user");
    return user;
  },

  logout: async (): Promise<void> => {
    try {
      await requestWithAuth("/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
    }
  },

  getMe: async (): Promise<AuthUser> => {
    const data = await requestWithAuth("/auth/me", {
      method: "GET"
    });

    const user = normalizeUser(data.user);
    if (!user) {
      throw new Error("Unable to load authenticated user");
    }
    return user;
  }
};
