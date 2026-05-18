// Local-storage-backed data layer.
// Designed so we can later swap each function with API calls to a Spring Boot
// (or any) backend without touching UI components.

import { useEffect, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  apiEnabled,
  listExpenses,
  createExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  listWorkers,
  createWorker,
  deleteWorker as apiDeleteWorker,
  listBudgets,
  saveBudgets,
  listCategories,
  saveCategories,
  listWorkStages,
  saveWorkStages,
  getSettings as apiGetSettings,
  updateSettings as apiUpdateSettings,
  apiLogin,
  apiRegister,
  setToken,
} from "@/lib/api";

export type Category =
  | "Material"
  | "Labour"
  | "Interior"
  | "Exterior"
  | "One-Time"
  | "Other";

export type PaymentMode = "Cash" | "UPI" | "Bank Transfer" | "Cheque" | "Card";

export interface Expense {
  id: string;
  date: string; // ISO yyyy-mm-dd
  workStage: string;
  category: Category | string;
  subcategory: string;
  shop: string;
  amount: number;
  paymentMode: PaymentMode;
  notes?: string;
  paid: boolean;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone?: string;
  dailyWage: number;
}

export interface BudgetItem {
  category: string;
  budget: number;
}

export interface Settings {
  totalBudget: number;
  projectName: string;
}

const KEYS = {
  expenses: "bt.expenses",
  workers: "bt.workers",
  categories: "bt.categories",
  workStages: "bt.workStages",
  budgets: "bt.budgets",
  settings: "bt.settings",
  auth: "bt.auth",
  seeded: "bt.seeded.v1",
  credentials: "bt.credentials",
};

const DEFAULT_CATEGORIES: string[] = [
  "Material",
  "Labour",
  "Interior",
  "Exterior",
  "One-Time",
  "Other",
];

const DEFAULT_WORK_STAGES = [
  "Foundation",
  "Plinth",
  "Walls",
  "Roofing",
  "Plastering",
  "Flooring",
  "Electrical",
  "Plumbing",
  "Painting",
  "Finishing",
];

const DEFAULT_WORKERS: Worker[] = [
  { id: "w1", name: "Ramesh", role: "Main Mesthri", phone: "9000000001", dailyWage: 1200 },
  { id: "w2", name: "Suresh", role: "Mason", phone: "9000000002", dailyWage: 900 },
  { id: "w3", name: "Kiran", role: "Helper", phone: "9000000003", dailyWage: 600 },
];

const DEFAULT_BUDGETS: BudgetItem[] = [
  { category: "Material", budget: 1500000 },
  { category: "Labour", budget: 600000 },
  { category: "Interior", budget: 500000 },
  { category: "Exterior", budget: 200000 },
  { category: "One-Time", budget: 200000 },
  { category: "Other", budget: 100000 },
];

const DEFAULT_SETTINGS: Settings = {
  totalBudget: 3500000,
  projectName: "My House",
};

// ---------- low-level helpers ----------
const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  if (isBrowser()) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (isBrowser()) window.removeEventListener("storage", onStorage);
  };
}

// Generic typed hook backed by localStorage with cross-tab + in-tab updates.
export function usePersisted<T>(key: string, fallback: T): T {
  const fallbackJson = JSON.stringify(fallback);
  const raw = useSyncExternalStore(
    subscribe,
    () => (isBrowser() ? localStorage.getItem(key) ?? fallbackJson : fallbackJson),
    () => fallbackJson,
  );
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------- seeding ----------
export function ensureSeed() {
  if (!isBrowser()) return;
  if (localStorage.getItem(KEYS.seeded)) return;
  if (!localStorage.getItem(KEYS.categories))
    write(KEYS.categories, DEFAULT_CATEGORIES);
  if (!localStorage.getItem(KEYS.workStages))
    write(KEYS.workStages, DEFAULT_WORK_STAGES);
  if (!localStorage.getItem(KEYS.workers)) write(KEYS.workers, DEFAULT_WORKERS);
  if (!localStorage.getItem(KEYS.budgets)) write(KEYS.budgets, DEFAULT_BUDGETS);
  if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, DEFAULT_SETTINGS);
  if (!localStorage.getItem(KEYS.expenses)) {
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const seed: Expense[] = [
      {
        id: crypto.randomUUID(),
        date: today,
        workStage: "Foundation",
        category: "Material",
        subcategory: "Cement",
        shop: "Sri Lakshmi Traders",
        amount: 25000,
        paymentMode: "UPI",
        notes: "50 cement bags",
        paid: true,
      },
      {
        id: crypto.randomUUID(),
        date: yest,
        workStage: "Foundation",
        category: "Labour",
        subcategory: "Mason",
        shop: "Suresh",
        amount: 3600,
        paymentMode: "Cash",
        notes: "4 days x 900",
        paid: true,
      },
      {
        id: crypto.randomUUID(),
        date: yest,
        workStage: "Walls",
        category: "Material",
        subcategory: "Bricks",
        shop: "Annapurna Bricks",
        amount: 18500,
        paymentMode: "Bank Transfer",
        notes: "2500 bricks",
        paid: false,
      },
    ];
    write(KEYS.expenses, seed);
  }
  localStorage.setItem(KEYS.seeded, "1");
}

