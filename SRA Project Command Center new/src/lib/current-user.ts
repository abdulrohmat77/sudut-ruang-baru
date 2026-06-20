// Identity without Supabase Auth: just a display name in localStorage.
const KEY = "pmis_user_name";
const DEFAULT = "Anonim";

export function getCurrentUserName(): string {
  if (typeof window === "undefined") return DEFAULT;
  try { return localStorage.getItem(KEY) || DEFAULT; } catch { return DEFAULT; }
}

export function setCurrentUserName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    if (name && name.trim()) localStorage.setItem(KEY, name.trim());
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("pmis-user-changed"));
  } catch { /* ignore */ }
}

import { useEffect, useState } from "react";
export function useCurrentUserName(): [string, (n: string) => void] {
  const [name, setName] = useState<string>(DEFAULT);
  useEffect(() => {
    setName(getCurrentUserName());
    const onChange = () => setName(getCurrentUserName());
    window.addEventListener("pmis-user-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("pmis-user-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return [name, (n: string) => { setCurrentUserName(n); setName(getCurrentUserName()); }];
}