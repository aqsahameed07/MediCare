// Deterministic mock dataset for MediAI Care (frontend-only demo).

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260824);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const float = (min: number, max: number, d = 1) =>
  Number((rand() * (max - min) + min).toFixed(d));

export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Physician",
  "Psychiatry",
  "Endocrinology",
  "Pulmonology",
  "Gastroenterology",
] as const;
export type Specialty = (typeof SPECIALTIES)[number];

const FIRST = [
  "Sarah","Ahmed","Ayesha","Daniel","Mariam","Hassan","Emily","Omar","Zara","Noah",
  "Fatima","Lucas","Hina","Bilal","Sofia","Imran","Laila","Adam","Nadia","Yusuf",
  "Clara","Rehan","Amara","Ethan","Sana","Tariq","Iris","Kabir","Mina","Jonas",
];
const LAST = [
  "Khan","Malik","Ahmed","Rivera","Chen","Iqbal","Novak","Haider","Smith","Farooq",
  "Osman","Torres","Raza","Lindqvist","Mehta","Baig","Kaur","Dawson","Siddiqui","Cole",
];
const CITIES = ["Karachi","Lahore","Islamabad","Dubai","London","Toronto","Berlin","Austin"];
const HOSPITALS = [
  "MediAI Central Clinic","Northline Medical Center","Aga Health Institute",
  "Riverside Care Hospital","Vertex Specialty Center",
];
const CONDITIONS = [
  "Hypertension","Type 2 Diabetes","Seasonal Allergy","Migraine","Asthma","Anemia",
  "Acid Reflux","Vitamin D Deficiency","Lower Back Strain","Anxiety Disorder","Common Cold","Influenza",
];
const MEDS = [
  { name: "Amoxicillin", dosage: "500 mg", freq: "3x daily" },
  { name: "Metformin", dosage: "850 mg", freq: "2x daily" },
  { name: "Atorvastatin", dosage: "20 mg", freq: "Once at night" },
  { name: "Cetirizine", dosage: "10 mg", freq: "Once daily" },
  { name: "Omeprazole", dosage: "20 mg", freq: "Before breakfast" },
  { name: "Ibuprofen", dosage: "400 mg", freq: "As needed" },
  { name: "Salbutamol Inhaler", dosage: "2 puffs", freq: "As needed" },
  { name: "Vitamin D3", dosage: "2000 IU", freq: "Once daily" },
];
const TESTS = ["CBC Panel","Lipid Profile","HbA1c","Chest X-Ray","Thyroid Panel","ECG","MRI Brain","Vitamin D"];

export type Role = "patient" | "doctor" | "admin";

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  experience: number;
  rating: number;
  reviews: number;
  fee: number;
  hospital: string;
  city: string;
  nextSlot: string;
  matchScore: number;
  bio: string;
  languages: string[];
  patients: number;
  avatarHue: number;
  verified: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  city: string;
  bloodGroup: string;
  healthScore: number;
  lastVisit: string;
  conditions: string[];
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  avatarHue: number;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "pending";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: Specialty;
  date: string; // ISO date
  time: string;
  mode: "In-person" | "Video";
  status: AppointmentStatus;
  reason: string;
  fee: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  medications: { name: string; dosage: string; freq: string; duration: string }[];
  notes: string;
  refills: number;
  active: boolean;
}

