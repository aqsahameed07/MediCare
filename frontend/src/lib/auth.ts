const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type Role = "patient" | "doctor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
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

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string }).message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse>("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    post<AuthResponse>("/api/auth/register", { name, email, password }),
};