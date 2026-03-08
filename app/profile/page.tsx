import Link from "next/link";
import { requireUser } from "@/lib/server-auth";

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="ui-panel rounded-3xl p-6 md:p-8">
          <p className="ui-kicker">Profile</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{user.name}</h1>
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

        <div className="flex flex-wrap gap-3">
          <Link href="/settings" className="ui-btn-primary px-5 py-2.5 text-sm">
            Edit Profile & Settings
          </Link>
          <Link href="/dashboard" className="ui-btn-secondary px-5 py-2.5 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
