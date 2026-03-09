"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

const LANGS = ["EN", "ES", "FR"] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<(typeof LANGS)[number]>("EN");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!mounted) return;
        if (!response.ok) {
          setUser(null);
          return;
        }
        const payload = (await response.json()) as { user: User };
        setUser(payload.user);
      } catch {
        if (mounted) setUser(null);
      }
    }

    void loadUser();
    const onAuthChanged = () => {
      void loadUser();
    };
    window.addEventListener("auth-changed", onAuthChanged);

    return () => {
      mounted = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, []);

  function cycleLanguage() {
    const idx = LANGS.indexOf(lang);
    const next = LANGS[(idx + 1) % LANGS.length];
    setLang(next);
    try {
      localStorage.setItem("lerna-lang", next);
    } catch {}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth?mode=login";
  }

  const linkStyle = (active: boolean) => ({
    borderColor: active ? "var(--app-accent-strong)" : "var(--app-border)",
    backgroundColor: active
      ? "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)"
      : "transparent",
    color: active ? "var(--app-fg)" : "var(--app-muted)",
  });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border"
        style={{ borderColor: "var(--app-border)", color: "var(--app-fg)" }}
      >
        <span className="sr-only">Menu</span>
        <span className="relative inline-flex h-4 w-5 flex-col justify-between">
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-50 w-[min(86vw,320px)] rounded-2xl border p-3 shadow-xl"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
        >
          <div className="space-y-2">
            <Link
              href="/studyroom"
              onClick={() => setOpen(false)}
              className="block rounded-xl border px-3 py-2 text-sm font-semibold"
              style={linkStyle(pathname === "/studyroom" || pathname.startsWith("/studyroom/") || pathname === "/dashboard")}
            >
              Studyroom
            </Link>

            <Link href="/pricing" onClick={() => setOpen(false)} className="block rounded-xl border px-3 py-2 text-sm" style={linkStyle(pathname === "/pricing")}>
              Pricing
            </Link>
            <Link href="/support" onClick={() => setOpen(false)} className="block rounded-xl border px-3 py-2 text-sm" style={linkStyle(pathname === "/support")}>
              Support
            </Link>

            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl border px-3 py-2 text-sm" style={linkStyle(pathname === "/profile")}>
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-xl border px-3 py-2 text-sm" style={linkStyle(pathname === "/settings")}>
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth?mode=login" onClick={() => setOpen(false)} className="block rounded-xl border px-3 py-2 text-sm" style={linkStyle(pathname === "/auth")}>
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border px-3 py-2 text-center text-sm font-semibold"
                  style={{
                    borderColor: "color-mix(in srgb, var(--app-fg) 85%, black 15%)",
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  Get Started
                </Link>
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={cycleLanguage}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--app-border)", color: "var(--app-muted)" }}
              >
                {lang} v
              </button>
              <div className="flex items-center justify-center rounded-xl border px-2" style={{ borderColor: "var(--app-border)" }}>
                <ThemeToggle />
              </div>
            </div>

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "var(--app-border)", color: "var(--app-muted)" }}
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
