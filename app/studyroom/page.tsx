"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectListItem = {
  id: string;
  topicName: string;
  sourceType: "audio" | "youtube" | "paste_notes" | "document";
};

type User = {
  id: string;
  name: string;
  preferredName: string;
  preferredLanguage: string;
  heardFrom: string;
  learnerType: string;
  onboardingCompleted: boolean;
  email: string;
  verified: boolean;
};

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Arabic",
  "Hindi",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "Turkish",
  "Russian",
  "Swahili",
];

const HEARD_FROM_OPTIONS = ["Other", "Friend", "Instagram", "TikTok", "YouTube", "School", "Search"];
const LEARNER_TYPE_OPTIONS = [
  "Undergraduate Student",
  "Graduate Student",
  "High School Student",
  "Middle School Student",
  "Adult Learner",
  "Teacher",
  "Professional Upskilling",
];

const WELCOME_SLIDES = [
  {
    icon: "*",
    title: "Welcome to lerna.ai",
    subtitle: "Your personalized study space is being prepared.",
  },
  {
    icon: "+",
    title: "Built for your learning style",
    subtitle: "Flashcards, quizzes, and study guides ready to go.",
  },
  {
    icon: "o",
    title: "You're all set! Lets lock in",
    subtitle: "Create your first study set",
  },
] as const;

