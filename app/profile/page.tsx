import Link from "next/link";
import { requireUser } from "@/lib/server-auth";

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <section
          className="rounded-2xl border p-6"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
        >
          <p className="text-sm uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-bold">{user.name}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
            {user.email}
          </p>
          <p className="mt-4 text-sm">
            Email status:{" "}
            <span style={{ color: user.verified ? "var(--app-accent-strong)" : "var(--app-muted)" }}>
              {user.verified ? "Verified" : "Not verified"}
            </span>
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm" style={{ color: "var(--app-muted)" }}>
            {user.bio || "No bio yet."}
          </p>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/settings"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--app-accent-strong)" }}
          >
            Edit Profile & Settings
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border px-4 py-2 text-sm"
            style={{ borderColor: "var(--app-border)" }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
