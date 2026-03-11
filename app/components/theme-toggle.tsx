"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

const STORAGE_KEY = "lerna-theme";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return "light";
  }

  const attrTheme = document.documentElement.getAttribute("data-theme");
  if (attrTheme === "dark" || attrTheme === "light") return attrTheme;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setThemePreference(next: Theme) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEY, next);
}

export default function ThemeToggle() {
  const pathname = usePathname();
  const isLandingHeader =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/support" ||
    pathname === "/auth";

  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setTheme(getCurrentTheme());
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  function selectTheme(next: Theme) {
    setThemePreference(next);
    setTheme(next);
  }

  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  }

  if (isLandingHeader) {
    const baseButton = "inline-flex h-6 w-8 items-center justify-center rounded-lg text-xs font-semibold transition";

    return (
      <div
        className="inline-flex items-center gap-0.5 rounded-xl border p-0.5"
        style={{
          borderColor: "color-mix(in srgb, var(--app-border) 75%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--app-card) 85%, transparent)",
        }}
        aria-label="Theme switch"
      >
        <button
          type="button"
          onClick={() => selectTheme("light")}
          className={baseButton}
          aria-pressed={theme === "light"}
          aria-label="Use light mode"
          style={{
            color: theme === "light" ? "var(--app-accent-strong)" : "var(--app-muted)",
            backgroundColor:
              theme === "light"
                ? "color-mix(in srgb, var(--app-accent) 26%, transparent)"
                : "transparent",
          }}
        >
          ☀
        </button>
        <button
          type="button"
          onClick={() => selectTheme("dark")}
          className={baseButton}
          aria-pressed={theme === "dark"}
          aria-label="Use dark mode"
          style={{
            color: theme === "dark" ? "var(--app-accent-strong)" : "var(--app-muted)",
            backgroundColor:
              theme === "dark"
                ? "color-mix(in srgb, var(--app-accent) 26%, transparent)"
                : "transparent",
          }}
        >
          🌙
        </button>
      </div>
    );
  }

  const nextLabel = theme === "light" ? "🌙 Dark" : "☀️ Light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
      style={{
        borderColor: "color-mix(in srgb, var(--app-border) 75%, transparent)",
        color: "var(--app-fg)",
        backgroundColor: "color-mix(in srgb, var(--app-card) 85%, transparent)",
      }}
      aria-label="Toggle theme"
    >
      {nextLabel}
    </button>
  );
}
