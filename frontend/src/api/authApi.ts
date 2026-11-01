// src/api/authApi.ts
// Self-contained auth module: types, HTTP client, session storage, helpers.
// SSR-safe: all localStorage access is guarded by a browser check.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ---------- Types ----------

export type Role = "patient" | "doctor" | "admin" | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  age?: number | null;
  gender?: "Female" | "Male" | "Other" | null;
}

export interface AuthResponse {
  success: true;
  token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------- SSR-safe browser guard ----------

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

// ---------- Session storage ----------

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveSession(token: string, user: AuthUser) {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession(): AuthUser | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function dashboardPath(role: Role): string {
  switch (role) {
    case "doctor":
      return "/doctor";
    case "admin":
    case "superadmin":
      return "/admin/dashboard";
    default:
      return "/patient";
  }
}

// ---------- HTTP ----------

async function post<T>(path: string, body: unknown): Promise<T> {
  console.log(`[POST ${path}] sending:`, body);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  console.log(`[POST ${path}] status=${res.status} response=`, data);

  if (!res.ok) {
    // Try to surface Zod field errors if present
    const zodErrors = (data as { errors?: unknown }).errors;
    let message = (data as { message?: string }).message;
    if (!message && Array.isArray(zodErrors)) {
      message = zodErrors
        .map((e: any) => `${e.path?.join(".") ?? "field"}: ${e.message ?? "invalid"}`)
        .join(", ");
    }
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

// ---------- Public API ----------

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse>("/api/auth/login", { email, password }),

  register: (
    name: string,
    email: string,
    password: string,
    profile: { age: number; gender: "Female" | "Male" | "Other" },
  ) => post<AuthResponse>("/api/auth/register", { name, email, password, ...profile }),

  me: async (): Promise<{ success: true; user: AuthUser }> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError((data as { message?: string }).message ?? "Unauthorized", res.status);
    }
    return data as { success: true; user: AuthUser };
  },

  updatePatientProfile: async (profile: {
    age: number;
    gender: "Female" | "Male" | "Other";
  }): Promise<{ success: true; user: AuthUser }> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError((data as { message?: string }).message ?? "Could not update profile", res.status);
    }
    return data as { success: true; user: AuthUser };
  },

  logout: () => clearSession(),
};
