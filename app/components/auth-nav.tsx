"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

const LANGS = ["EN", "ES", "FR"] as const;

export default function AuthNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<(typeof LANGS)[number]>("EN");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (isMounted) setUser(null);
          return;
        }

        const payload = (await response.json()) as { user: User };
        if (isMounted) setUser(payload.user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();
    const onAuthChanged = () => {
      void loadUser();
    };
    window.addEventListener("auth-changed", onAuthChanged);

    try {
      const saved = localStorage.getItem("lerna-lang");
      if (saved && LANGS.includes(saved as (typeof LANGS)[number])) {
        setLang(saved as (typeof LANGS)[number]);
      }
    } catch {}

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, [pathname]);

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

  if (isLoading) {
    return (
      <span className="text-xs" style={{ color: "var(--app-muted)" }}>
        ...
      </span>
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/pricing" className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]" style={{ color: pathname === "/pricing" ? "var(--app-fg)" : undefined }}>
          Pricing
        </Link>
        <Link href="/support" className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]">
          Support
        </Link>
        <button
          type="button"
          onClick={cycleLanguage}
          className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]"
          style={{
            color: "#d6e4ff",
            backgroundColor: "color-mix(in srgb, var(--app-card) 78%, transparent)",
          }}
        >
          {lang} v
        </button>
        <Link href="/auth?mode=login" className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-slate-100 transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]">
          Sign In
        </Link>
        <Link
          href="/auth?mode=signup"
          className="rounded-full border px-5 py-1.5 text-sm font-semibold"
          style={{
            borderColor: "white",
            backgroundColor: "white",
            color: "#0a1025",
            boxShadow: "0 0 28px rgba(255,255,255,0.18)",
          }}
        >
          Get Started
        </Link>
      </>
    );
  }

  const activePillStyle = (active: boolean) => ({
    borderColor: "transparent",
    backgroundColor: active ? "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)" : "transparent",
    color: active ? "var(--app-fg)" : "var(--app-muted)",
  });

  return (
    <>
      <button
        type="button"
        onClick={cycleLanguage}
        className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]"
        style={{
          color: "var(--app-muted)",
          backgroundColor: "color-mix(in srgb, var(--app-card) 80%, transparent)",
        }}
      >
        {lang} v
      </button>
      <Link href="/pricing" className="rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]" style={activePillStyle(pathname === "/pricing")}>
        Pricing
      </Link>
      <Link href="/support" className="rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]" style={activePillStyle(pathname === "/support")}>
        Support
      </Link>
      <span
        className="rounded-full border px-3 py-1 text-xs"
        style={{
          borderColor: "var(--app-accent-strong)",
          color: "var(--app-accent-strong)",
          backgroundColor: "color-mix(in srgb, var(--app-bg) 86%, var(--app-card) 14%)",
        }}
      >
        Logged in: {user.name}
      </span>
      <Link href="/profile" className="rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]" style={activePillStyle(pathname === "/profile")}>
        Profile
      </Link>
      <Link href="/settings" className="rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]" style={activePillStyle(pathname === "/settings")}>
        Settings
      </Link>
      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]"
        style={{
          color: "var(--app-muted)",
        }}
      >
        Logout
      </button>
    </>
  );
}
