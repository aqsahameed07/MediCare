import { ApiError, getToken } from "@/api/authApi";

export type ManagedRole = "patient" | "doctor";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedRole;
  createdAt: string;
  doctorId?: string;
  age?: number;
  profilePhoto?: string | null;
  gender?: "Female" | "Male" | "Other";
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalLicenseNumber?: string;
  department?: string;
  consultationFee?: number;
  bio?: string;
}

export interface ManagedUserInput {
  name: string;
  email: string;
  password?: string;
  role?: ManagedRole;
  age?: number;
  profilePhoto?: string | null;
  gender?: "Female" | "Male" | "Other";
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalLicenseNumber?: string;
  department?: string;
  consultationFee?: number;
  bio?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}/api/admin/users${path}`, {
    ...init,
    headers,
  });

  let data: { message?: string } & T;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("The server returned an invalid response", response.status);
  }

  if (!response.ok) {
    throw new ApiError(data.message ?? `Request failed (${response.status})`, response.status);
  }
  return data;
}

export const adminUsersApi = {
  list: async () => {
    const response = await request<{ success: true; users: ManagedUser[] }>("");
    return response.users;
  },
  create: (input: ManagedUserInput & { role: ManagedRole }) =>
    request<{ success: true; user: ManagedUser }>("", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: ManagedUserInput) =>
    request<{ success: true; user: ManagedUser }>(`/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<{ success: true }>(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
