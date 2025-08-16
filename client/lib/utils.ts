import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// User data management utilities
export interface CitizenData {
  nic: string;
  displayName: string;
  email: string;
  verificationStatus: string;
}

export interface StaffData {
  userId: string;
  displayName: string;
  email: string;
  role: string;
  phoneNumber: string;
  accountStatus: string;
}

export interface UserData {
  citizen?: CitizenData;
  user?: StaffData;
  refreshToken: string;
  loginMethod: string;
}

export const getUserData = (): UserData | null => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const setUserData = (userData: UserData) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("userData", JSON.stringify(userData));
};

export const clearUserData = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("userData");
};

export const isUserLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;

  const authToken = localStorage.getItem("authToken");
  const userData = getUserData();

  return !!(authToken && userData);
};

export const formatYmdLocal = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const ymdToLocalDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

type Slot = {
  gnAvailabilityId: number;
  userId: string;
  availableDate: string; // "YYYY-MM-DD"
  startTime: string;     // "HH:mm:ss"
  endTime: string;       // "HH:mm:ss"
  status: string;
  gnAppointmentId: number | null;
  user?: any;
};

type GroupedDay = { date: string; slots: Slot[] };

export const groupByDate = (slots: Slot[]): GroupedDay[] => {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    const key = s.availableDate; // already "YYYY-MM-DD"
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b)) // date ASC
    .map(([date, list]) => ({
      date,
      slots: list.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
};