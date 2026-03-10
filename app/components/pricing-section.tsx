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
    price: "$0.70",
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
    price: "$2.40",
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
] as const;

const TRUST_ITEMS = [
  { token: "SSL", title: "Secure Payments", sub: "256-bit SSL" },
  { token: "4.9", title: "Top Rated", sub: "2,000+ reviews" },
  { token: "100K", title: "Active Students", sub: "Learners on platform" },
  { token: "24/7", title: "Instant Access", sub: "Study whenever you need" },
] as const;

export default function PricingSection({ compact = false }: PricingSectionProps) {
  return (
    <section
      className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-6 py-14"
      style={{ backgroundColor: "var(--app-bg)" }}
    >
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
                borderColor: plan.highlight
                  ? "color-mix(in srgb, #c084fc 52%, var(--app-border))"
                  : "color-mix(in srgb, var(--app-border) 84%, rgba(6, 18, 20, 0.85) 16%)",
                background: plan.highlight
                  ? "linear-gradient(180deg, color-mix(in srgb, #9f67ff 20%, rgba(6, 16, 26, 0.96)) 0%, color-mix(in srgb, #6d28d9 26%, rgba(4, 12, 20, 0.98)) 58%, rgba(5, 9, 19, 0.99) 100%)"
                  : "linear-gradient(180deg, color-mix(in srgb, rgba(11, 26, 28, 0.96) 90%, var(--app-card) 10%) 0%, color-mix(in srgb, rgba(6, 17, 19, 0.98) 92%, var(--app-card-soft) 8%) 100%)",
                boxShadow: plan.highlight
                  ? "0 0 0 1px color-mix(in srgb, #d8b4fe 28%, transparent), 0 20px 44px color-mix(in srgb, #4c1d95 52%, transparent), 0 0 72px color-mix(in srgb, #a855f7 28%, transparent)"
                  : "0 20px 40px color-mix(in srgb, black 34%, transparent), inset 0 1px 0 color-mix(in srgb, white 7%, transparent)",
              }}
            >
              {plan.badge ? (
                <span
                  className="absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: plan.highlight
                      ? "linear-gradient(90deg, #7c3aed 0%, #a855f7 55%, #d8b4fe 100%)"
                      : "linear-gradient(90deg, color-mix(in srgb, var(--app-accent-strong) 78%, black 22%), color-mix(in srgb, var(--app-accent) 80%, black 20%))",
                    color: "white",
                    boxShadow: plan.highlight
                      ? "0 0 28px color-mix(in srgb, #a855f7 34%, transparent)"
                      : "0 0 20px color-mix(in srgb, var(--app-accent) 18%, transparent)",
                  }}
                >
                  {plan.badge}
                </span>
              ) : null}

              <p className="text-2xl font-bold">{plan.name}</p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-6xl font-extrabold">{plan.price}</p>
                <p className="pb-2 text-sm md:text-base" style={{ color: "var(--app-muted)" }}>
                  {plan.period}
                </p>
              </div>
              <p className="mt-3 text-lg" style={{ color: "var(--app-muted)" }}>
                {plan.subtitle}
              </p>

              <Link
                href={plan.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-xl font-bold transition-all duration-200 hover:-translate-y-px"
                style={{
                  borderColor: plan.highlight
                    ? "color-mix(in srgb, #d8b4fe 42%, #7c3aed 58%)"
                    : "color-mix(in srgb, var(--app-border) 82%, var(--app-accent) 18%)",
                  background: plan.highlight
                    ? "linear-gradient(90deg, #6d28d9 0%, #8b5cf6 48%, #c084fc 100%)"
                    : "linear-gradient(90deg, color-mix(in srgb, var(--app-accent-strong) 82%, black 18%) 0%, color-mix(in srgb, var(--app-accent) 78%, black 22%) 100%)",
                  color: "white",
                  boxShadow: plan.highlight
                    ? "0 0 34px color-mix(in srgb, #8b5cf6 38%, transparent)"
                    : "0 0 24px color-mix(in srgb, var(--app-accent) 18%, transparent)",
                }}
              >
                {plan.cta}
              </Link>

              <ul className={`mt-6 space-y-3 ${compact ? "text-sm" : "text-lg"}`}>
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: plan.highlight ? "#d8b4fe" : "var(--app-accent-strong)" }}>+</span>
                    <span>{item}</span>
                  </li>
                ))}
                {plan.excludes.map((item) => (
                  <li key={item} className="flex items-start gap-2" style={{ color: "var(--app-muted)" }}>
                    <span style={{ color: "var(--app-muted)" }}>-</span>
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
            borderColor: "color-mix(in srgb, var(--app-border) 78%, rgba(8, 18, 20, 0.92) 22%)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, rgba(10, 21, 24, 0.97) 90%, var(--app-card) 10%) 0%, color-mix(in srgb, rgba(4, 13, 15, 0.99) 94%, var(--app-card-soft) 6%) 100%)",
            boxShadow: "0 20px 42px color-mix(in srgb, black 28%, transparent)",
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="text-center">
              <div
                className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border text-sm font-bold"
                style={{
                  borderColor: "color-mix(in srgb, var(--app-border) 76%, rgba(8, 18, 20, 0.9) 24%)",
                  background:
                    "linear-gradient(160deg, color-mix(in srgb, rgba(10, 28, 30, 0.96) 88%, var(--app-card) 12%), rgba(4, 14, 16, 0.98))",
                  color: "var(--app-accent-strong)",
                }}
              >
                <span aria-hidden="true">{item.token}</span>
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
