"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

type Subject = {
  id: string;
  topicName: string;
  sourceType: "audio" | "youtube" | "paste_notes" | "document";
  explanation?: string;
  questions?: string[];
  flashcards?: Array<{ front: string; back: string }>;
};

type SubjectListItem = {
  id: string;
  topicName: string;
};

type ThemePreference = "system" | "light" | "dark";
type User = {
  name: string;
  preferredName?: string;
};

const THEME_STORAGE_KEY = "lerna-theme";

const STUDYROOM_TABS = [
  { id: "study-guide", label: "Study Guide" },
  { id: "studysmart", label: "StudySmart" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
  { id: "faststudy", label: "FastStudy" },
  { id: "deepstudy", label: "DeepStudy" },
] as const;

type TabId = (typeof STUDYROOM_TABS)[number]["id"];

function renderInlineMarkdown(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`t-${index}`}>{part}</span>;
  });
}

function renderStudyGuideLine(line: string, key: string): ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return <div key={key} className="h-1" />;

  if (trimmed.startsWith("### ")) {
    return (
      <h4 key={key} className="pt-2 text-lg font-semibold" style={{ color: "var(--app-fg)" }}>
        {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
      </h4>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h3 key={key} className="pt-3 text-xl font-semibold" style={{ color: "var(--app-fg)" }}>
        {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
      </h3>
    );
  }

  if (trimmed.startsWith("# ")) {
    return (
      <h2 key={key} className="pt-3 text-2xl font-semibold" style={{ color: "var(--app-fg)" }}>
        {renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
      </h2>
    );
  }

  if (/^[-*]\s+/.test(trimmed)) {
    return (
      <p key={key} className="pl-5" style={{ color: "var(--app-muted)" }}>
        - {renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}
      </p>
    );
  }

  if (/^\d+\.\s+/.test(trimmed)) {
    return (
      <p key={key} className="pl-2" style={{ color: "var(--app-muted)" }}>
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  return (
    <p key={key} style={{ color: "var(--app-muted)" }}>
      {renderInlineMarkdown(trimmed)}
    </p>
  );
}

function normalizeTab(value: string | null): TabId {
  const valid = STUDYROOM_TABS.map((tab) => tab.id);
  return (value && valid.includes(value as TabId) ? value : "study-guide") as TabId;
}

export default function StudyroomTopicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = normalizeTab(searchParams.get("tab"));
  const subjectId = params.id;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<SubjectListItem[]>([]);
  const [error, setError] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardBack, setShowCardBack] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<string, "red" | "yellow" | "green">>({});
  const [userName, setUserName] = useState("Student");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const meResponse = await fetch("/api/auth/me");
        if (!meResponse.ok) {
          if (mounted) router.replace(`/auth?mode=login&next=${encodeURIComponent(`/studyroom/${subjectId}`)}`);
          return;
        }
        const mePayload = (await meResponse.json()) as { user: User };
        if (mounted) {
          setUserName(mePayload.user.preferredName?.trim() || mePayload.user.name || "Student");
        }

        const [detailRes, listRes] = await Promise.all([
          fetch(`/api/subjects/${subjectId}`),
          fetch("/api/subjects"),
        ]);

        const detailPayload = (await detailRes.json()) as { subject?: Subject; error?: string };
        const listPayload = (await listRes.json()) as { subjects?: SubjectListItem[] };

        if (!detailRes.ok || !detailPayload.subject) {
          if (mounted) setError(detailPayload.error ?? "Could not load study topic.");
          return;
        }

        if (mounted) {
          setCurrentCardIndex(0);
          setShowCardBack(false);
          setCardStatus({});
          setSubject(detailPayload.subject);
          setSubjects(listPayload.subjects ?? []);
        }
      } catch {
        if (mounted) setError("Failed to load StudyBoard.");
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [router, subjectId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setThemePreference(saved);
        return;
      }
    } catch {}
    setThemePreference("system");
  }, []);

  const questions = useMemo(() => subject?.questions ?? [], [subject?.questions]);
  const flashcards = useMemo(() => subject?.flashcards ?? [], [subject?.flashcards]);
  const explanation = subject?.explanation ?? "";

  const fastSummary = useMemo(() => {
    if (!explanation.trim()) return [];
    return explanation
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .slice(0, 8);
  }, [explanation]);

  const deepSummary = useMemo(() => {
    if (!explanation.trim()) return [];
    return explanation
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .slice(0, 30);
  }, [explanation]);

  const currentCard = flashcards[currentCardIndex] ?? null;
  const currentCardKey = currentCard
    ? `${currentCardIndex}:${currentCard.front}:${currentCard.back}`
    : "";
  const yellowCount = Object.values(cardStatus).filter((value) => value === "yellow").length;
  const greenCount = Object.values(cardStatus).filter((value) => value === "green").length;
  const redExplicitCount = Object.values(cardStatus).filter((value) => value === "red").length;
  const untouchedCount = Math.max(flashcards.length - Object.keys(cardStatus).length, 0);
  const redCount = redExplicitCount + untouchedCount;

  function markCurrentCard(status: "red" | "yellow" | "green") {
    if (!currentCardKey) return;
    setCardStatus((prev) => ({ ...prev, [currentCardKey]: status }));
  }

  function goNextCard() {
    if (flashcards.length === 0) return;
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    setShowCardBack(false);
  }

  function goPreviousCard() {
    if (flashcards.length === 0) return;
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowCardBack(false);
  }

  function applyThemePreference(next: ThemePreference) {
    setThemePreference(next);

    if (typeof window === "undefined" || typeof document === "undefined") return;

    if (next === "system") {
      const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", preferredTheme);
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {}
      return;
    }

    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth?mode=login";
  }

  function renderTabContent() {
    if (!subject) return null;

    if (tab === "study-guide") {
      return (
        <section>
          <h2 className="text-2xl font-semibold">Study Guide</h2>
          <div className="mt-3 space-y-2" style={{ color: "var(--app-muted)" }}>
            {(subject.explanation || "No generated study guide yet for this topic.")
              .split("\n")
              .map((line, index) => renderStudyGuideLine(line, `sg-${index}`))}
          </div>
        </section>
      );
    }

    if (tab === "studysmart") {
      return (
        <section>
          <h2 className="text-2xl font-semibold">StudySmart</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
            Smart review points from your generated content.
          </p>
          {fastSummary.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-6" style={{ color: "var(--app-muted)" }}>
              {fastSummary.map((item, index) => (
                <li key={`smart-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm" style={{ color: "var(--app-muted)" }}>
              Generate from notes first to unlock StudySmart.
            </p>
          )}
        </section>
      );
    }

    if (tab === "flashcards") {
      return (
        <section>
          <h2 className="text-2xl font-semibold">Flashcards</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm" style={{ color: "var(--app-muted)" }}>
            <span>Total: {flashcards.length}</span>
            <span>Haven&apos;t memorized: {redCount}</span>
            <span>Fairly memorized: {yellowCount}</span>
            <span>Memorized: {greenCount}</span>
          </div>

          {flashcards.length === 0 || !currentCard ? (
            <p className="mt-3 text-sm" style={{ color: "var(--app-muted)" }}>
              No flashcards yet for this topic.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm" style={{ color: "var(--app-muted)" }}>
                Card {currentCardIndex + 1} of {flashcards.length}
              </p>

              <button
                type="button"
                onClick={() => setShowCardBack((prev) => !prev)}
                className="flashcard-scene w-full text-left"
              >
                <div className={`flashcard-inner ${showCardBack ? "is-flipped" : ""}`}>
                  <div className="flashcard-face flashcard-front">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
                      Front
                    </p>
                    <p className="mt-4 text-2xl font-semibold leading-snug" style={{ color: "var(--app-fg)" }}>
                      {currentCard.front}
                    </p>
                    <p className="mt-4 text-xs" style={{ color: "var(--app-muted)" }}>
                      Click to flip
                    </p>
                  </div>
                  <div className="flashcard-face flashcard-back">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
                      Back
                    </p>
                    <p className="mt-4 text-xl leading-relaxed" style={{ color: "var(--app-fg)" }}>
                      {currentCard.back}
                    </p>
                    <p className="mt-4 text-xs" style={{ color: "var(--app-muted)" }}>
                      Click to flip back
                    </p>
                  </div>
                </div>
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markCurrentCard("red")}
                  className="rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: "#ef4444", color: "#ef4444" }}
                >
                  Not memorized
                </button>
                <button
                  type="button"
                  onClick={() => markCurrentCard("yellow")}
                  className="rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: "#eab308", color: "#a16207" }}
                >
                  Fairly memorized
                </button>
                <button
                  type="button"
                  onClick={() => markCurrentCard("green")}
                  className="rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: "#22c55e", color: "#15803d" }}
                >
                  Memorized
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goPreviousCard}
                  className="ui-btn-secondary px-3 py-2 text-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNextCard}
                  className="ui-btn-secondary px-3 py-2 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      );
    }

    if (tab === "quiz") {
      return (
        <section>
          <h2 className="text-2xl font-semibold">Quiz</h2>
          {questions.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: "var(--app-muted)" }}>
              No quiz questions yet for this topic.
            </p>
          ) : (
            <ol className="mt-3 list-decimal space-y-2 pl-6" style={{ color: "var(--app-muted)" }}>
              {questions.map((question, index) => (
                <li key={`q-${index}`}>{question}</li>
              ))}
            </ol>
          )}
        </section>
      );
    }

    if (tab === "faststudy") {
      return (
        <section>
          <h2 className="text-2xl font-semibold">FastStudy</h2>
          {fastSummary.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: "var(--app-muted)" }}>
              Quick summary is not available yet.
            </p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-6" style={{ color: "var(--app-muted)" }}>
              {fastSummary.map((item, index) => (
                <li key={`fast-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    return (
      <section>
        <h2 className="text-2xl font-semibold">DeepStudy</h2>
        {deepSummary.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "var(--app-muted)" }}>
            Deep study view is not available yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2" style={{ color: "var(--app-muted)" }}>
            {deepSummary.map((line, index) => (
              <p key={`deep-${index}`}>{line}</p>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[220px_1fr_300px]">
        <aside
          className="ui-panel rounded-3xl p-4 lg:flex lg:min-h-[calc(100vh-120px)] lg:flex-col"
        >
          <h2 className="text-lg font-semibold">StudyBoard</h2>
          <div className="mt-3 space-y-2">
            {STUDYROOM_TABS.map((item) => {
              const active = tab === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/studyroom/${subjectId}?tab=${item.id}`}
                  className="block rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{
                    borderColor: active
                      ? "var(--app-accent-strong)"
                      : "color-mix(in srgb, var(--app-border) 70%, transparent)",
                    backgroundColor: active
                      ? "color-mix(in srgb, var(--app-bg) 86%, var(--app-card) 14%)"
                      : "transparent",
                    color: active ? "var(--app-fg)" : "var(--app-muted)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="relative mt-6 lg:mt-auto">
            {accountMenuOpen ? (
              <div
                className="absolute bottom-14 left-0 z-20 w-full rounded-2xl border p-2 shadow-xl"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%)",
                }}
              >
                <div
                  className="mb-2 grid grid-cols-3 gap-1 rounded-xl border p-1"
                  style={{ borderColor: "var(--app-border)" }}
                >
                  {[
                    { id: "system" as const, icon: "🖥", label: "System" },
                    { id: "light" as const, icon: "☀", label: "Light" },
                    { id: "dark" as const, icon: "🌙", label: "Dark" },
                  ].map((option) => {
                    const active = themePreference === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-label={`Use ${option.label} theme`}
                        aria-pressed={active}
                        onClick={() => applyThemePreference(option.id)}
                        className="rounded-lg py-1.5 text-base transition"
                        style={{
                          color: active ? "var(--app-fg)" : "var(--app-muted)",
                          backgroundColor: active
                            ? "color-mix(in srgb, var(--app-accent) 24%, var(--app-card) 76%)"
                            : "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)",
                          boxShadow: active
                            ? "0 0 0 1px color-mix(in srgb, var(--app-accent-strong) 35%, transparent)"
                            : "none",
                        }}
                      >
                        {option.icon}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <Link href="/pricing" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-muted)" }}>
                    Unlock Unlimited Access
                  </Link>
                  <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                    Profile
                  </Link>
                  <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                    Settings
                  </Link>
                  <Link href="/support" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                    Quick Guide
                  </Link>
                  <Link href="/support" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                    Contact Us
                  </Link>
                </div>

                <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--app-border)" }}>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:opacity-80"
                    style={{ color: "var(--app-fg)" }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              className="mt-4 flex w-full items-center justify-between rounded-lg border px-3 py-2.5"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: "color-mix(in srgb, var(--app-bg) 88%, var(--app-card) 12%)",
              }}
            >
              <p className="text-sm font-semibold">{userName}</p>
              <span style={{ color: "var(--app-muted)" }}>{accountMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </aside>

        <section
          className="ui-panel rounded-3xl p-6"
        >
          <div className="mb-4 lg:hidden">
            <div className="relative">
              {accountMenuOpen ? (
                <div
                  className="mb-3 rounded-2xl border p-2 shadow-xl"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%)",
                  }}
                >
                  <div
                    className="mb-2 grid grid-cols-3 gap-1 rounded-xl border p-1"
                    style={{ borderColor: "var(--app-border)" }}
                  >
                    {[
                      { id: "system" as const, icon: "Sys", label: "System" },
                      { id: "light" as const, icon: "Sun", label: "Light" },
                      { id: "dark" as const, icon: "Moon", label: "Dark" },
                    ].map((option) => {
                      const active = themePreference === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={`Use ${option.label} theme`}
                          aria-pressed={active}
                          onClick={() => applyThemePreference(option.id)}
                          className="rounded-lg py-1.5 text-sm transition"
                          style={{
                            color: active ? "var(--app-fg)" : "var(--app-muted)",
                            backgroundColor: active
                              ? "color-mix(in srgb, var(--app-accent) 24%, var(--app-card) 76%)"
                              : "color-mix(in srgb, var(--app-bg) 84%, var(--app-card) 16%)",
                            boxShadow: active
                              ? "0 0 0 1px color-mix(in srgb, var(--app-accent-strong) 35%, transparent)"
                              : "none",
                          }}
                        >
                          {option.icon}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1">
                    <Link href="/pricing" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-muted)" }}>
                      Unlock Unlimited Access
                    </Link>
                    <Link href="/profile" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                      Profile
                    </Link>
                    <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                      Settings
                    </Link>
                    <Link href="/support" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                      Quick Guide
                    </Link>
                    <Link href="/support" className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: "var(--app-fg)" }}>
                      Contact Us
                    </Link>
                  </div>

                  <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--app-border)" }}>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:opacity-80"
                      style={{ color: "var(--app-fg)" }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "color-mix(in srgb, var(--app-bg) 88%, var(--app-card) 12%)",
                }}
              >
                <p className="text-sm font-semibold">{userName}</p>
                <span style={{ color: "var(--app-muted)" }}>{accountMenuOpen ? "Close" : "Menu"}</span>
              </button>
            </div>
          </div>

          {error ? <p>{error}</p> : null}
          {!subject && !error ? <p>Loading...</p> : null}

          {subject ? (
            <div className="space-y-6">
              <header>
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                      return;
                    }
                    router.push("/studyroom");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:opacity-85"
                  style={{
                    borderColor: "var(--app-border)",
                    color: "var(--app-muted)",
                    backgroundColor: "color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%)",
                  }}
                >
                  Back
                </button>
                <p className="mt-3 text-sm uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
                  StudyBoard Topic
                </p>
                <h1 className="mt-2 text-3xl font-bold">{subject.topicName}</h1>
                <p className="mt-1 text-sm capitalize" style={{ color: "var(--app-muted)" }}>
                  Source: {subject.sourceType.replace("_", " ")}
                </p>
              </header>

              {renderTabContent()}
            </div>
          ) : null}
        </section>

        <aside
          className="ui-panel rounded-3xl p-5"
        >
          <h2 className="text-lg font-semibold">Previous Topics</h2>
          <div className="mt-3 space-y-2">
            {subjects.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--app-muted)" }}>
                No topics saved yet.
              </p>
            ) : (
              subjects.map((item) => (
                <Link
                  key={item.id}
                  href={`/studyroom/${item.id}?tab=study-guide`}
                  className="ui-btn-secondary block px-3 py-2 text-left text-sm font-medium"
                >
                  {item.topicName}
                </Link>
              ))
            )}
          </div>
          <Link
            href="/upload"
            className="ui-btn-primary mt-5 text-sm"
          >
            Add New Source
          </Link>
        </aside>
      </div>
    </main>
  );
}


