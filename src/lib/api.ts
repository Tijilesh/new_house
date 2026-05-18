// Thin REST client for the BuildTrack Spring Boot backend.
// Set VITE_API_BASE_URL in your env (e.g. http://localhost:8080/api).
// When empty, the app falls back to local-storage mode (storage.ts).

const isLocalHostname = (host: string): boolean => {
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "") return true;
  if (host.startsWith("192.168.") || host.startsWith("10.")) return true;
  const parts = host.split(".");
  if (parts.length === 4) {
    const first = Number(parts[0]);
    const second = Number(parts[1]);
    if (first === 172 && second >= 16 && second <= 31) return true;
  }
  return false;
};

const getApiBase = (): string => {
  let base = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
  if (!base) {
    base = `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8082/api`;
  }
  // Cross-device/mobile dynamic replacement:
  // If the page is accessed via an IP address or custom domain, but the API base is configured
  // to use localhost/127.0.0.1, we automatically route requests to the hosting machine's hostname.
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    if (base.includes("localhost") || base.includes("127.0.0.1")) {
      base = base.replace("localhost", window.location.hostname).replace("127.0.0.1", window.location.hostname);
    }
  }
  return base;
};

export const API_BASE: string = getApiBase();

export const apiEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const envUrl = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";
  
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return true;
  }
  
  return isLocalHostname(host);
};

const TOKEN_KEY = "bt.api.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error("VITE_API_BASE_URL is not set");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ---- Auth ----
export interface LoginResponse {
  token: string;
  username: string;
}
export const apiLogin = (username: string, password: string) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const apiRegister = (username: string, password: string) =>
  request<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const apiMe = () => request<{ username: string }>("/auth/me");

// ---- Expenses ----
export interface ApiExpense {
  id?: number;
  date: string;
  workStage?: string;
  category?: string;
  subcategory?: string;
  shop?: string;
  amount: number;
  paymentMode?: string;
  notes?: string;
  paid: boolean;
}
export const listExpenses = () => request<ApiExpense[]>("/expenses");
export const createExpense = (e: ApiExpense) =>
  request<ApiExpense>("/expenses", { method: "POST", body: JSON.stringify(e) });
export const updateExpense = (id: number, patch: Partial<ApiExpense>) =>
  request<ApiExpense>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(patch) });
export const deleteExpense = (id: number) =>
  request<void>(`/expenses/${id}`, { method: "DELETE" });

// ---- Workers ----
export interface ApiWorker {
  id?: number;
  name: string;
  role?: string;
  phone?: string;
  dailyWage?: number;
}
export const listWorkers = () => request<ApiWorker[]>("/workers");
export const createWorker = (w: ApiWorker) =>
  request<ApiWorker>("/workers", { method: "POST", body: JSON.stringify(w) });
export const updateWorker = (id: number, patch: Partial<ApiWorker>) =>
  request<ApiWorker>(`/workers/${id}`, { method: "PUT", body: JSON.stringify(patch) });
export const deleteWorker = (id: number) =>
  request<void>(`/workers/${id}`, { method: "DELETE" });

// ---- Budgets ----
export interface ApiBudgetItem {
  category: string;
  budget: number;
}
export const listBudgets = () => request<ApiBudgetItem[]>("/budgets");
export const saveBudgets = (items: ApiBudgetItem[]) =>
  request<ApiBudgetItem[]>("/budgets", { method: "PUT", body: JSON.stringify(items) });
export const deleteBudget = (category: string) =>
  request<void>(`/budgets/${encodeURIComponent(category)}`, { method: "DELETE" });

// ---- Categories ----
export const listCategories = () => request<string[]>("/categories");
export const saveCategories = (names: string[]) =>
  request<string[]>("/categories", { method: "PUT", body: JSON.stringify(names) });

// ---- Work stages ----
export const listWorkStages = () => request<string[]>("/work-stages");
export const saveWorkStages = (names: string[]) =>
  request<string[]>("/work-stages", { method: "PUT", body: JSON.stringify(names) });

// ---- Settings ----
export interface ApiSettings {
  id?: number;
  totalBudget: number;
  projectName: string;
}
export const getSettings = () => request<ApiSettings>("/settings");
export const updateSettings = (s: ApiSettings) =>
  request<ApiSettings>("/settings", { method: "PUT", body: JSON.stringify(s) });