import Link from "next/link";

type PricingSectionProps = {
  compact?: boolean;
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    subtitle: "Great for trying Lerna and light weekly use",
    cta: "Get Started Free",
    href: "/auth?mode=signup",
    badge: "",
    highlight: false,
    includes: [
      "3 uploads per month",
      "Basic summaries and notes",
      "Up to 20 flashcards per topic",
      "Basic quiz generation",
      "Community support",
    ],
    excludes: ["No audio transcription", "No export formats", "No advanced analytics"],
  },
  {
    name: "Pro Weekly",
    price: "$0.50",
    period: "/week",
    subtitle: "Flexible short-term plan for exam weeks",
    cta: "Try Weekly",
    href: "/auth?mode=signup",
    badge: "Best to Try",
    highlight: false,
    includes: [
      "Unlimited uploads",
      "Long-form explanations + notes",
      "Unlimited flashcards",
      "Advanced quizzes",
      "Audio transcription",
      "PDF export",
      "Priority processing",
      "Email support",
    ],
    excludes: [],
  },
  {
    name: "Pro Monthly",
    price: "$2.00",
    period: "/month",
    subtitle: "Most popular for consistent learning",
    cta: "Go Monthly",
    href: "/auth?mode=signup",
    badge: "Most Popular",
    highlight: true,
    includes: [
      "Everything in Weekly",
      "Unlimited uploads + topics",
      "Advanced AI notes with examples",
      "Unlimited flashcards and quizzes",
      "Audio transcription + YouTube parsing",
      "Export to PDF/Anki (CSV)",
      "Advanced analytics",
      "Priority email support",
    ],
    excludes: [],
  },
  {
    name: "Pro Yearly",
    price: "$15.00",
    period: "/year",
    subtitle: "Best value for committed students",
    cta: "Go Yearly",
    href: "/auth?mode=signup",
    badge: "Save 33%",
    highlight: false,
    includes: [
      "Everything in Monthly",
      "Unlimited everything",
      "Early access features",
      "Custom study workflows",
      "Bulk processing",
      "API access (roadmap)",
      "Priority support",
      "Free future upgrades",
    ],
    excludes: [],
  },
];

export default function PricingSection({ compact = false }: PricingSectionProps) {
  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-[#020817] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Simple, Professional Pricing</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--app-muted)" }}>
            Choose a plan that matches your study intensity. Upgrade anytime as your course load grows.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className="relative rounded-3xl border p-6"
              style={{
                borderColor: plan.highlight ? "#7c3aed" : "var(--app-border)",
                background: plan.highlight
                  ? "linear-gradient(180deg, rgba(124,58,237,0.18) 0%, rgba(13,29,54,1) 45%, rgba(13,29,54,1) 100%)"
                  : "linear-gradient(180deg, rgba(13,29,54,0.95) 0%, rgba(13,29,54,1) 100%)",
                boxShadow: plan.highlight ? "0 0 44px rgba(124,58,237,0.28)" : "var(--app-shadow-soft)",
              }}
            >
              {plan.badge ? (
                <span
                  className="absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: plan.highlight ? "#a855f7" : "#0f766e",
                    color: "white",
                  }}
                >
                  {plan.badge}
                </span>
              ) : null}

              <p className="text-2xl font-bold">{plan.name}</p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-6xl font-extrabold">{plan.price}</p>
                <p className="pb-2 text-3xl" style={{ color: "var(--app-muted)" }}>
                  {plan.period}
                </p>
              </div>
              <p className="mt-3 text-lg" style={{ color: "var(--app-muted)" }}>
                {plan.subtitle}
              </p>

              <Link
                href={plan.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-xl font-bold transition hover:-translate-y-0.5"
                style={{
                  borderColor: plan.highlight ? "#c084fc" : "var(--app-border)",
                  background: plan.highlight
                    ? "linear-gradient(90deg, #7c3aed 0%, #d946ef 100%)"
                    : "color-mix(in srgb, var(--app-card) 88%, black 12%)",
                  color: "white",
                }}
              >
                {plan.cta}
              </Link>

              <ul className={`mt-6 space-y-3 ${compact ? "text-sm" : "text-lg"}`}>
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#86efac" }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
                {plan.excludes.map((item) => (
                  <li key={item} className="flex items-start gap-2" style={{ color: "var(--app-muted)" }}>
                    <span style={{ color: "#fca5a5" }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div
          className="mt-10 grid gap-6 rounded-3xl border p-6 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            borderColor: "var(--app-border)",
            background:
              "radial-gradient(120% 120% at 10% 0%, rgba(37,99,235,0.14) 0%, rgba(2,8,23,0.92) 40%, rgba(2,8,23,1) 100%)",
          }}
        >
          {[
            { icon: "🛡️", title: "Secure Payments", sub: "256-bit SSL" },
            { icon: "⭐", title: "4.9/5 Rating", sub: "2,000+ reviews" },
            { icon: "👥", title: "100K+ Users", sub: "Active students" },
            { icon: "⏱️", title: "Instant Access", sub: "No waiting" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div
                className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "color-mix(in srgb, var(--app-card) 82%, transparent)",
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
              </div>
              <p className="text-2xl font-bold">{item.title}</p>
              <p className="text-lg" style={{ color: "var(--app-muted)" }}>
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
