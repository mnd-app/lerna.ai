"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import StudyroomHeaderActions from "./studyroom-header-actions";
import ThemeToggle from "./theme-toggle";

type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

export default function MobileNav() {
  const pathname = usePathname();
  const isStudyroomHome = pathname === "/studyroom";
  const isStudyroomRoute =
    pathname === "/studyroom" || pathname.startsWith("/studyroom/");

  if (isStudyroomHome) {
    return <StudyroomHeaderActions mobile />;
  }

  if (isStudyroomRoute) {
    return null;
  }

  return <StandardMobileNav pathname={pathname} />;
}

function StandardMobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth?mode=login";
  }

  const linkStyle = (active: boolean) => ({
    backgroundColor: active
      ? "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)"
      : "transparent",
    color: active ? "var(--app-fg)" : "var(--app-muted)",
  });

  const menuLinkClass =
    "block rounded-lg px-2 py-2.5 text-sm font-medium tracking-[0.01em] transition-colors duration-150 hover:bg-[color:color-mix(in_srgb,var(--app-bg)_80%,var(--app-card)_20%)]";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--app-card)_72%,transparent)] hover:shadow-[0_0_16px_color-mix(in_srgb,var(--app-accent)_20%,transparent)]"
        style={{ color: "var(--app-fg)", backgroundColor: "color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%)", border: "1px solid var(--app-border)", boxShadow: "0 10px 24px color-mix(in srgb, var(--app-accent) 16%, transparent)" }}
      >
        <span className="sr-only">Menu</span>
        <span className="relative inline-flex h-4 w-5">
          <span
            className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] h-0.5 w-full rounded-full bg-current transition-all duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-[14px] h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`absolute right-0 top-12 z-50 w-[min(86vw,320px)] rounded-2xl border p-3 shadow-xl transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        }`}
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
      >
          <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--app-border) 75%, transparent)" }}>
            <div className="space-y-1 pb-2">
            <Link href="/pricing" onClick={() => setOpen(false)} className={menuLinkClass} style={linkStyle(pathname === "/pricing")}>
              Pricing
            </Link>
            <Link href="/support" onClick={() => setOpen(false)} className={menuLinkClass} style={linkStyle(pathname === "/support")}>
              Support
            </Link>
            </div>

            {user ? (
              <div className="space-y-1 py-2">
                <Link href="/profile" onClick={() => setOpen(false)} className={menuLinkClass} style={linkStyle(pathname === "/profile")}>
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className={menuLinkClass} style={linkStyle(pathname === "/settings")}>
                  Settings
                </Link>
              </div>
            ) : (
              <div className="space-y-1 py-2">
                <Link href="/auth?mode=login" onClick={() => setOpen(false)} className={menuLinkClass} style={linkStyle(pathname === "/auth")}>
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-center text-sm font-semibold tracking-[0.01em] transition-colors duration-150"
                  style={{
                    border: "1px solid color-mix(in srgb, var(--app-fg) 85%, black 15%)",
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}

            <div className="py-2">
              <div className="flex items-center justify-center rounded-lg px-2">
                <ThemeToggle />
              </div>
            </div>

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="mt-2 block w-full rounded-lg px-2 py-2.5 text-left text-sm font-medium tracking-[0.01em] transition-colors duration-150 hover:bg-[color:color-mix(in_srgb,var(--app-bg)_80%,var(--app-card)_20%)]"
                style={{ color: "var(--app-muted)" }}
              >
                Logout
              </button>
            ) : null}
          </div>
      </div>
    </div>
  );
}

