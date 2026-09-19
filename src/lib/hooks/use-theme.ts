"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

type Listener = (theme: Theme) => void;
const listeners = new Set<Listener>();
let currentTheme: Theme | null = null;

function broadcast(theme: Theme) {
  currentTheme = theme;
  for (const listener of listeners) listener(theme);
}

/**
 * Reads/writes the `.dark` class on `<html>` and persists the choice.
 * Initializes lazily on mount to avoid SSR/client markup mismatches.
 * State is shared across every call site via a module-level store so a
 * toggle in one component (e.g. the nav bar) is reflected everywhere.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = currentTheme ?? readStoredTheme();
    currentTheme = initial;
    setThemeState(initial);
    applyTheme(initial);

    const listener: Listener = (next) => setThemeState(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    broadcast(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    broadcast(next);
  }, []);

  return { theme, setTheme, toggleTheme };
}
