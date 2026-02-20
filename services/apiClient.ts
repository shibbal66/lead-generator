import { BACKEND_URL } from "../config/env";
import { getAccessToken } from "../store/storage";
import { authApi } from "./authApi";


export async function requestPublic(path: string, init?: RequestInit): Promise<Response> {
  const url = `${BACKEND_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers
    }
  });
}


export async function request(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const url = `${BACKEND_URL}${path}`;
  const doFetch = (authToken: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${authToken}`
      }
    });

  let response = await doFetch(token);
  if (response.status === 401) {
    try {
      await authApi.refreshToken();
      const newToken = getAccessToken();
      if (!newToken) throw new Error("No token after refresh");
      response = await doFetch(newToken);
    } catch {
      throw new Error("Session expired. Please sign in again.");
    }
  }
  return response;
}
