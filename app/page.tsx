import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserFromCookieHeader } from "@/lib/auth";
import ReviewsCarousel from "@/app/components/reviews-carousel";

export default async function Home() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${encodeURIComponent(entry.value)}`)
    .join("; ");
  const user = await getCurrentUserFromCookieHeader(cookieHeader);

  if (user) {
    redirect("/studyroom");
  }

  const testimonials = [
    {
      quote:
        "The progress tracking system is genius. Seeing my level move from unlearned to mastered keeps me motivated.",
      name: "Emran",
      gpa: "4.0 GPA",
      avatar: "https://i.pravatar.cc/120?img=12",
    },
    {
      quote:
        "I was skeptical at first, but Lerna transformed my study routine. The quizzes are spot-on and feedback helps me improve fast.",
      name: "Alain",
      gpa: "3.98 GPA",
      avatar: "https://i.pravatar.cc/120?img=15",
    },
    {
      quote:
        "The flashcard feature is a game-changer. It turns my lecture notes into practice in minutes and improved my test scores.",
      name: "Emily",
      gpa: "4.0 GPA",
      avatar: "https://i.pravatar.cc/120?img=32",
    },
    {
      quote:
        "I use it daily for assignments and revision. It explains tough ideas simply and saves me hours every week.",
      name: "David",
      gpa: "3.95 GPA",
      avatar: "https://i.pravatar.cc/120?img=68",
    },
    {
      quote:
        "My exam prep feels organized now. The study guide and quiz flow helped me jump from average to top scores.",
      name: "Sophia",
      gpa: "3.94 GPA",
      avatar: "https://i.pravatar.cc/120?img=47",
    },
    {
      quote:
        "I upload lecture slides and instantly get useful summaries. It makes long chapters much easier to remember.",
      name: "Noah",
      gpa: "3.91 GPA",
      avatar: "https://i.pravatar.cc/120?img=53",
    },
    {
      quote:
        "The explain mode breaks down difficult theories in plain language. It feels like a personal tutor every day.",
      name: "Ava",
      gpa: "3.97 GPA",
      avatar: "https://i.pravatar.cc/120?img=5",
    },
    {
      quote:
        "I used to reread notes for hours. Now I practice with targeted questions and retain way more information.",
      name: "Liam",
      gpa: "3.9 GPA",
      avatar: "https://i.pravatar.cc/120?img=23",
    },
    {
      quote:
        "The platform helped me track weak topics and fix them before finals. My confidence is way higher now.",
      name: "Zara",
      gpa: "3.96 GPA",
      avatar: "https://i.pravatar.cc/120?img=48",
    },
    {
      quote:
        "I love how the flashcards stay short and meaningful. Perfect for quick revision between classes.",
      name: "Michael",
      gpa: "3.89 GPA",
      avatar: "https://i.pravatar.cc/120?img=66",
    },
    {
      quote:
        "Assignment prep is smoother now. I ask questions from my own notes and get clear, relevant answers.",
      name: "Fatima",
      gpa: "4.0 GPA",
      avatar: "https://i.pravatar.cc/120?img=44",
    },
    {
      quote:
        "The studyroom tabs keep everything in one place. I can switch from guide to quiz without losing flow.",
      name: "Ethan",
      gpa: "3.93 GPA",
      avatar: "https://i.pravatar.cc/120?img=58",
    },
  ];

  const showcaseCards = [
    {
      kicker: "Upload Once",
      title: "Bring in class material fast",
      copy: "Drop PDFs, pasted notes, lecture audio, or links and let Lerna structure the raw content for you.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 18%, var(--app-card)), color-mix(in srgb, var(--app-card) 88%, var(--app-bg) 12%))",
      chrome: "Sources synced",
      type: "upload",
    },
    {
      kicker: "Study Guide",
      title: "Get a clearer explanation",
      copy: "Dense topics become simpler with key ideas, examples, and exam-facing language pulled from your notes.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 14%, var(--app-card)), color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%))",
      chrome: "Concepts simplified",
      type: "guide",
    },
    {
      kicker: "Flashcards",
      title: "Memorize only what matters",
      copy: "Lerna turns high-value points into short, recall-friendly cards for quick review between classes.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 24%, var(--app-card)), color-mix(in srgb, var(--app-card) 90%, var(--app-bg) 10%))",
      chrome: "Short answers",
      type: "flashcards",
    },
    {
      kicker: "Quiz Flow",
      title: "Practice with active recall",
      copy: "Auto-generated quizzes surface weak areas early, so you spend revision time where it counts.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 16%, var(--app-card)), color-mix(in srgb, var(--app-card) 90%, var(--app-bg) 10%))",
      chrome: "Weak spots detected",
      type: "quiz",
    },
    {
      kicker: "Essay Review",
      title: "Tighten writing before submission",
      copy: "Use grading-style feedback to sharpen structure, clarity, and argument quality before handing work in.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 12%, var(--app-card)), color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%))",
      chrome: "Feedback ready",
      type: "essay",
    },
    {
      kicker: "Ask Lerna",
      title: "Study with your own AI tutor",
      copy: "Ask focused questions about your uploaded material and stay inside the context of your class content.",
      tone: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 20%, var(--app-card)), color-mix(in srgb, var(--app-card) 88%, var(--app-bg) 12%))",
      chrome: "Context-aware answers",
      type: "chat",
    },
  ] as const;

  return (
    <main className="min-h-[calc(100vh-56px)] overflow-x-clip px-2.5 py-3 sm:px-5 md:px-6 md:py-8">
      <section className="mx-auto max-w-7xl">
        <div
          className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden px-3 py-7 sm:px-6 sm:py-12 md:py-16"
          style={{ backgroundColor: "transparent" }}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="order-2 relative min-h-[240px] sm:min-h-[380px] lg:order-1">
              <div
                className="rounded-3xl p-4 md:hidden"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--app-card) 90%, var(--app-bg) 10%), color-mix(in srgb, var(--app-bg) 78%, var(--app-card) 22%))",
                  boxShadow: "0 0 70px color-mix(in srgb, var(--app-accent) 20%, transparent)",
                }}
              >
                <div className="rounded-2xl p-3" style={{ backgroundColor: "var(--app-card)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: "var(--app-muted)" }}>Studyroom preview</p>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                      style={{
                        borderColor: "var(--app-border)",
                        color: "var(--app-accent-strong)",
                        backgroundColor: "color-mix(in srgb, var(--app-accent) 10%, transparent)",
                      }}
                    >
                      Session active
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {[
                      { step: "STEP 1", title: "Upload notes", text: "PDF, text, audio, or YouTube links" },
                      { step: "STEP 2", title: "Generate study guide", text: "Clear explanations and examples" },
                      { step: "STEP 3", title: "Practice + retain", text: "Flashcards, quizzes, and progress tracking" },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="rounded-xl border p-3"
                        style={{ borderColor: "var(--app-border)", backgroundColor: "color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%)" }}
                      >
                        <p className="text-[11px] font-semibold" style={{ color: "var(--app-accent-strong)" }}>{item.step}</p>
                        <p className="mt-1 text-lg font-bold">{item.title}</p>
                        <p className="mt-1 text-xs" style={{ color: "var(--app-muted)" }}>{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--app-border)", backgroundColor: "color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%)" }}>
                      <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>Current Topic</p>
                      <p className="mt-0.5 text-base font-bold">Cell Biology</p>
                    </div>
                    <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--app-border)", backgroundColor: "color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%)" }}>
                      <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>Mastery</p>
                      <p className="mt-0.5 text-base font-bold">74%</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-medium" style={{ color: "var(--app-muted)" }}>Progress this week</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 55%, transparent)" }}>
                      <div className="h-full w-[62%] rounded-full" style={{ background: "linear-gradient(90deg, var(--app-accent-strong), var(--app-accent))" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="hidden rounded-3xl border p-8 md:block"
                style={{
                  borderColor: "var(--app-border)",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--app-card) 70%, transparent), color-mix(in srgb, var(--app-bg) 78%, var(--app-card) 22%))",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent-strong)" }}>
                  How Lerna Works
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight">From raw material to exam-ready study flow</h3>
                <p className="mt-3 text-base" style={{ color: "var(--app-muted)" }}>
                  A clean three-step process: upload, generate, and practice.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-5">
                  {[
                    {
                      step: "STEP 1",
                      title: "Upload Material",
                      points: ["PDF, DOC, TXT, or audio", "Paste notes or YouTube links", "Auto text extraction starts"],
                    },
                    {
                      step: "STEP 2",
                      title: "Generate Study Guide",
                      points: ["Concepts simplified clearly", "Key formulas highlighted", "Examples added for context"],
                    },
                    {
                      step: "STEP 3",
                      title: "Practice & Retain",
                      points: ["Flashcards from core points", "Quiz prompts for active recall", "Progress tracked over time"],
                    },
                  ].map((item, idx) => (
                    <div key={item.step} className="relative">
                      <article
                        className="h-full rounded-2xl border p-5"
                        style={{
                          borderColor: "var(--app-border)",
                          backgroundColor: "color-mix(in srgb, var(--app-card) 84%, transparent)",
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--app-accent-strong)" }}>
                          {item.step}
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold">{item.title}</h4>
                        <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--app-muted)" }}>
                          {item.points.map((point) => (
                            <li key={point}>+ {point}</li>
                          ))}
                        </ul>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h1 className="mt-4 text-3xl font-extrabold leading-[1.02] sm:text-5xl md:text-7xl">
                Learn Smarter,
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, color-mix(in srgb, var(--app-accent) 62%, white 38%), color-mix(in srgb, var(--app-accent-strong) 70%, white 30%))",
                  }}
                >
                  Not Harder.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-lg" style={{ color: "var(--app-muted)" }}>
                Turn notes and lectures into AI flashcards, study guides, and quiz practice. Focus on learning, not formatting.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold sm:text-xs" style={{ color: "var(--app-muted)" }}>
                {["PDFS - IMAGES - AUDIO", "FLASHCARDS - NOTES - QUIZZES", "WEB"].map((chip) => (
                  <span key={chip} className="rounded-full border px-4 py-2" style={{ borderColor: "var(--app-border)" }}>
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/studyroom"
                  className="rounded-full px-8 py-3 font-bold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_rgba(47,124,240,0.45)]"
                  style={{ background: "linear-gradient(135deg, var(--app-accent-strong), var(--app-accent))" }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative left-1/2 right-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden px-3 py-7 sm:px-6 sm:py-8"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-center text-base font-medium sm:text-xl md:text-3xl">
              Students at leading universities and organizations trust lerna.ai
            </p>

            <div className="trust-marquee mt-8">
              <div className="trust-track">
                {[
                  { name: "MIT", src: "/logos/mit-logo.png" },
                  { name: "Stanford", src: "/logos/stanford-wordmark.avif" },
                  { name: "Yale", src: "/logos/yale-logo.png" },
                  { name: "UPenn", src: "/logos/upenn-logo.svg" },
                  { name: "Georgia Tech", src: "/logos/georgia-tech-logo.png" },
                  { name: "Cambridge", src: "/logos/cambridge-logo.svg" },
                ].map((item) => (
                  <span key={`a-${item.name}`} className="trust-item">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="trust-logo"
                      loading="lazy"
                    />
                  </span>
                ))}
              </div>
              <div className="trust-track" aria-hidden="true">
                {[
                  { name: "MIT", src: "/logos/mit-logo.png" },
                  { name: "Stanford", src: "/logos/stanford-wordmark.avif" },
                  { name: "Yale", src: "/logos/yale-logo.png" },
                  { name: "UPenn", src: "/logos/upenn-logo.svg" },
                  { name: "Georgia Tech", src: "/logos/georgia-tech-logo.png" },
                  { name: "Cambridge", src: "/logos/cambridge-logo.svg" },
                ].map((item) => (
                  <span key={`b-${item.name}`} className="trust-item">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="trust-logo"
                      loading="lazy"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-3 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold sm:text-4xl md:text-5xl">Our Process</h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-sm sm:text-lg" style={{ color: "var(--app-muted)" }}>
              Every tool in Lerna is built to move a student from raw course material to confident exam prep with less friction and better recall.
            </p>

            <div
              className="process-showcase mt-10 rounded-[2rem] p-4 sm:p-6 lg:p-7"
              style={{
                background: "transparent",
                boxShadow: "none",
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {showcaseCards.map((card, index) => (
                  <article
                    key={card.title}
                    className={`process-card process-card-${(index % 3) + 1} overflow-hidden rounded-[1.4rem] border p-4 sm:p-5`}
                    style={{
                      borderColor: "color-mix(in srgb, var(--app-border) 85%, white 15%)",
                      background: card.tone,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--app-accent-strong)" }}>
                          {card.kicker}
                        </p>
                        <h3 className="mt-2 max-w-[16ch] text-xl font-semibold leading-tight sm:text-2xl">
                          {card.title}
                        </h3>
                      </div>
                      <span
                        className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          borderColor: "color-mix(in srgb, var(--app-border) 70%, white 30%)",
                          backgroundColor: "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)",
                          color: "var(--app-muted)",
                        }}
                      >
                        {card.chrome}
                      </span>
                    </div>

                    <p className="mt-3 max-w-[32ch] text-sm leading-6 sm:text-[15px]" style={{ color: "var(--app-muted)" }}>
                      {card.copy}
                    </p>

                    <div
                      className="mt-4 rounded-[1.15rem] border p-3.5"
                      style={{
                        borderColor: "color-mix(in srgb, var(--app-border) 72%, white 28%)",
                        backgroundColor: "transparent",
                      }}
                    >
                      {card.type === "upload" ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {["PDF", "Audio", "Paste", "Link"].map((chip) => (
                              <span
                                key={chip}
                                className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  borderColor: "var(--app-border)",
                                  backgroundColor: "color-mix(in srgb, var(--app-accent) 14%, transparent)",
                                }}
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2.5">
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                className="process-signal h-2.5 w-2.5 rounded-full"
                                style={{
                                  animationDelay: `${dot * 150}ms`,
                                  backgroundColor: "var(--app-accent-strong)",
                                }}
                              />
                            ))}
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 70%, transparent)" }}>
                              <div className="process-loader h-full w-2/3 rounded-full" />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {card.type === "guide" ? (
                        <div className="space-y-2.5">
                          {[
                            "Key themes pulled out clearly",
                            "Important formulas highlighted",
                            "Examples connected to class context",
                          ].map((line, lineIndex) => (
                            <div key={line} className="flex items-center gap-2.5">
                              <span
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                                style={{
                                  color: "var(--app-accent-strong)",
                                  backgroundColor: "color-mix(in srgb, var(--app-accent) 16%, transparent)",
                                }}
                              >
                                {lineIndex + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="h-2 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 75%, transparent)" }}>
                                  <div
                                    className="process-meter h-2 rounded-full"
                                    style={{ width: `${84 - lineIndex * 14}%` }}
                                  />
                                </div>
                                <p className="mt-1 text-xs sm:text-[13px]" style={{ color: "var(--app-muted)" }}>
                                  {line}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {card.type === "flashcards" ? (
                        <div className="relative flex min-h-[148px] items-center justify-center">
                          <div
                            className="process-card-stack absolute h-28 w-40 rounded-[1.1rem] border"
                            style={{
                              borderColor: "color-mix(in srgb, var(--app-border) 65%, white 35%)",
                              backgroundColor: "transparent",
                              transform: "translate(-12px, 8px) rotate(-7deg)",
                            }}
                          />
                          <div
                            className="process-card-stack relative z-10 h-28 w-40 rounded-[1.1rem] border p-4"
                            style={{
                              borderColor: "color-mix(in srgb, var(--app-border) 72%, white 28%)",
                              backgroundColor: "transparent",
                              transform: "rotate(-4deg)",
                            }}
                          >
                            <p className="text-3xl font-semibold leading-tight">Right atrium</p>
                            <p className="mt-3 text-xs" style={{ color: "var(--app-muted)" }}>
                              Short answer card
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {card.type === "quiz" ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold">Which process produces ATP for the cell?</p>
                          {[
                            { label: "Cellular respiration", active: true },
                            { label: "Mitosis", active: false },
                            { label: "Diffusion", active: false },
                          ].map((option) => (
                            <div
                              key={option.label}
                              className="flex items-center justify-between rounded-xl border px-3 py-2"
                              style={{
                                borderColor: option.active
                                  ? "color-mix(in srgb, var(--app-accent-strong) 68%, var(--app-border))"
                                  : "var(--app-border)",
                                backgroundColor: option.active
                                  ? "color-mix(in srgb, var(--app-accent) 14%, transparent)"
                                  : "color-mix(in srgb, var(--app-bg) 88%, var(--app-card) 12%)",
                              }}
                            >
                              <span className="text-sm">{option.label}</span>
                              <span
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
                                style={{
                                  color: option.active ? "var(--app-accent-strong)" : "var(--app-muted)",
                                  backgroundColor: option.active
                                    ? "color-mix(in srgb, var(--app-accent) 20%, transparent)"
                                    : "color-mix(in srgb, var(--app-border) 50%, transparent)",
                                }}
                              >
                                {option.active ? "A" : "•"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {card.type === "essay" ? (
                        <div className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--app-muted)" }}>
                                Grade preview
                              </p>
                              <p className="mt-1 text-4xl font-bold leading-none">86%</p>
                            </div>
                            <span
                              className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                borderColor: "var(--app-border)",
                                color: "var(--app-accent-strong)",
                                backgroundColor: "color-mix(in srgb, var(--app-accent) 12%, transparent)",
                              }}
                            >
                              Strong draft
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 70%, transparent)" }}>
                            <div className="process-loader h-full w-[86%] rounded-full" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium" style={{ color: "var(--app-muted)" }}>
                            <span className="rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--app-border)" }}>Clarity</span>
                            <span className="rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--app-border)" }}>Structure</span>
                            <span className="rounded-lg border px-2 py-1.5" style={{ borderColor: "var(--app-border)" }}>Evidence</span>
                          </div>
                        </div>
                      ) : null}

                      {card.type === "chat" ? (
                        <div className="space-y-3">
                          <div
                            className="max-w-[85%] rounded-2xl rounded-bl-md border px-3 py-2 text-sm"
                            style={{
                              borderColor: "var(--app-border)",
                              backgroundColor: "color-mix(in srgb, var(--app-bg) 88%, var(--app-card) 12%)",
                            }}
                          >
                            Explain the hardest idea from this chapter.
                          </div>
                          <div
                            className="ml-auto max-w-[88%] rounded-2xl rounded-br-md border px-3 py-2 text-sm"
                            style={{
                              borderColor: "color-mix(in srgb, var(--app-accent-strong) 60%, var(--app-border))",
                              backgroundColor: "color-mix(in srgb, var(--app-accent) 14%, transparent)",
                            }}
                          >
                            Lerna uses your notes to break it down into plain steps and examples.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div
          className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden px-3 py-10 sm:px-6 sm:py-14"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold md:text-4xl">
              Trusted by 100k+ students
            </h2>

            <ReviewsCarousel testimonials={testimonials} />
          </div>
        </div>

        <div
          className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-3 py-10 sm:px-6 sm:py-14"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold md:text-5xl">
              Why Students Choose Lerna Over Old Study Habits
            </h2>
            <p className="mx-auto mt-4 max-w-4xl text-center text-base sm:text-xl" style={{ color: "var(--app-muted)" }}>
              Lerna helps you study with less stress and better results by turning your class material into focused,
              practical learning workflows.
            </p>

            <div className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-3">
              {[
                {
                  title: "Memory That Actually Sticks",
                  icon: "B",
                  tone: "color-mix(in srgb, var(--app-accent) 24%, var(--app-card))",
                  old: [
                    "Passive rereading with low retention",
                    "Random revision with no system",
                    "No clear signal on weak concepts",
                  ],
                  newWay: [
                    "Active-recall prompts from your own notes",
                    "Spaced review flow built into study sessions",
                    "Immediate feedback on what to relearn",
                  ],
                },
                {
                  title: "Faster Start, Better Personalization",
                  icon: "Z",
                  tone: "color-mix(in srgb, var(--app-accent) 20%, var(--app-card))",
                  old: [
                    "Long prep before real studying begins",
                    "One-size-fits-all study materials",
                    "Difficult to adjust as exams get closer",
                  ],
                  newWay: [
                    "Upload once and generate study assets instantly",
                    "Explanations matched to your level",
                    "Practice set adapts with your progress",
                  ],
                },
                {
                  title: "More Value in One Studyroom",
                  icon: "$",
                  tone: "color-mix(in srgb, var(--app-accent) 16%, var(--app-card))",
                  old: [
                    "Paying for multiple disconnected tools",
                    "Costly tutoring for routine review",
                    "Limited help outside fixed schedules",
                  ],
                  newWay: [
                    "All core study modes in one platform",
                    "Affordable plans with practical coverage",
                    "Anytime access across your study workflow",
                  ],
                },
              ].map((card) => (
                <article
                  key={card.title}
                  className="overflow-hidden rounded-3xl border"
                  style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
                >
                  <div className="border-b p-5" style={{ borderColor: "var(--app-border)", backgroundColor: card.tone }}>
                    <div className="mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: "color-mix(in srgb, white 70%, transparent)" }}>
                      {card.icon}
                    </div>
                    <p className="text-xl font-bold sm:text-2xl">{card.title}</p>
                  </div>

                  <div className="space-y-5 p-5">
                    <div>
                      <p className="text-sm font-bold tracking-[0.18em]" style={{ color: "var(--app-muted)" }}>
                        BEFORE
                      </p>
                      <ul className="mt-3 space-y-2.5 text-base sm:text-lg">
                        {card.old.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--app-accent) 18%, transparent)", color: "var(--app-muted)" }}>
                              x
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: "var(--app-border)" }} />
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          color: "var(--app-accent-strong)",
                          backgroundColor: "color-mix(in srgb, var(--app-accent) 22%, transparent)",
                        }}
                      >
                        ✓
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: "var(--app-border)" }} />
                    </div>

                    <div>
                      <p className="text-sm font-bold tracking-[0.18em]" style={{ color: "var(--app-accent-strong)" }}>
                        WITH LERNA
                      </p>
                      <ul className="mt-3 space-y-2.5 text-base sm:text-lg">
                        {card.newWay.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--app-accent) 26%, transparent)", color: "var(--app-accent-strong)" }}>
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-3 py-10 sm:px-6 sm:py-14"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold md:text-5xl">Frequently Asked Questions</h2>

            <div className="mt-10 space-y-4">
              {[
                {
                  q: "What does Lerna create from my study material?",
                  a: "Lerna can turn your uploads into study guides, short summaries, flashcards, quiz questions, and clearer explanations based on your own notes.",
                },
                {
                  q: "Which file types can I upload?",
                  a: "You can currently use pasted text, PDF and document files, audio recordings, and YouTube links. Support for more formats can be added as we expand the upload pipeline.",
                },
                {
                  q: "How much can I use for free?",
                  a: "The free tier is meant to help you get started quickly. Limits can vary by feature, and usage details are shown in-app as you study.",
                },
                {
                  q: "Can I export flashcards or notes?",
                  a: "Export options are being expanded. Right now, your generated study content is saved in your workspace, and dedicated export formats are planned next.",
                },
                {
                  q: "Does it handle long lectures and dense PDFs?",
                  a: "Yes. Lerna is designed to process long material by breaking it into manageable chunks, then generating focused outputs you can review faster.",
                },
                {
                  q: "Will my saved topics stay available later?",
                  a: "Yes. Topics are stored to your account so you can come back, rename them, and continue studying from your previous progress.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border p-0"
                  style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
                >
                  <summary className="cursor-pointer list-none px-4 py-4 text-lg font-semibold marker:content-none sm:px-6 sm:py-5 sm:text-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <span>{item.q}</span>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center transition-all duration-300 ease-out group-open:rotate-180 group-open:translate-y-0.5"
                        style={{ color: "var(--app-muted)" }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 pb-5 pt-1 text-sm leading-relaxed sm:px-6 sm:pb-6 sm:text-lg" style={{ color: "var(--app-muted)" }}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <footer
          className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border-t px-3 py-10 sm:px-6 sm:py-14"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-bg)" }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
              <div className="xl:col-span-1">
                <div className="flex items-center">
                  <img
                    src="/lerna-mobile-logo.svg"
                    alt="lerna"
                    className="h-12 w-auto object-contain sm:hidden"
                    loading="lazy"
                  />
                  <img
                    src="/lerna-web-logo.svg"
                    alt="lerna"
                    className="hidden h-10 w-auto object-contain sm:block"
                    loading="lazy"
                  />
                </div>
                <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: "var(--app-muted)" }}>
                  Study tools built to help students understand faster, remember longer, and perform better in class.
                </p>
                <div className="mt-5 flex gap-3 text-sm font-semibold">
                  <a href="#" className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>Instagram</a>
                  <a href="#" className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>LinkedIn</a>
                  <a href="#" className="rounded-full border px-3 py-1.5" style={{ borderColor: "var(--app-border)" }}>X</a>
                </div>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Core Features</p>
                <div className="mt-4 space-y-2 text-base sm:text-lg" style={{ color: "var(--app-muted)" }}>
                  <p>Study Guides</p>
                  <p>Flashcards</p>
                  <p>Quiz Practice</p>
                  <p>Deep Explanations</p>
                  <p>Progress Tracking</p>
                </div>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Study Tools</p>
                <div className="mt-4 space-y-2 text-base sm:text-lg" style={{ color: "var(--app-muted)" }}>
                  <p>PDF to Notes</p>
                  <p>Lecture Audio to Summary</p>
                  <p>YouTube to Flashcards</p>
                  <p>Question Generator</p>
                  <p>Assignment Breakdown</p>
                </div>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Company</p>
                <div className="mt-4 space-y-2 text-base sm:text-lg">
                  <Link href="/pricing" style={{ color: "var(--app-muted)" }}>Pricing</Link>
                  <p><Link href="/support" style={{ color: "var(--app-muted)" }}>Support</Link></p>
                  <p><Link href="/auth?mode=signup" style={{ color: "var(--app-muted)" }}>Create Account</Link></p>
                  <p><Link href="/auth?mode=login" style={{ color: "var(--app-muted)" }}>Sign In</Link></p>
                  <p><Link href="/studyroom" style={{ color: "var(--app-muted)" }}>Open Studyroom</Link></p>
                </div>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Legal</p>
                <div className="mt-4 space-y-2 text-base sm:text-lg" style={{ color: "var(--app-muted)" }}>
                  <p>Privacy Policy</p>
                  <p>Terms of Use</p>
                  <p>Billing Policy</p>
                  <p>Data & Security</p>
                  <p>contact@lerna.ai</p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t pt-6 text-base" style={{ borderColor: "var(--app-border)", color: "var(--app-muted)" }}>
              <p>(c) 2026 Lerna AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}





