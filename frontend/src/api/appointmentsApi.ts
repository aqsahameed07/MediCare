import { ApiError, getToken } from "@/api/authApi";

export type AppointmentStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface AppointmentDoctor {
  id: string;
  name: string;
  email: string;
  doctorId: string | null;
  profilePhoto: string | null;
  specialization: string | null;
  department: string | null;
  consultationFee: number | null;
  qualifications: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
}

export interface AppointmentPerson {
  id: string;
  name: string;
  email: string;
}

export interface Appointment {
  id: string;
  date: string;
  slot: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  patient: AppointmentPerson | null;
  doctor: AppointmentDoctor | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}/api/appointments${path}`, {
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

export const appointmentsApi = {
  doctors: async () => {
    const response = await request<{ success: true; doctors: AppointmentDoctor[] }>("/doctors");
    return response.doctors;
  },
  availability: async (doctorId: string, date: string) => {
    const query = new URLSearchParams({ doctorId, date });
    const response = await request<{ success: true; slots: string[] }>(`/availability?${query}`);
    return response.slots;
  },
  list: async () => {
    const response = await request<{ success: true; appointments: Appointment[] }>("");
    return response.appointments;
  },
  create: async (input: { doctorId: string; date: string; slot: string; notes?: string }) => {
    const response = await request<{ success: true; appointment: Appointment }>("", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.appointment;
  },
  updateStatus: async (id: string, status: AppointmentStatus) => {
    const response = await request<{ success: true; appointment: Appointment }>(
      `/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
    return response.appointment;
  },
};

export function formatAppointmentDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
