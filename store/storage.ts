import { AuthUser } from "./slices/authTypes";

const AUTH_USER_STORAGE_KEY = "lead_generator_auth_user";
const AUTH_ACCESS_TOKEN_KEY = "lead_generator_access_token";
const AUTH_REFRESH_TOKEN_KEY = "lead_generator_refresh_token";
const AUTH_MANUAL_SIGNOUT_KEY = "lead_generator_manual_signout";

export const getAccessToken = (): string | null =>
  localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
};

export const loadAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveAuthUser = (user: AuthUser): void => {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuthUser = (): void => {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const setManualSignOut = (): void => {
  localStorage.setItem(AUTH_MANUAL_SIGNOUT_KEY, "true");
};

export const clearManualSignOut = (): void => {
  localStorage.removeItem(AUTH_MANUAL_SIGNOUT_KEY);
};

export const isManualSignOut = (): boolean => {
  return localStorage.getItem(AUTH_MANUAL_SIGNOUT_KEY) === "true";
};
