"use client";

type Theme = "light" | "dark";

const STORAGE_KEY = "mnd-theme";

export default function ThemeToggle() {
  function getCurrentTheme(): Theme {
    const attrTheme = document.documentElement.getAttribute("data-theme");
    if (attrTheme === "dark" || attrTheme === "light") return attrTheme;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border px-3 py-1.5 text-xs font-medium"
      style={{
        borderColor: "var(--app-border)",
        color: "var(--app-fg)",
        backgroundColor: "var(--app-card)",
      }}
      aria-label="Toggle theme"
    >
      Toggle theme
    </button>
  );
}
