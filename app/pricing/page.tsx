import PricingSection from "../components/pricing-section";

export default function PricingPage() {
  return (
    <main className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: "var(--app-bg)" }}>
      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden px-6 pt-16 pb-10">
        <div
          className="hero-grid absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--app-accent) 22%, var(--app-bg)) 0%, var(--app-bg) 55%, var(--app-bg) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p
            className="mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
            style={{
              borderColor: "var(--app-border)",
              color: "var(--app-accent-strong)",
              backgroundColor: "color-mix(in srgb, var(--app-card) 88%, transparent)",
            }}
          >
            <span aria-hidden="true">+</span>
            Student-friendly pricing
          </p>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
            Pick the plan that
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, var(--app-fg), color-mix(in srgb, var(--app-accent) 55%, var(--app-fg)))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              matches your study goals
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl" style={{ color: "var(--app-muted)" }}>
            Get flashcards, quiz practice, deep explanations, and saved topic tracking in one workspace.
            Upgrade only when you need more power.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              "Web + mobile access",
              "Cancel anytime",
              "Secure checkout",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "color-mix(in srgb, var(--app-card) 90%, transparent)",
                }}
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  style={{
                    backgroundColor: "color-mix(in srgb, #22c55e 22%, transparent)",
                    color: "#22c55e",
                  }}
                >
                  v
                </span>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div
              className="rounded-full border px-5 py-2 text-sm font-semibold"
              style={{
                borderColor: "color-mix(in srgb, var(--app-accent) 55%, var(--app-border))",
                backgroundColor: "color-mix(in srgb, var(--app-accent) 14%, transparent)",
                color: "var(--app-accent-strong)",
              }}
            >
              300+ students subscribed this month
            </div>
            <div
              className="rounded-full border px-5 py-2 text-sm font-semibold"
              style={{
                borderColor: "color-mix(in srgb, #22c55e 55%, var(--app-border))",
                backgroundColor: "color-mix(in srgb, #22c55e 12%, transparent)",
                color: "#15803d",
              }}
            >
              Try risk-free and upgrade anytime
            </div>
          </div>

          <article
            className="mx-auto mt-10 max-w-3xl rounded-3xl border p-6 text-left"
            style={{
              borderColor: "var(--app-border)",
              background:
                "linear-gradient(165deg, color-mix(in srgb, var(--app-card) 92%, white 8%), color-mix(in srgb, var(--app-bg) 88%, var(--app-card) 12%))",
            }}
          >
            <p className="text-3xl leading-none" style={{ color: "var(--app-accent-strong)" }}>
              &ldquo;
            </p>
            <p className="mt-3 text-lg italic leading-relaxed md:text-2xl" style={{ color: "var(--app-muted)" }}>
              I was hesitant at first, but the weekly plan helped me test everything risk-free. In two weeks, my
              revision became faster and way more structured.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/120?img=32"
                  alt="Daniel K profile"
                  className="h-12 w-12 rounded-full border object-cover"
                  style={{ borderColor: "var(--app-border)" }}
                />
                <div>
                  <p className="text-xl font-bold">Daniel K.</p>
                  <p className="text-sm" style={{ color: "var(--app-muted)" }}>
                    Medical Student
                  </p>
                </div>
              </div>
              <div className="min-w-[220px] flex-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold" style={{ color: "var(--app-muted)" }}>
                    Student rating
                  </span>
                  <span className="font-bold" style={{ color: "var(--app-fg)" }}>
                    4.9/5
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 55%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "98%",
                      background: "linear-gradient(90deg, #f59e0b 0%, #facc15 55%, #22c55e 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      <PricingSection />
    </main>
  );
}
