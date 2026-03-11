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

export default function AuthNav() {
  const pathname = usePathname();
  const isLandingHeader =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/support" ||
    pathname === "/auth";
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, [pathname]);

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
        <Link
          href="/pricing"
          className="hidden rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(123,163,255,0.25)] sm:inline-flex"
          style={{
            color: pathname === "/pricing" ? "var(--app-fg)" : "var(--app-fg)",
            borderColor: "color-mix(in srgb, var(--app-border) 65%, transparent)",
          }}
        >
          Pricing
        </Link>
        <Link
          href="/support"
          className="hidden rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(123,163,255,0.25)] sm:inline-flex"
          style={{
            color: "var(--app-fg)",
            borderColor: "color-mix(in srgb, var(--app-border) 65%, transparent)",
          }}
        >
          Support
        </Link>
        <Link
          href="/auth?mode=login"
          className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(123,163,255,0.25)]"
          style={{
            color: "var(--app-fg)",
            borderColor: "color-mix(in srgb, var(--app-border) 65%, transparent)",
          }}
        >
          Sign In
        </Link>
        <Link
          href="/auth?mode=signup"
          className="rounded-full border px-5 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(123,163,255,0.35)]"
          style={{
            borderColor: isLandingHeader
              ? "transparent"
              : "color-mix(in srgb, var(--app-fg) 85%, black 15%)",
            background: isLandingHeader
              ? "linear-gradient(135deg, color-mix(in srgb, var(--app-accent-strong) 90%, white 10%), var(--app-accent))"
              : "none",
            backgroundColor: isLandingHeader ? undefined : "white",
            color: isLandingHeader ? "white" : "black",
            boxShadow: isLandingHeader
              ? "0 8px 24px color-mix(in srgb, var(--app-accent) 34%, transparent)"
              : "0 0 18px color-mix(in srgb, var(--app-accent) 20%, transparent)",
            minWidth: isLandingHeader ? "160px" : undefined,
            textAlign: isLandingHeader ? "center" : undefined,
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
      <Link href="/pricing" className="hidden rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)] sm:inline-flex" style={activePillStyle(pathname === "/pricing")}>
        Pricing
      </Link>
      <Link href="/support" className="hidden rounded-full border border-transparent px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-px hover:border-white/25 hover:shadow-[0_0_20px_rgba(123,163,255,0.25)] sm:inline-flex" style={activePillStyle(pathname === "/support")}>
        Support
      </Link>
      <span
        className="hidden rounded-full border px-3 py-1 text-xs lg:inline-flex"
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