// ---------- accessors ----------
export const getExpenses = () => {
  if (!apiEnabled()) return read<Expense[]>(KEYS.expenses, []);
  return read<Expense[]>(KEYS.expenses, []);
};
export const setExpenses = (v: Expense[]) => write(KEYS.expenses, v);

export const addExpense = (e: Omit<Expense, "id">) => {
  if (!apiEnabled()) {
    const all = getExpenses();
    const next: Expense = { ...e, id: crypto.randomUUID() };
    setExpenses([next, ...all]);
    return next;
  }
  createExpense({
    date: e.date,
    workStage: e.workStage,
    category: e.category,
    subcategory: e.subcategory,
    shop: e.shop,
    amount: e.amount,
    paymentMode: e.paymentMode,
    notes: e.notes,
    paid: e.paid,
  })
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    })
    .catch((err) => console.error("Error creating expense via API:", err));
};

export const deleteExpense = (id: string) => {
  if (!apiEnabled()) {
    setExpenses(getExpenses().filter((x) => x.id !== id));
    return;
  }
  apiDeleteExpense(Number(id))
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    })
    .catch((err) => console.error("Error deleting expense via API:", err));
};

export const updateExpense = (id: string, patch: Partial<Expense>) => {
  if (!apiEnabled()) {
    setExpenses(getExpenses().map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return;
  }
  apiUpdateExpense(Number(id), {
    date: patch.date,
    workStage: patch.workStage,
    category: patch.category,
    subcategory: patch.subcategory,
    shop: patch.shop,
    amount: patch.amount,
    paymentMode: patch.paymentMode,
    notes: patch.notes,
    paid: patch.paid,
  })
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    })
    .catch((err) => console.error("Error updating expense via API:", err));
};

export const getWorkers = () => {
  if (!apiEnabled()) return read<Worker[]>(KEYS.workers, []);
  return read<Worker[]>(KEYS.workers, []);
};
export const setWorkers = (v: Worker[]) => write(KEYS.workers, v);

export const addWorker = (w: Omit<Worker, "id">) => {
  if (!apiEnabled()) {
    const all = getWorkers();
    setWorkers([...all, { ...w, id: crypto.randomUUID() }]);
    return;
  }
  createWorker({
    name: w.name,
    role: w.role,
    phone: w.phone,
    dailyWage: w.dailyWage,
  })
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    })
    .catch((err) => console.error("Error creating worker via API:", err));
};

export const deleteWorker = (id: string) => {
  if (!apiEnabled()) {
    setWorkers(getWorkers().filter((w) => w.id !== id));
    return;
  }
  apiDeleteWorker(Number(id))
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    })
    .catch((err) => console.error("Error deleting worker via API:", err));
};

export const getCategories = () => {
  if (!apiEnabled()) return read<string[]>(KEYS.categories, DEFAULT_CATEGORIES);
  return queryClient.getQueryData<string[]>(["categories"]) ?? DEFAULT_CATEGORIES;
};

export const setCategoriesList = (v: string[]) => {
  if (!apiEnabled()) {
    write(KEYS.categories, v);
    return;
  }
  saveCategories(v)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    })
    .catch((err) => console.error("Error saving categories via API:", err));
};

export const getWorkStages = () => {
  if (!apiEnabled()) return read<string[]>(KEYS.workStages, DEFAULT_WORK_STAGES);
  return queryClient.getQueryData<string[]>(["workStages"]) ?? DEFAULT_WORK_STAGES;
};

export const setWorkStages = (v: string[]) => {
  if (!apiEnabled()) {
    write(KEYS.workStages, v);
    return;
  }
  saveWorkStages(v)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["workStages"] });
    })
    .catch((err) => console.error("Error saving work stages via API:", err));
};

export const getBudgets = () => {
  if (!apiEnabled()) return read<BudgetItem[]>(KEYS.budgets, DEFAULT_BUDGETS);
  return queryClient.getQueryData<BudgetItem[]>(["budgets"]) ?? DEFAULT_BUDGETS;
};

export const setBudgets = (v: BudgetItem[]) => {
  if (!apiEnabled()) {
    write(KEYS.budgets, v);
    return;
  }
  saveBudgets(v)
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    })
    .catch((err) => console.error("Error saving budgets via API:", err));
};

export const getSettings = () => {
  if (!apiEnabled()) return read<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return queryClient.getQueryData<Settings>(["settings"]) ?? DEFAULT_SETTINGS;
};

