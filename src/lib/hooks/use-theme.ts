"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

type Listener = (theme: Theme) => void;
const listeners = new Set<Listener>();
let currentTheme: Theme | null = null;

const broadcast = (theme: Theme) => {
  currentTheme = theme;
  for (const listener of listeners) {
    listener(theme);
  }
};

/**
 * Reads/writes the `.dark` class on `<html>` and persists the choice.
 * Initializes lazily on mount to avoid SSR/client markup mismatches.
 * State is shared across every call site via a module-level store so a
 * toggle in one component (e.g. the nav bar) is reflected everywhere.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = currentTheme ?? readStoredTheme();
    currentTheme = initial;
    // oxlint-disable-next-line react-set-state-in-effect
    setTheme(initial);
    applyTheme(initial);

    const listener: Listener = (next) => setTheme(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setThemeAction = useCallback((next: Theme) => {
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

  return { theme, setTheme: setThemeAction, toggleTheme };
};
