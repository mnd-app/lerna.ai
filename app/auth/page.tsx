"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPasswordValidationError,
  PASSWORD_REQUIREMENTS,
} from "@/lib/password-rules";

type AuthMode = "login" | "signup";

type ApiResponse = {
  error?: string;
  message?: string;
  verificationUrl?: string;
};

const PROVIDERS = ["google", "apple", "phone", "facebook", "discord"] as const;

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/studyroom";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const providerError = searchParams.get("error") ?? "";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(providerError);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Login to lerna.ai" : "Create your lerna.ai account"), [mode]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setVerificationUrl("");

    try {
      if (mode === "signup") {
        const passwordError = getPasswordValidationError(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }
      }

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login" ? { email, password } : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok) {
        setError(data.error ?? "Authentication failed.");
        return;
      }

      setMessage(data.message ?? "Success.");
      if (data.verificationUrl) setVerificationUrl(data.verificationUrl);
      window.dispatchEvent(new Event("auth-changed"));
      router.refresh();
      router.push(nextPath);
    } catch {
      setError("Unexpected authentication error.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="ui-panel rounded-3xl p-6 md:p-7">
          <p className="ui-kicker">Account</p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
            Use email/password or continue with a provider.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="rounded-xl border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: mode === "login" ? "var(--app-bg)" : "transparent",
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="rounded-xl border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: mode === "signup" ? "var(--app-bg)" : "transparent",
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {mode === "signup" ? (
              <label className="block text-sm font-medium">
                Name
                <input required value={name} onChange={(event) => setName(event.target.value)} className="ui-input mt-1" />
              </label>
            ) : null}

            <label className="block text-sm font-medium">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ui-input mt-1"
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                required
                type="password"
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="ui-input mt-1"
              />
              {mode === "signup" ? (
                <span className="mt-2 block text-xs font-normal" style={{ color: "var(--app-muted)" }}>
                  {PASSWORD_REQUIREMENTS}
                </span>
              ) : null}
            </label>

            <button type="submit" disabled={isLoading} className="ui-btn-primary w-full py-2.5 disabled:opacity-70">
              {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="my-5 text-center text-xs" style={{ color: "var(--app-muted)" }}>
            OR CONTINUE WITH
          </p>

          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((provider) => (
              <a
                key={provider}
                href={`/api/auth/oauth/${provider}?next=${encodeURIComponent(nextPath)}`}
                className="ui-btn-secondary justify-center rounded-xl px-3 py-2 text-center text-sm capitalize"
              >
                {provider}
              </a>
            ))}
          </div>

          {error ? (
            <p className="mt-4 text-sm" style={{ color: "var(--app-accent-strong)" }}>
              {error}
            </p>
          ) : null}

          {message ? <p className="mt-4 text-sm">{message}</p> : null}
          {verificationUrl ? (
            <Link href={verificationUrl} className="mt-2 inline-block text-sm underline" style={{ color: "var(--app-accent-strong)" }}>
              Verify email now
            </Link>
          ) : null}

          <p className="mt-6 text-sm" style={{ color: "var(--app-muted)" }}>
            By continuing you agree to account security and verification rules.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-56px)] px-6 py-10" />}>
      <AuthPageContent />
    </Suspense>
  );
}
