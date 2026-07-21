// Django REST API client (JWT).
// Point VITE_API_BASE_URL at your running Django backend, e.g. http://127.0.0.1:8000
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const ACCESS_KEY = "farmiq.access";
const REFRESH_KEY = "farmiq.refresh";

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshAccess(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  tokens.set(data.access);
  return true;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = () => {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (tokens.access) headers.set("Authorization", `Bearer ${tokens.access}`);
    return fetch(`${BASE_URL}${path}`, { ...init, headers });
  };
  let res = await doFetch();
  if (res.status === 401 && (await refreshAccess())) {
    res = await doFetch();
  }
  return res;
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function loginWithPassword(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  tokens.set(data.access, data.refresh);
  return data as { access: string; refresh: string };
}

export async function fetchMe() {
  return api<any>("/api/me/");
}

export function logoutTokens() {
  tokens.clear();
}

export { BASE_URL as API_BASE_URL };