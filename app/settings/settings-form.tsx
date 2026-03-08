"use client";

import { FormEvent, useState } from "react";

type InitialUser = {
  name: string;
  bio: string;
  verified: boolean;
};

export default function SettingsForm({ initialUser }: { initialUser: InitialUser }) {
  const [name, setName] = useState(initialUser.name);
  const [bio, setBio] = useState(initialUser.bio);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [verifyLink, setVerifyLink] = useState("");
  const [isResending, setIsResending] = useState(false);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to save profile.");
        return;
      }

      setMessage(payload.message ?? "Profile updated.");
    } catch {
      setError("Unexpected error while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  async function resendVerification() {
    setIsResending(true);
    setError("");
    setMessage("");
    setVerifyLink("");

    try {
      const response = await fetch("/api/auth/resend-verification", { method: "POST" });
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        verificationUrl?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to resend verification.");
        return;
      }

      setMessage(payload.message ?? "Verification link generated.");
      setVerifyLink(payload.verificationUrl ?? "");
    } catch {
      setError("Unexpected error while creating verification link.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSave}
        className="rounded-2xl border p-6"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
      >
        <h2 className="text-2xl font-semibold">Edit Profile</h2>

        <label className="mt-5 block text-sm font-medium">
          Display name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-bg)" }}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="mt-1 h-32 w-full rounded-xl border px-3 py-2"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-bg)" }}
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 rounded-xl px-4 py-2 font-semibold text-white disabled:opacity-70"
          style={{ backgroundColor: "var(--app-accent-strong)" }}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <section
        className="rounded-2xl border p-6"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
      >
        <h2 className="text-2xl font-semibold">Email Verification</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
          Status: {initialUser.verified ? "Verified" : "Not verified"}
        </p>

        {!initialUser.verified ? (
          <button
            type="button"
            onClick={resendVerification}
            disabled={isResending}
            className="mt-4 rounded-xl border px-4 py-2 text-sm disabled:opacity-70"
            style={{ borderColor: "var(--app-border)" }}
          >
            {isResending ? "Generating link..." : "Resend verification link"}
          </button>
        ) : null}

        {verifyLink ? (
          <a
            href={verifyLink}
            className="mt-4 block underline"
            style={{ color: "var(--app-accent-strong)" }}
          >
            Open verification link
          </a>
        ) : null}
      </section>

      {error ? <p style={{ color: "var(--app-accent-strong)" }}>{error}</p> : null}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