export interface HistoryEvent {
  id: string;
  patientId: string;
  date: string;
  type: "Appointment" | "Diagnosis" | "Prescription" | "Test Result";
  title: string;
  doctor: string;
  detail: string;
  tag: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const BASE = new Date("2026-08-24T00:00:00Z");
function dayOffset(days: number) {
  const d = new Date(BASE.getTime() + days * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
export const TODAY = dayOffset(0);

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

const SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","01:00 PM","01:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];
export const TIME_SLOTS = SLOTS;

export const doctors: Doctor[] = Array.from({ length: 20 }, (_, i) => {
  const name = `Dr. ${pick(FIRST)} ${pick(LAST)}`;
  return {
    id: `doc-${i + 1}`,
    name,
    specialty: SPECIALTIES[i % SPECIALTIES.length]!,
    experience: int(4, 24),
    rating: float(4.2, 5, 1),
    reviews: int(48, 940),
    fee: int(30, 180),
    hospital: pick(HOSPITALS),
    city: pick(CITIES),
    nextSlot: `${dayOffset(int(0, 6))} · ${pick(SLOTS)}`,
    matchScore: int(72, 98),
    bio: "Board-certified specialist focused on preventive care, evidence-based treatment plans and long-term patient outcomes.",
    languages: ["English", pick(["Urdu", "Arabic", "German", "French"])],
    patients: int(320, 4200),
    avatarHue: int(0, 359),
    verified: rand() > 0.25,
  };
});

export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  return {
    id: `pat-${i + 1}`,
    name: `${first} ${last}`,
    age: int(6, 78),
    gender: rand() > 0.5 ? "Male" : "Female",
    city: pick(CITIES),
    bloodGroup: pick(["A+", "B+", "O+", "AB+", "A-", "O-"]),
    healthScore: int(52, 97),
    lastVisit: dayOffset(-int(1, 240)),
    conditions: Array.from({ length: int(1, 3) }, () => pick(CONDITIONS)).filter(
      (v, idx, a) => a.indexOf(v) === idx,
    ),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@mail.com`,
    phone: `+1 (555) ${int(100, 999)}-${int(1000, 9999)}`,
    status: rand() > 0.15 ? "Active" : "Inactive",
    avatarHue: int(0, 359),
  };
});

export const currentPatient = patients[0]!;
export const currentDoctor = doctors[0]!;

const REASONS = ["Routine check-up","Follow-up consultation","Chest pain evaluation","Skin rash review","Migraine assessment","Diabetes management","Annual physical","Post-surgery review"];

export const appointments: Appointment[] = Array.from({ length: 500 }, (_, i) => {
  const p = pick(patients);
  const d = pick(doctors);
  const offset = int(-180, 21);
  let status: AppointmentStatus;
  if (offset < 0) status = rand() > 0.12 ? "completed" : "cancelled";
  else status = rand() > 0.3 ? "upcoming" : "pending";
  return {
    id: `apt-${i + 1}`,
    patientId: p.id,
    patientName: p.name,
    doctorId: d.id,
    doctorName: d.name,
    specialty: d.specialty,
    date: dayOffset(offset),
    time: pick(SLOTS),
    mode: rand() > 0.45 ? "Video" : "In-person",
    status,
    reason: pick(REASONS),
    fee: d.fee,
  };
});

export const prescriptions: Prescription[] = Array.from({ length: 120 }, (_, i) => {
  const p = pick(patients);
  return {
    id: `rx-${i + 1}`,
    patientId: p.id,
    doctorName: pick(doctors).name,
    date: dayOffset(-int(0, 200)),
    medications: Array.from({ length: int(1, 3) }, () => {
      const m = pick(MEDS);
      return { ...m, duration: `${int(5, 30)} days` };
    }),
    notes: "Take with food. Stay hydrated and report any adverse reaction immediately.",
    refills: int(0, 3),
    active: rand() > 0.4,
  };
});

export const history: HistoryEvent[] = Array.from({ length: 90 }, (_, i) => {
  const p = pick(patients);
  const type = pick(["Appointment", "Diagnosis", "Prescription", "Test Result"] as const);
  const doctor = pick(doctors).name;
  const title =
    type === "Diagnosis"
      ? pick(CONDITIONS)
      : type === "Test Result"
        ? `${pick(TESTS)} results`
        : type === "Prescription"
          ? `${pick(MEDS).name} prescribed`
          : `${pick(REASONS)}`;
  return {
    id: `evt-${i + 1}`,
    patientId: p.id,
    date: dayOffset(-int(1, 700)),
    type,
    title,
    doctor,
    detail:
      "Vitals stable. Patient advised on lifestyle adjustments with a scheduled follow-up in four weeks.",
    tag: pick(["Routine", "Chronic", "Urgent", "Preventive"]),
  };
});

export function patientHistory(patientId: string) {
  return history
    .filter((h) => h.patientId === patientId)
    .concat(history.slice(0, 12).map((h) => ({ ...h, patientId })))
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function patientPrescriptions(patientId: string) {
  const own = prescriptions.filter((p) => p.patientId === patientId);
  return (own.length ? own : prescriptions.slice(0, 6).map((p) => ({ ...p, patientId })))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function patientAppointments(patientId: string) {
  const own = appointments.filter((a) => a.patientId === patientId);
  return (own.length ? own : appointments.slice(0, 10).map((a) => ({ ...a, patientId })))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---------- Analytics ----------
const MONTHS = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];

export const appointmentTrend = MONTHS.map((m, i) => ({
  month: m,
  appointments: 180 + i * 22 + int(-30, 45),
  completed: 150 + i * 19 + int(-25, 30),
}));

export const revenueTrend = MONTHS.map((m, i) => ({
  month: m,
  revenue: 42000 + i * 5200 + int(-4000, 6000),
  target: 45000 + i * 5000,
}));

export const patientGrowth = MONTHS.map((m, i) => ({
  month: m,
  patients: 1200 + i * 210 + int(-90, 140),
  newPatients: 90 + int(10, 120),
}));

export const specialtyDistribution = SPECIALTIES.slice(0, 6).map((s) => ({
  name: s,
  value: int(60, 320),
}));

export const doctorWeekly = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => ({
  day: d,
  consultations: int(4, 18),
  revenue: int(400, 2400),
}));

export const healthTrend = ["Mar","Apr","May","Jun","Jul","Aug"].map((m) => ({
  month: m,
  score: int(64, 94),
  restingHr: int(58, 78),
}));

// ---------- AI ----------
export const SYMPTOM_SUGGESTIONS = [
  "Fever","Headache","Sore throat","Fatigue","Cough","Chest pain","Shortness of breath",
  "Dizziness","Nausea","Joint pain","Skin rash","Blurred vision","Back pain","Insomnia",
];

export interface AIAssessment {
  conditions: { name: string; probability: number; severity: "Low" | "Moderate" | "High" }[];
  specialist: Specialty;
  confidence: number;
  urgency: "Self-care" | "See a doctor" | "Urgent";
  advice: string[];
}

const RULES: { match: string[]; result: AIAssessment }[] = [
  {
    match: ["fever", "headache", "sore throat", "cough", "fatigue"],
    result: {
      conditions: [
        { name: "Common Cold", probability: 62, severity: "Low" },
        { name: "Influenza", probability: 48, severity: "Moderate" },
        { name: "Strep Throat", probability: 21, severity: "Moderate" },
      ],
      specialist: "General Physician",
      confidence: 87,
      urgency: "See a doctor",
      advice: [
        "Hydrate with at least 2.5L of fluids daily",
        "Rest for 48 hours and monitor temperature twice a day",
        "Book a consultation if fever exceeds 39°C for 3 days",
      ],
    },
  },
  {
    match: ["chest pain", "shortness of breath", "dizziness"],
    result: {
      conditions: [
        { name: "Angina", probability: 54, severity: "High" },
        { name: "Anxiety Episode", probability: 33, severity: "Moderate" },
        { name: "Arrhythmia", probability: 27, severity: "High" },
      ],
      specialist: "Cardiology",
      confidence: 91,
      urgency: "Urgent",
      advice: [
        "Avoid physical exertion until reviewed",
        "Seek immediate care if pain radiates to the arm or jaw",
        "Bring recent ECG reports to your consultation",
      ],
    },
  },
  {
    match: ["skin rash", "itching"],
    result: {
      conditions: [
        { name: "Contact Dermatitis", probability: 58, severity: "Low" },
        { name: "Urticaria", probability: 39, severity: "Low" },
        { name: "Eczema Flare", probability: 24, severity: "Moderate" },
      ],
      specialist: "Dermatology",
      confidence: 83,
      urgency: "Self-care",
      advice: [
        "Apply a fragrance-free emollient twice daily",
        "Identify and avoid new detergents or cosmetics",
        "Photograph the rash daily to track progression",
      ],
    },
  },
  {
    match: ["joint pain", "back pain"],
    result: {
      conditions: [
        { name: "Mechanical Back Strain", probability: 61, severity: "Low" },
        { name: "Osteoarthritis", probability: 35, severity: "Moderate" },
        { name: "Disc Herniation", probability: 18, severity: "High" },
      ],
      specialist: "Orthopedics",
      confidence: 79,
      urgency: "See a doctor",
      advice: [
        "Apply heat therapy for 15 minutes, twice daily",
        "Avoid lifting above 5kg for one week",
        "Start guided mobility exercises",
      ],
    },
  },
];

export function assessSymptoms(symptoms: string[]): AIAssessment {
  const lower = symptoms.map((s) => s.toLowerCase().trim()).filter(Boolean);
  let best = RULES[0]!;
  let bestScore = -1;
  for (const rule of RULES) {
    const score = rule.match.filter((m) => lower.some((s) => s.includes(m) || m.includes(s))).length;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }
  const conf = Math.min(97, Math.max(64, best.result.confidence - (bestScore === 0 ? 18 : 0) + lower.length));
  return { ...best.result, confidence: conf };
}

export function recommendDoctors(specialty: Specialty | null, limit = 8): Doctor[] {
  const scored = doctors
    .map((d) => ({
      ...d,
      matchScore: Math.min(
        99,
        d.matchScore + (specialty && d.specialty === specialty ? 22 : 0),
      ),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

// ---------- Notifications ----------
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "appointment" | "prescription" | "schedule" | "system";
  time: string;
  read: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", title: "Appointment reminder", body: "Consultation with Dr. Sarah Khan tomorrow at 10:30 AM.", type: "appointment", time: "12m ago", read: false },
  { id: "n2", title: "Prescription updated", body: "Metformin dosage revised to 850 mg, twice daily.", type: "prescription", time: "1h ago", read: false },
  { id: "n3", title: "Schedule change", body: "Dr. Omar Malik moved your Friday slot to 03:00 PM.", type: "schedule", time: "4h ago", read: false },
  { id: "n4", title: "Lab results ready", body: "Your Lipid Profile results are available to review.", type: "system", time: "Yesterday", read: true },
  { id: "n5", title: "Appointment confirmed", body: "Video consultation confirmed for Aug 27, 01:30 PM.", type: "appointment", time: "2d ago", read: true },
];

export const testimonials = [
  { name: "Amelia Rivera", role: "Patient · Austin", quote: "The AI symptom checker pointed me to a cardiologist in minutes. Booking took two taps and the report was waiting before I arrived.", rating: 5 },
  { name: "Dr. Bilal Haider", role: "Neurologist · Lahore", quote: "My clinic runs on MediAI Care. The kanban scheduler alone saved my staff around ten hours every single week.", rating: 5 },
  { name: "Nadia Osman", role: "Clinic Director · Dubai", quote: "Analytics finally tell us which specialties to staff. Revenue per doctor is up 24% since we switched.", rating: 5 },
  { name: "Jonas Lindqvist", role: "Patient · Berlin", quote: "Every prescription, test and diagnosis in one timeline. I stopped carrying a folder of paper to appointments.", rating: 4 },
];

export const platformStats = [
  { label: "Patients cared for", value: 128400, suffix: "+" },
  { label: "Verified doctors", value: 2140, suffix: "" },
  { label: "AI assessments", value: 963000, suffix: "+" },
  { label: "Diagnostic accuracy", value: 94, suffix: "%" },
];

export function bookedSlotsFor(dateISO: string, doctorId: string) {
  const seed = [...(dateISO + doctorId)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = mulberry32(seed);
  return SLOTS.filter(() => r() > 0.62);
}
