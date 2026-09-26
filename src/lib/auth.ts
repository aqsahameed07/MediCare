export type DemoRole = "patient" | "doctor" | "admin";

export interface DemoSession {
  role: DemoRole;
  name: string;
  email: string;
}

const KEY = "mediai-demo-session";

export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function signIn(session: DemoSession) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function signOut() {
  window.localStorage.removeItem(KEY);
}

export function dashboardPath(role: DemoRole): "/patient" | "/doctor" | "/admin" {
  return role === "patient" ? "/patient" : role === "doctor" ? "/doctor" : "/admin";
}