export const setSettings = (v: Settings) => {
  if (!apiEnabled()) {
    write(KEYS.settings, v);
    return;
  }
  apiUpdateSettings({
    projectName: v.projectName,
    totalBudget: v.totalBudget,
  })
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    })
    .catch((err) => console.error("Error saving settings via API:", err));
};

// hooks
export function useExpenses(): Expense[] {
  if (!apiEnabled()) return usePersisted<Expense[]>(KEYS.expenses, []);
  const { data } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await listExpenses();
      return res.map((e) => ({
        id: String(e.id),
        date: e.date,
        workStage: e.workStage || "",
        category: e.category || "",
        subcategory: e.subcategory || "",
        shop: e.shop || "",
        amount: e.amount,
        paymentMode: (e.paymentMode as any) || "Cash",
        notes: e.notes,
        paid: e.paid,
      }));
    },
  });
  return data || [];
}

export function useWorkers(): Worker[] {
  if (!apiEnabled()) return usePersisted<Worker[]>(KEYS.workers, DEFAULT_WORKERS);
  const { data } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await listWorkers();
      return res.map((w) => ({
        id: String(w.id),
        name: w.name,
        role: w.role || "",
        phone: w.phone || "",
        dailyWage: w.dailyWage || 0,
      }));
    },
  });
  return data || [];
}

export function useCategories(): string[] {
  if (!apiEnabled()) return usePersisted<string[]>(KEYS.categories, DEFAULT_CATEGORIES);
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
  return data || [];
}

export function useWorkStages(): string[] {
  if (!apiEnabled()) return usePersisted<string[]>(KEYS.workStages, DEFAULT_WORK_STAGES);
  const { data } = useQuery({
    queryKey: ["workStages"],
    queryFn: listWorkStages,
  });
  return data || [];
}

export function useBudgets(): BudgetItem[] {
  if (!apiEnabled()) return usePersisted<BudgetItem[]>(KEYS.budgets, DEFAULT_BUDGETS);
  const { data } = useQuery({
    queryKey: ["budgets"],
    queryFn: listBudgets,
  });
  return data || [];
}

export function useSettings(): Settings {
  if (!apiEnabled()) return usePersisted<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: apiGetSettings,
  });
  return data || DEFAULT_SETTINGS;
}

// ---------- auth ----------
export interface AuthState {
  user: string | null;
  token: string | null;
}
const DEFAULT_AUTH: AuthState = { user: null, token: null };

export interface UserCredentials {
  user: string;
  pass: string;
}
const DEFAULT_CREDENTIALS: UserCredentials = { user: "admin", pass: "admin123" };

export const getCredentials = () => read<UserCredentials>(KEYS.credentials, DEFAULT_CREDENTIALS);
export const setCredentials = (c: UserCredentials) => write(KEYS.credentials, c);

export const getAuth = () => read<AuthState>(KEYS.auth, DEFAULT_AUTH);
export const useAuth = () => usePersisted<AuthState>(KEYS.auth, DEFAULT_AUTH);

export async function login(username: string, password: string): Promise<boolean> {
  if (!apiEnabled()) {
    const creds = getCredentials();
    if (
      username.trim().toLowerCase() === creds.user.trim().toLowerCase() &&
      password.trim() === creds.pass.trim()
    ) {
      write<AuthState>(KEYS.auth, {
        user: username.trim(),
        token: `local-${Date.now()}`,
      });
      return true;
    }
    return false;
  }

  try {
    const res = await apiLogin(username.trim(), password.trim());
    setToken(res.token);
    write<AuthState>(KEYS.auth, {
      user: res.username,
      token: res.token,
    });
    return true;
  } catch (err) {
    console.error("API login failed:", err);
    return false;
  }
}

export async function register(username: string, password: string): Promise<boolean> {
  if (!apiEnabled()) {
    setCredentials({
      user: username.trim(),
      pass: password.trim(),
    });
    // Log them in locally immediately
    write<AuthState>(KEYS.auth, {
      user: username.trim(),
      token: `local-${Date.now()}`,
    });
    return true;
  }

  try {
    const res = await apiRegister(username.trim(), password.trim());
    setToken(res.token);
    write<AuthState>(KEYS.auth, {
      user: res.username,
      token: res.token,
    });
    return true;
  } catch (err) {
    console.error("API registration failed:", err);
    return false;
  }
}

export function logout() {
  if (apiEnabled()) {
    setToken(null);
  }
  write<AuthState>(KEYS.auth, DEFAULT_AUTH);
}

export function useEnsureSeed() {
  useEffect(() => {
    if (!apiEnabled()) {
      ensureSeed();
    }
  }, []);
}

// stub to avoid unused import warning if any consumer needs setState pattern
export const _useState = useState;