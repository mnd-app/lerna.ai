import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-16">
      <section className="mx-auto max-w-6xl">
        <div
          className="rounded-3xl border p-8 md:p-12"
          style={{
            borderColor: "var(--app-border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--app-card) 95%, white 5%), var(--app-card))",
          }}
        >
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--app-muted)" }}>
            AI Study Platform
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
            Understand any notes faster with your personal AI tutor.
          </h1>
          <p className="mt-6 max-w-2xl text-lg" style={{ color: "var(--app-muted)" }}>
            Upload class material and get simple explanations, review summaries, and practice
            content in seconds.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: "var(--app-accent-strong)" }}
            >
              Start Studying
            </Link>
            <Link
              href="/upload"
              className="rounded-xl border px-6 py-3 font-semibold"
              style={{ borderColor: "var(--app-border)" }}
            >
              Try Upload Flow
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Quick Summary",
            "Deep Explanation",
            "Practice Quiz",
            "Flashcards",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
            >
              <p className="text-sm" style={{ color: "var(--app-muted)" }}>
                Mode
              </p>
              <p className="mt-1 text-lg font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
