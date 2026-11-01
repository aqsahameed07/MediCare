import { ApiError, getToken } from "@/api/authApi";

export interface DoctorPatient {
  id: string;
  name: string;
  email: string;
  gender: "Female" | "Male" | "Other" | null;
  age: number | null;
  phone: string | null;
  address: string | null;
  profilePhoto: string | null;
  createdAt: string;
  lastVisit: string | null;
  recordCount: number;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  recommendedTests: string[];
  medications: PrescriptionMedication[];
  instructions: string;
  followUpDate: string;
  createdAt: string;
}

export interface MedicalRecordInput {
  symptoms: string;
  diagnosis: string;
  recommendedTests: string[];
  medications: PrescriptionMedication[];
  instructions: string;
  followUpDate: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}/api/doctor${path}`, { ...init, headers });
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

export const doctorPatientsApi = {
  list: async () => {
    const response = await request<{ success: true; patients: DoctorPatient[] }>("/patients");
    return response.patients;
  },
  records: async (patientId: string) => {
    const response = await request<{ success: true; records: MedicalRecord[] }>(
      `/patients/${encodeURIComponent(patientId)}/records`,
    );
    return response.records;
  },
  createRecord: async (patientId: string, input: MedicalRecordInput) => {
    const response = await request<{ success: true; record: MedicalRecord }>(
      `/patients/${encodeURIComponent(patientId)}/records`,
      { method: "POST", body: JSON.stringify(input) },
    );
    return response.record;
  },
};