export default function StudyroomHomePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("Student");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [preferredName, setPreferredName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [heardFrom, setHeardFrom] = useState("Other");
  const [learnerType, setLearnerType] = useState("Undergraduate Student");
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [welcomeSlide, setWelcomeSlide] = useState(0);

  async function loadSubjects() {
    try {
      const response = await fetch("/api/subjects");
      const payload = (await response.json()) as { subjects?: SubjectListItem[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load topics.");
        return;
      }
      setSubjects(payload.subjects ?? []);
    } catch {
      setError("Failed to load topics.");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const meResponse = await fetch("/api/auth/me");
        if (!meResponse.ok) {
          if (mounted) router.replace("/auth?mode=login&next=/studyroom");
          return;
        }

        const mePayload = (await meResponse.json()) as { user: User };
        if (mounted) {
          const preferred = mePayload.user?.preferredName?.trim();
          setUserName(preferred || mePayload.user?.name || "Student");
          setPreferredName(preferred || mePayload.user?.name || "");
          setPreferredLanguage(mePayload.user?.preferredLanguage || "English");
          setHeardFrom(mePayload.user?.heardFrom || "Other");
          setLearnerType(mePayload.user?.learnerType || "Undergraduate Student");
          setNeedsOnboarding(!mePayload.user?.onboardingCompleted);
          setOnboardingStep(1);
        }

        if (mounted) {
          await loadSubjects();
        }
      } catch {
        if (mounted) setError("Failed to load studyroom.");
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!needsOnboarding || onboardingStep !== 2) return;
    const timer = window.setTimeout(() => {
      setWelcomeSlide((prev) => {
        if (prev < WELCOME_SLIDES.length - 1) return prev + 1;
        setNeedsOnboarding(false);
        setOnboardingStep(1);
        return prev;
      });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [needsOnboarding, onboardingStep, welcomeSlide]);

  async function onRename(subject: SubjectListItem) {
    const nextName = window.prompt("Rename subject", subject.topicName)?.trim();
    setMenuOpenId(null);
    if (!nextName || nextName === subject.topicName) return;

    const response = await fetch("/api/subjects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: subject.id, topicName: nextName }),
    });

    if (!response.ok) {
      setError("Failed to rename topic.");
      return;
    }

    await loadSubjects();
  }

  async function onDelete(subject: SubjectListItem) {
    const ok = window.confirm(`Delete \"${subject.topicName}\"?`);
    setMenuOpenId(null);
    if (!ok) return;

    const response = await fetch("/api/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: subject.id }),
    });

    if (!response.ok) {
      setError("Failed to delete topic.");
      return;
    }

    await loadSubjects();
  }

  async function onCompleteOnboarding() {
    setError("");
    const name = preferredName.trim();
    if (!name || !preferredLanguage.trim() || !heardFrom.trim() || !learnerType.trim()) {
      setError("Please complete all onboarding fields.");
      return;
    }

    setIsSavingOnboarding(true);
    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredName: name,
          preferredLanguage,
          heardFrom,
          learnerType,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to save onboarding.");
        return;
      }

      setUserName(name);
      setOnboardingStep(2);
      setWelcomeSlide(0);
    } catch {
      setError("Failed to save onboarding.");
    } finally {
      setIsSavingOnboarding(false);
    }
  }

  const onboardingValid =
    preferredName.trim().length >= 2 &&
    preferredLanguage.trim().length > 0 &&
    heardFrom.trim().length > 0 &&
    learnerType.trim().length > 0;

  if (isCheckingAuth) {
    return (
      <main className="min-h-[calc(100vh-56px)] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm" style={{ color: "var(--app-muted)" }}>
            Checking session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section
          className="rounded-4xl p-6 md:p-9"
          style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}
        >
          <div className="rounded-3xl p-6 md:p-9" style={{ backgroundColor: "var(--app-bg)", color: "var(--app-fg)" }}>
            <h1 className="text-3xl font-bold md:text-5xl">
              Hey {userName}, what do you wanna master?
            </h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link href="/upload" className="rounded-2xl border p-4 shadow-sm transition hover:shadow-md" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}>
                <p className="text-base font-semibold"><span className="mr-2" style={{ color: "var(--app-accent-strong)" }}>^</span>Upload</p>
                <p className="mt-1 text-sm" style={{ color: "var(--app-muted)" }}>Image, file, audio</p>
              </Link>
              <Link href="/upload" className="rounded-2xl border p-4 shadow-sm transition hover:shadow-md" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}>
                <p className="text-base font-semibold"><span className="mr-2" style={{ color: "var(--app-accent-strong)" }}>#</span>Paste</p>
                <p className="mt-1 text-sm" style={{ color: "var(--app-muted)" }}>YouTube, website, text</p>
              </Link>
              <Link href="/upload" className="rounded-2xl border p-4 shadow-sm transition hover:shadow-md" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}>
                <p className="text-base font-semibold"><span className="mr-2" style={{ color: "var(--app-accent-strong)" }}>*</span>Record</p>
                <p className="mt-1 text-sm" style={{ color: "var(--app-muted)" }}>Record live lecture</p>
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <p className="text-sm" style={{ color: "var(--app-accent-strong)" }}>
            {error}
          </p>
        ) : null}

        <section className="ui-panel rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Your Subjects</h2>
            <Link href="/upload" className="ui-btn-primary px-4 py-2 text-sm">
              Add New
            </Link>
          </div>

          {subjects.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--app-muted)" }}>
              No saved topics yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <article key={subject.id} className="relative ui-card rounded-2xl p-4">
                  <Link href={`/studyroom/${subject.id}`} className="block pr-10">
                    <p className="text-lg font-semibold">{subject.topicName}</p>
                    <p className="ui-muted mt-1 text-sm capitalize">{subject.sourceType.replace("_", " ")}</p>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMenuOpenId((prev) => (prev === subject.id ? null : subject.id))}
                    className="absolute right-3 top-3 rounded-md px-2 py-1 text-lg leading-none"
                    style={{ color: "var(--app-muted)" }}
                    aria-label="More options"
                  >
                    ...
                  </button>

                  {menuOpenId === subject.id ? (
                    <div
                      className="absolute right-3 top-11 z-10 w-32 rounded-xl border p-1"
                      style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
                    >
                      <button
                        type="button"
                        onClick={() => void onRename(subject)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:opacity-80"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(subject)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {needsOnboarding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-6">
          <div
            className="w-full max-w-3xl rounded-3xl border p-6 md:p-8"
            style={{
              color: "#111827",
              background: "linear-gradient(160deg, #f8fafc, #eef2ff)",
              borderColor: "rgba(148, 163, 184, 0.45)",
              boxShadow: "0 30px 80px rgba(2, 6, 23, 0.45)",
            }}
          >
            {onboardingStep === 1 ? (
              <>
                <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Personalization Required
                </p>
                <h2 className="mt-2 text-center text-3xl font-bold md:text-4xl">
                  Hey {userName || "there"}, let&apos;s personalize your experience
                </h2>
                <p className="mt-2 text-center text-lg text-slate-500">Complete this before starting your study flow.</p>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 md:p-5 space-y-4">
                  <label className="block text-sm font-semibold">
                    What would you like us to call you?
                    <input
                      value={preferredName}
                      onChange={(event) => setPreferredName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                      placeholder="Preferred name"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Language
                    <select
                      value={preferredLanguage}
                      onChange={(event) => setPreferredLanguage(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang}>{lang}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">
                    How did you hear about us?
                    <select
                      value={heardFrom}
                      onChange={(event) => setHeardFrom(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                    >
                      {HEARD_FROM_OPTIONS.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">
                    What describes you best?
                    <select
                      value={learnerType}
                      onChange={(event) => setLearnerType(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                    >
                      {LEARNER_TYPE_OPTIONS.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: i === 0 ? "#111827" : "rgba(15,23,42,0.2)" }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onCompleteOnboarding()}
                    disabled={isSavingOnboarding || !onboardingValid}
                    className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingOnboarding ? "Saving..." : "Continue"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="py-10 text-center md:py-14">
                  <div key={`slide-${welcomeSlide}`} className="transition-all duration-500 ease-out">
                    <div className="text-6xl leading-none">{WELCOME_SLIDES[welcomeSlide].icon}</div>
                    <h2 className="mt-6 text-3xl font-bold md:text-5xl">{WELCOME_SLIDES[welcomeSlide].title}</h2>
                    <p className="mt-4 text-xl text-slate-500">{WELCOME_SLIDES[welcomeSlide].subtitle}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {WELCOME_SLIDES.map((_, index) => (
                    <span
                      key={`welcome-dot-${index}`}
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: index === welcomeSlide ? 22 : 8,
                        backgroundColor: index === welcomeSlide ? "#111827" : "rgba(15,23,42,0.2)",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}


