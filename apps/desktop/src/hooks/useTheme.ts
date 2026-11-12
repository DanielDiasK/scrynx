import { useCallback, useState } from "react";

export type Theme = "dark" | "light";

function initialTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  try {
    const stored = localStorage.getItem("scrynx-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggle = useCallback(() => {
    // DOM-first: never read stale React state, safe for rapid clicks and StrictMode
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    try {
      localStorage.setItem("scrynx-theme", nextDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setTheme(nextDark ? "dark" : "light");
  }, []);

  return { theme, toggle };
}
