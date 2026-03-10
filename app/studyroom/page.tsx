"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  uploadsUsed?: number;
};

type ThemePreference = "system" | "light" | "dark";
type UploadFlowType = "document" | "paste_notes" | "audio";
type StudyroomView = "study-sets" | "folders";
type WorkspaceSection = "study-sets" | "scan-notes" | "paper-grader";
type FolderRecord = {
  id: string;
  name: string;
  studySetCount: number;
};

function PasteSourceIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="14"
        width="26"
        height="34"
        rx="7"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <rect
        x="20"
        y="8"
        width="18"
        height="10"
        rx="3"
        fill="var(--app-bg)"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <rect
        x="28"
        y="24"
        width="26"
        height="34"
        rx="7"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="M35 34H47"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M35 42H47"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M35 50H44"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScanNoteDropIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="14" y="18" width="22" height="28" rx="5" stroke="currentColor" strokeWidth="3.2" />
      <path d="M28 18V12H42V30" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 18H52V28" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 36H50" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M45 31V41" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M20 25H30" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M20 31H28" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

const THEME_STORAGE_KEY = "lerna-theme";
const FOLDERS_STORAGE_KEY = "lerna-folders";
const PASTE_MAX_CHARS = 12000;

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
  const FREE_LIMIT = 3;
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFlowType, setUploadFlowType] = useState<UploadFlowType>("document");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [pasteNotes, setPasteNotes] = useState("");
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [uploadModalError, setUploadModalError] = useState("");
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("Preparing your study set...");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [studySetSearchQuery, setStudySetSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<StudyroomView>("study-sets");
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("study-sets");
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [scanNotePrompt, setScanNotePrompt] = useState("");
  const [scanNoteFile, setScanNoteFile] = useState<File | null>(null);
  const [scanIsDragging, setScanIsDragging] = useState(false);
  const [scanNotice, setScanNotice] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState(
    `You have reached the free limit of ${FREE_LIMIT} uploads. Upgrade to Pro for unlimited access.`,
  );
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanFileInputRef = useRef<HTMLInputElement | null>(null);

  const hasReachedFreeLimit = uploadsUsed >= FREE_LIMIT;
  const normalizedSearchQuery = studySetSearchQuery.trim().toLowerCase();
  const filteredSubjects = normalizedSearchQuery
    ? subjects.filter((subject) => {
        const sourceLabel = subject.sourceType.replace("_", " ");
        return (
          subject.topicName.toLowerCase().includes(normalizedSearchQuery) ||
          sourceLabel.toLowerCase().includes(normalizedSearchQuery)
        );
      })
    : subjects;

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
          setUploadsUsed(mePayload.user?.uploadsUsed ?? 0);
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

  useEffect(() => {
    function handleStudyroomSearchChange(event: Event) {
      const customEvent = event as CustomEvent<{ query?: string }>;
      setStudySetSearchQuery(customEvent.detail?.query ?? "");
    }

    window.addEventListener("studyroom-search-change", handleStudyroomSearchChange);

    return () => {
      window.removeEventListener("studyroom-search-change", handleStudyroomSearchChange);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as FolderRecord[];
      setFolders(Array.isArray(parsed) ? parsed : []);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch {}
  }, [folders]);

  useEffect(() => {
    function handleStudyroomViewChange(event: Event) {
      const customEvent = event as CustomEvent<{ view?: StudyroomView }>;
      const nextView = customEvent.detail?.view === "folders" ? "folders" : "study-sets";
      setActiveSection("study-sets");
      setActiveView(nextView);
      window.dispatchEvent(
        new CustomEvent("studyroom-view-sync", {
          detail: { view: nextView },
        }),
      );
    }

    window.addEventListener("studyroom-view-change", handleStudyroomViewChange);

    return () => {
      window.removeEventListener("studyroom-view-change", handleStudyroomViewChange);
    };
  }, []);

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

  function openStudySetsView() {
    setActiveSection("study-sets");
    setActiveView("study-sets");
    window.dispatchEvent(
      new CustomEvent("studyroom-view-sync", {
        detail: { view: "study-sets" as StudyroomView },
      }),
    );
  }

  function onCreateFolder() {
    const name = window.prompt("Folder name")?.trim();
    if (!name) return;

    setFolders((prev) => [
      ...prev,
      {
        id: `folder-${Date.now()}`,
        name,
        studySetCount: 0,
      },
    ]);
  }

  function onSelectWorkspaceSection(section: WorkspaceSection) {
    setActiveSection(section);
    if (section === "study-sets") {
      window.dispatchEvent(
        new CustomEvent("studyroom-view-sync", {
          detail: { view: activeView },
        }),
      );
      return;
    }

    setActiveView("study-sets");
    window.dispatchEvent(
      new CustomEvent("studyroom-view-sync", {
        detail: { view: "study-sets" as StudyroomView },
      }),
    );
  }

  function onSelectScanNoteFile(fileList: FileList | null) {
    const nextFile = fileList?.[0] ?? null;
    setScanNoteFile(nextFile);
    if (nextFile) {
      setScanNotice(`${nextFile.name} ready to scan.`);
    }
  }

  function onSubmitScanNotes() {
    if (!scanNoteFile && !scanNotePrompt.trim()) {
      setScanNotice("Add an image or enter a question to continue.");
      return;
    }

    setScanNotice(
      scanNoteFile
        ? `Scanning ${scanNoteFile.name} and preparing your answer...`
        : "Preparing your scan request...",
    );
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

  function openUpgradePrompt(message?: string) {
    setUpgradeMessage(
      message?.trim() ||
        `You have reached the free limit of ${FREE_LIMIT} uploads. Upgrade to Pro for unlimited access.`,
    );
    setUpgradeModalOpen(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth?mode=login";
  }

  function openUploadModal(type: UploadFlowType) {
    if (hasReachedFreeLimit) {
      openUpgradePrompt();
      return;
    }

    setUploadFlowType(type);
    setUploadModalOpen(true);
    setUploadFiles([]);
    setPasteNotes("");
    setUploadModalError("");
    setIsUploadProcessing(false);
    setUploadProgress(0);
    setUploadStatusText("Preparing your study set...");
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

  function onUploadFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const picked = Array.from(fileList);
    const remaining = 10 - uploadFiles.length;
    if (remaining <= 0) {
      setUploadModalError("Maximum 10 files per upload.");
      return;
    }

    const toAdd = picked.slice(0, remaining);
    setUploadFiles((prev) => [...prev, ...toAdd]);
    if (picked.length > remaining) {
      setUploadModalError("Maximum 10 files per upload.");
    } else {
      setUploadModalError("");
    }
  }

  function onRemoveUploadFile(indexToRemove: number) {
    setUploadFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function inferTopicFromFileName(fileName: string): string {
    const withoutExt = fileName.replace(/\.[a-z0-9]+$/i, "");
    const normalized = withoutExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    return normalized || "New Study Set";
  }

  function inferTopicFromNotes(notes: string): string {
    const firstLine = notes
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (!firstLine) return "New Study Set";
    const cleaned = firstLine.replace(/^#+\s*/, "").trim();
    return cleaned.slice(0, 80) || "New Study Set";
  }

  async function onProcessUploadAndContinue() {
    if (hasReachedFreeLimit) {
      openUpgradePrompt();
      return;
    }

    if (uploadFlowType === "paste_notes" && !pasteNotes.trim()) {
      setUploadModalError("Paste your notes to continue.");
      return;
    }

    if (uploadFlowType !== "paste_notes" && uploadFiles.length === 0) {
      setUploadModalError("Select at least one file to continue.");
      fileInputRef.current?.click();
      return;
    }

    setUploadModalError("");
    setIsUploadProcessing(true);
    setUploadProgress(8);
    setUploadStatusText(
      uploadFlowType === "paste_notes" ? "Analyzing pasted notes..." : "Uploading files...",
    );

    let progress = 8;
    const progressTimer = window.setInterval(() => {
      progress = Math.min(progress + Math.random() * 8 + 5, 92);
      setUploadProgress(Math.round(progress));
      if (progress > 45) {
        setUploadStatusText(
          uploadFlowType === "paste_notes"
            ? "Building your study guide..."
            : "Generating study guide...",
        );
      }
      if (progress > 70) {
        setUploadStatusText("Preparing flashcards and quiz...");
      }
    }, 260);

    try {
      const generationNotes =
        uploadFlowType === "paste_notes"
          ? pasteNotes.trim()
          : [
              `Infer a likely topic and generate full study output from these uploaded ${uploadFlowType === "audio" ? "audio" : "document"} file names:`,
              ...uploadFiles.map((file, idx) => `${idx + 1}. ${file.name}`),
            ].join("\n");

      const generateResponse = await fetch("/api/study/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: generationNotes }),
      });
      const generatePayload = (await generateResponse.json()) as {
        subject?: { id?: string };
        error?: string;
        code?: string;
      };

      if (!generateResponse.ok) {
        if (
          generatePayload.code === "UPLOAD_LIMIT_REACHED" ||
          generatePayload.code === "FREE_LIMIT_REACHED" ||
          generateResponse.status === 402
        ) {
          setUploadModalOpen(false);
          openUpgradePrompt(generatePayload.error);
          return;
        }
      }

      if (generateResponse.ok) {
        if (generatePayload.subject?.id) {
          setUploadProgress(100);
          setUploadStatusText("Done. Opening your study set...");
          window.clearInterval(progressTimer);
          setUploadModalOpen(false);
          setUploadFiles([]);
          setPasteNotes("");
          setUploadsUsed((prev) => prev + 1);
          router.push(`/studyroom/${generatePayload.subject.id}`);
          return;
        }
      }

      const fallbackBody =
        uploadFlowType === "paste_notes"
          ? {
              topicName: inferTopicFromNotes(pasteNotes),
              sourceType: "paste_notes",
              notesText: pasteNotes.trim(),
            }
          : {
              topicName: inferTopicFromFileName(uploadFiles[0].name),
              sourceType: uploadFlowType,
              fileName: uploadFiles[0].name,
            };

      const fallback = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackBody),
      });
      const fallbackPayload = (await fallback.json()) as { subject?: { id?: string }; error?: string };

      if (fallback.status === 402) {
        setUploadModalOpen(false);
        openUpgradePrompt(fallbackPayload.error);
        return;
      }

      if (!fallback.ok || !fallbackPayload.subject?.id) {
        setUploadModalError(fallbackPayload.error ?? "Failed to create study set.");
        return;
      }

      setUploadProgress(100);
      setUploadStatusText("Done. Opening your study set...");
      window.clearInterval(progressTimer);
      setUploadModalOpen(false);
      setUploadFiles([]);
      setPasteNotes("");
      setUploadsUsed((prev) => prev + 1);
      router.push(`/studyroom/${fallbackPayload.subject.id}`);
    } catch {
      setUploadModalError("Unable to process files right now.");
    } finally {
      window.clearInterval(progressTimer);
      setIsUploadProcessing(false);
      setUploadProgress(0);
      setUploadStatusText("Preparing your study set...");
    }
  }

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
    <main className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="flex w-full gap-0 px-0">
        <aside
          className="hidden min-h-[calc(100vh-56px)] w-56 shrink-0 border-r p-5 lg:flex lg:flex-col"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "color-mix(in srgb, var(--app-accent) 12%, var(--app-card))",
          }}
        >
          <p
            className="rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--app-muted)" }}
          >
            StudyRoom
          </p>

          <nav className="mt-6 space-y-2">
            {[
              { id: "study-sets" as const, label: "Study Sets", icon: "▦" },
              { id: "scan-notes" as const, label: "Scan Notes", icon: "◎" },
              { id: "paper-grader" as const, label: "Paper Grader", icon: "☑" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectWorkspaceSection(item.id)}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-base font-medium transition"
                style={{
                  color: activeSection === item.id ? "var(--app-fg)" : "var(--app-muted)",
                  backgroundColor: activeSection === item.id
                    ? "color-mix(in srgb, var(--app-bg) 86%, white 14%)"
                    : "transparent",
                }}
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[13px]"
                  style={{
                    backgroundColor: activeSection === item.id
                      ? "color-mix(in srgb, var(--app-accent) 18%, transparent)"
                      : "color-mix(in srgb, var(--app-bg) 70%, transparent)",
                    color: activeSection === item.id ? "var(--app-accent-strong)" : "var(--app-muted)",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="relative mt-auto">
            {accountMenuOpen ? (
              <div
                className="absolute bottom-14 left-0 z-20 w-full rounded-2xl border p-2 shadow-xl"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "color-mix(in srgb, var(--app-card) 92%, var(--app-bg) 8%)",
                }}
              >
                <div className="mb-2 grid grid-cols-3 gap-1 rounded-xl border p-1" style={{ borderColor: "var(--app-border)" }}>
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
                  <a
                    href="mailto:contact@lerna.ai?subject=Lerna%20Feedback"
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80"
                    style={{ color: "var(--app-fg)" }}
                  >
                    Give Feedback
                  </a>
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
              <span style={{ color: "var(--app-muted)" }}>{accountMenuOpen ? "⌃" : "⌄"}</span>
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-5 md:px-8">
          {activeSection === "scan-notes" ? (
            <div className="mx-auto max-w-5xl py-6 sm:py-10">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
                  What do you want to scan?
                </h1>
                <p className="mt-3 text-base sm:text-xl" style={{ color: "var(--app-muted)" }}>
                  Upload a note image and ask Lerna to explain, summarize, or break it down into study-ready help.
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-4xl">
                <button
                  type="button"
                  onClick={() => scanFileInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setScanIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setScanIsDragging(false);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setScanIsDragging(true);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setScanIsDragging(false);
                    onSelectScanNoteFile(event.dataTransfer.files);
                  }}
                  className="w-full cursor-pointer rounded-[2rem] border-2 border-dashed px-6 py-10 text-center transition-all duration-200 hover:opacity-95"
                  style={{
                    borderColor: scanIsDragging
                      ? "var(--app-accent-strong)"
                      : "color-mix(in srgb, var(--app-border) 85%, transparent)",
                    backgroundColor: scanIsDragging
                      ? "color-mix(in srgb, var(--app-accent) 14%, var(--app-card) 86%)"
                      : "color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)",
                    boxShadow: scanIsDragging
                      ? "0 0 0 4px color-mix(in srgb, var(--app-accent) 18%, transparent)"
                      : "none",
                  }}
                >
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ borderColor: "var(--app-border)", color: "var(--app-muted)" }}>
                    <ScanNoteDropIcon className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-xl font-semibold sm:text-2xl">
                    {scanIsDragging ? "Drop your note image here" : "Drag and drop or click to add an image"}
                  </p>
                  <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--app-muted)" }}>
                    PNG, JPG, JPEG, or PDF snapshots of class notes and assignments
                  </p>
                  {scanNoteFile ? (
                    <div
                      className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-left"
                      style={{
                        borderColor: "var(--app-border)",
                        backgroundColor: "color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%)",
                      }}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--app-accent) 16%, transparent)", color: "var(--app-accent-strong)" }}>
                        ✓
                      </span>
                      <span className="max-w-[240px] truncate text-sm font-medium sm:max-w-[420px]">{scanNoteFile.name}</span>
                    </div>
                  ) : null}
                </button>

                <input
                  ref={scanFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,image/*,application/pdf"
                  className="hidden"
                  onChange={(event) => onSelectScanNoteFile(event.target.files)}
                />

                <div
                  className="mt-5 rounded-[2rem] border p-5 sm:p-6"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "color-mix(in srgb, var(--app-card) 94%, var(--app-bg) 6%)",
                  }}
                >
                  <textarea
                    value={scanNotePrompt}
                    onChange={(event) => {
                      setScanNotePrompt(event.target.value);
                      if (scanNotice) setScanNotice("");
                    }}
                    placeholder="Type your question here..."
                    className="min-h-[150px] w-full resize-none bg-transparent text-lg outline-none sm:min-h-[170px] sm:text-xl"
                    style={{ color: "var(--app-fg)" }}
                  />

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={onSubmitScanNotes}
                      className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-2xl font-semibold text-white transition hover:-translate-y-px hover:brightness-[1.03]"
                      style={{
                        background: "linear-gradient(135deg, var(--app-accent-strong), var(--app-accent))",
                        boxShadow: "0 10px 22px color-mix(in srgb, var(--app-accent) 34%, transparent)",
                      }}
                      aria-label="Scan notes"
                    >
                      ↑
                    </button>
                  </div>
                </div>

                {scanNotice ? (
                  <p className="mt-4 text-sm font-medium" style={{ color: "var(--app-muted)" }}>
                    {scanNotice}
                  </p>
                ) : null}
              </div>
            </div>
          ) : activeSection === "paper-grader" ? (
            <div className="mx-auto max-w-3xl py-16 text-center">
              <h1 className="text-3xl font-bold sm:text-4xl">Paper Grader</h1>
              <p className="mt-3 text-base sm:text-lg" style={{ color: "var(--app-muted)" }}>
                Essay scoring and writing feedback will live here.
              </p>
            </div>
          ) : activeView === "folders" ? (
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Folders</h1>
                <button
                  type="button"
                  onClick={openStudySetsView}
                  className="cursor-pointer text-2xl leading-none transition hover:opacity-80"
                  style={{ color: "var(--app-muted)" }}
                  aria-label="Back to study sets"
                >
                  »
                </button>
              </div>

                <button
                  type="button"
                  onClick={onCreateFolder}
                  className="mt-6 w-full cursor-pointer rounded-2xl px-5 py-4 text-left text-xl font-semibold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.75)] transition hover:-translate-y-px hover:shadow-[0_6px_0_0_rgba(0,0,0,0.75)]"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--app-accent-strong) 85%, white 15%), var(--app-accent))",
                }}
              >
                + Create New Folder
              </button>

                <button
                  type="button"
                  onClick={openStudySetsView}
                  className="mt-6 flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-px"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "color-mix(in srgb, var(--app-card) 94%, transparent)",
                  boxShadow: "inset 6px 0 0 color-mix(in srgb, var(--app-fg) 75%, transparent)",
                }}
              >
                <span className="text-3xl" style={{ color: "var(--app-muted)" }}>📁</span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold">All Study Sets</span>
                  <span className="block text-sm" style={{ color: "var(--app-muted)" }}>
                    {subjects.length} study sets total
                  </span>
                </span>
              </button>

              {folders.length === 0 ? (
                <div className="px-4 pt-20 text-center">
                  <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full border text-5xl" style={{ borderColor: "var(--app-border)", color: "var(--app-muted)" }}>
                    📂
                  </div>
                  <p className="mt-6 text-3xl font-medium" style={{ color: "var(--app-muted)" }}>
                    No folders yet
                  </p>
                  <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed" style={{ color: "var(--app-muted)" }}>
                    Create your first folder to organize your study sets.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {folders.map((folder) => (
                    <article
                      key={folder.id}
                      className="rounded-2xl border px-5 py-4"
                      style={{
                        borderColor: "var(--app-border)",
                        backgroundColor: "color-mix(in srgb, var(--app-card) 94%, transparent)",
                      }}
                    >
                      <p className="text-lg font-semibold">{folder.name}</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--app-muted)" }}>
                        {folder.studySetCount} study sets
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-3xl">
                <h1 className="text-center text-2xl font-bold leading-tight sm:text-4xl">
                  Hey {userName}, what do you wanna master?
                </h1>
                <p className="mt-2.5 text-center text-base sm:text-xl" style={{ color: "var(--app-muted)" }}>
                  Upload anything and get interactive notes, flashcards, quizzes, and more
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => openUploadModal("document")}
                    className="cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-px hover:shadow-lg"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)",
                    }}
                  >
                    <p className="text-2xl" style={{ color: "var(--app-muted)" }}>⇪</p>
                    <p className="mt-1.5 text-2xl font-semibold">Upload</p>
                    <p className="mt-1.5 text-base" style={{ color: "var(--app-muted)" }}>Image, file, audio, video</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => openUploadModal("paste_notes")}
                    className="cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-px hover:shadow-lg"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)",
                    }}
                    >
                    <div style={{ color: "var(--app-muted)" }}>
                      <PasteSourceIcon />
                    </div>
                    <p className="mt-1.5 text-2xl font-semibold">Paste</p>
                    <p className="mt-1.5 text-base" style={{ color: "var(--app-muted)" }}>YouTube, website, text</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => openUploadModal("audio")}
                    className="cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-px hover:shadow-lg"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)",
                    }}
                  >
                    <p className="text-2xl" style={{ color: "var(--app-muted)" }}>◉</p>
                    <p className="mt-1.5 text-2xl font-semibold">Record</p>
                    <p className="mt-1.5 text-base" style={{ color: "var(--app-muted)" }}>Record live lecture</p>
                  </button>
                </div>

                <p className="mt-3 text-center text-sm" style={{ color: "var(--app-muted)" }}>
                  Free plan: {Math.min(uploadsUsed, FREE_LIMIT)}/{FREE_LIMIT} uploads used
                </p>
              </div>

              <div className="mt-12">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">Study Sets</h2>
                  {hasReachedFreeLimit ? (
                    <button type="button" onClick={() => openUpgradePrompt()} className="ui-btn-primary cursor-pointer px-4 py-2 text-sm">
                      Unlock Unlimited Access
                    </button>
                  ) : null}
                </div>

                {error ? (
                  <p className="text-sm" style={{ color: "var(--app-accent-strong)" }}>
                    {error}
                  </p>
                ) : null}

                {filteredSubjects.length === 0 ? (
                  <div
                    className="mt-5 rounded-2xl border p-5"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "color-mix(in srgb, var(--app-bg) 92%, var(--app-card) 8%)",
                    }}
                  >
                    <p className="text-base" style={{ color: "var(--app-muted)" }}>
                      {subjects.length === 0
                        ? "No saved topics yet. Add your first study set."
                        : "No study sets match your search."}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredSubjects.map((subject) => (
                      <article
                        key={subject.id}
                        className={`relative overflow-visible rounded-xl border p-3.5 ${
                          menuOpenId === subject.id ? "z-20" : ""
                        }`}
                        style={{
                          borderColor: "var(--app-border)",
                          backgroundColor: "color-mix(in srgb, var(--app-card) 92%, transparent)",
                        }}
                      >
                        <Link href={`/studyroom/${subject.id}`} className="block pr-10">
                          <p className="text-xl font-semibold">{subject.topicName}</p>
                          <p className="mt-1 text-sm capitalize" style={{ color: "var(--app-muted)" }}>
                            {subject.sourceType.replace("_", " ")}
                          </p>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setMenuOpenId((prev) => (prev === subject.id ? null : subject.id))}
                          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border text-2xl leading-none transition hover:opacity-85"
                          style={{
                            color: "var(--app-muted)",
                            borderColor: "var(--app-border)",
                            backgroundColor: "color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%)",
                          }}
                          aria-label="More options"
                        >
                          ⋯
                        </button>

                        {menuOpenId === subject.id ? (
                          <div
                            className="absolute right-3 top-14 z-10 w-36 rounded-xl border p-1.5 shadow-xl"
                            style={{
                              borderColor: "var(--app-border)",
                              backgroundColor: "var(--app-card)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => void onRename(subject)}
                              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition hover:opacity-80"
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(subject)}
                              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition hover:opacity-80"
                              style={{ color: "#ef4444" }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[1px]">
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-bg)" }}
          >
            <div className="border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--app-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold sm:text-2xl">
                    {uploadFlowType === "paste_notes"
                      ? "Paste Study Material"
                      : uploadFlowType === "audio"
                        ? "Record Study Material"
                        : "Upload Study Material"}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--app-muted)" }}>
                    {uploadFlowType === "paste_notes"
                      ? "Paste your notes and turn them into AI-powered study materials"
                      : uploadFlowType === "audio"
                        ? "Upload class audio and we will prepare your study set"
                        : "Transform your files into AI-powered study materials"}
                  </p>
                  <p className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: "var(--app-muted)" }}>
                    {uploadFlowType === "paste_notes"
                      ? `Characters: ${pasteNotes.length.toLocaleString()}/${PASTE_MAX_CHARS.toLocaleString()}`
                      : `Files selected: ${uploadFiles.length}/10`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-md px-2 py-1 text-2xl leading-none transition hover:opacity-70"
                  style={{ color: "var(--app-muted)" }}
                  aria-label="Close upload modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-5">
              {isUploadProcessing ? (
                <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}>
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3 sm:px-4"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%)",
                    }}
                  >
                    <div className="min-w-0">
                      {uploadFlowType === "paste_notes" ? (
                        <>
                          <p className="truncate text-sm font-semibold sm:text-base">Pasted notes</p>
                          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--app-muted)" }}>
                            {pasteNotes.length.toLocaleString()} characters
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="truncate text-sm font-semibold sm:text-base">{uploadFiles[0]?.name}</p>
                          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--app-muted)" }}>
                            {(uploadFiles[0]?.size ? uploadFiles[0].size / (1024 * 1024) : 0).toFixed(2)} MB
                          </p>
                        </>
                      )}
                    </div>
                    <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-500" aria-hidden="true" />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span style={{ color: "var(--app-muted)" }}>
                        {uploadFlowType === "paste_notes" ? "Processing..." : "Uploading..."}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--app-border) 80%, transparent)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress}%`,
                          background: "linear-gradient(90deg, #7c3aed 0%, #22d3ee 100%)",
                        }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium" style={{ color: "#8b5cf6" }}>
                      {uploadStatusText}
                    </p>
                  </div>
                </div>
              ) : (
                <>
              {uploadFlowType === "paste_notes" ? (
                <div
                  className="rounded-xl border p-3 sm:p-4"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "color-mix(in srgb, var(--app-card) 92%, transparent)",
                  }}
                >
                  <textarea
                    value={pasteNotes}
                    onChange={(event) => {
                      setPasteNotes(event.target.value.slice(0, PASTE_MAX_CHARS));
                      if (uploadModalError) setUploadModalError("");
                    }}
                    placeholder="Paste your class notes here..."
                    className="ui-input h-56 w-full p-3 text-sm"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs sm:text-sm" style={{ color: "var(--app-muted)" }}>
                    <span>Paste notes to generate study guide, flashcards, and quiz.</span>
                    <span>{Math.max(PASTE_MAX_CHARS - pasteNotes.length, 0).toLocaleString()} left</span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDraggingUpload(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsDraggingUpload(false);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingUpload(true);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDraggingUpload(false);
                      onUploadFilesSelected(event.dataTransfer.files);
                    }}
                    className="w-full cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200 hover:opacity-95"
                    style={{
                      borderColor: isDraggingUpload
                        ? "var(--app-accent-strong)"
                        : "color-mix(in srgb, var(--app-border) 90%, transparent)",
                      backgroundColor: isDraggingUpload
                        ? "color-mix(in srgb, var(--app-accent) 16%, var(--app-card) 84%)"
                        : "var(--app-card)",
                      transform: isDraggingUpload ? "scale(1.01)" : "scale(1)",
                      boxShadow: isDraggingUpload
                        ? "0 0 0 3px color-mix(in srgb, var(--app-accent) 24%, transparent)"
                        : "none",
                    }}
                  >
                    <div
                      className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg text-3xl transition-all duration-300 ${
                        isDraggingUpload ? "animate-bounce" : "animate-pulse"
                      }`}
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--app-accent) 20%, transparent)",
                        color: "var(--app-accent-strong)",
                      }}
                    >
                      ⇪
                    </div>
                    <p className="mt-3 text-lg font-semibold sm:text-xl">
                      {isDraggingUpload ? "Drop files now" : "Click to upload or drag and drop up to 10 files"}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--app-muted)" }}>
                      {uploadFlowType === "audio"
                        ? "Audio files only (MP3, WAV, M4A)"
                        : "Image, PDF, Word, PowerPoint, Audio, or Video files"}
                    </p>
                  </button>

                  {uploadFiles.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left"
                          style={{
                            borderColor: "var(--app-border)",
                            backgroundColor: "color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%)",
                          }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{file.name}</p>
                            <p className="text-xs" style={{ color: "var(--app-muted)" }}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onRemoveUploadFile(index)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onRemoveUploadFile(index);
                              }
                            }}
                            className="cursor-pointer rounded px-2 py-1 text-sm font-semibold transition hover:opacity-70"
                            aria-label={`Remove ${file.name}`}
                            style={{ color: "#ef4444" }}
                          >
                            Delete
                          </span>
                        </div>
                      ))}

                      {uploadFiles.length < 10 ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full cursor-pointer rounded-xl border-2 border-dashed px-3 py-2 text-center text-base font-semibold transition hover:opacity-90"
                          style={{
                            borderColor: "color-mix(in srgb, var(--app-accent-strong) 70%, transparent)",
                            color: "var(--app-accent-strong)",
                            backgroundColor: "color-mix(in srgb, var(--app-bg) 94%, var(--app-card) 6%)",
                          }}
                        >
                          + Add Another File
                        </button>
                      ) : (
                        <p className="text-center text-xs font-medium" style={{ color: "var(--app-muted)" }}>
                          10/10 files selected
                        </p>
                      )}
                    </div>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(event) => onUploadFilesSelected(event.target.files)}
                    accept={
                      uploadFlowType === "audio"
                        ? ".mp3,.wav,.m4a,audio/*"
                        : ".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp3,.wav,.m4a,.mp4,.mov,.png,.jpg,.jpeg"
                    }
                  />
                </>
              )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end border-t px-4 py-3 sm:px-5" style={{ borderColor: "var(--app-border)" }}>
              {uploadModalError ? (
                <p className="mr-auto text-sm font-medium" style={{ color: "var(--app-accent-strong)" }}>
                  {uploadModalError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={onProcessUploadAndContinue}
                disabled={isUploadProcessing}
                className="cursor-pointer rounded-lg px-5 py-1.5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  backgroundColor: "var(--app-accent-strong)",
                }}
              >
                {isUploadProcessing ? "Processing..." : "Next"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {upgradeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
          <div
            className="w-full max-w-md rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-bg)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--app-muted)" }}>
              Upgrade Required
            </p>
            <h3 className="mt-2 text-xl font-bold sm:text-2xl">Unlock Unlimited Access</h3>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--app-muted)" }}>
              {upgradeMessage}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-85"
                style={{
                  borderColor: "var(--app-border)",
                  color: "var(--app-fg)",
                }}
              >
                Maybe Later
              </button>
              <Link href="/pricing" className="ui-btn-primary justify-center px-4 py-2 text-sm">
                Subscribe to Pro
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {needsOnboarding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-6">
          <div
            className="w-full max-w-3xl rounded-3xl border p-6 md:p-8"
            style={{
              color: "var(--app-fg)",
              background: "linear-gradient(160deg, color-mix(in srgb, var(--app-card) 92%, white 8%), color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%))",
              borderColor: "var(--app-border)",
              boxShadow: "0 30px 80px color-mix(in srgb, black 60%, var(--app-accent) 40%)",
            }}
          >
            {onboardingStep === 1 ? (
              <>
                <p className="text-center text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--app-muted)" }}>
                  Personalization Required
                </p>
                <h2 className="mt-2 text-center text-3xl font-bold md:text-4xl">
                  Hey {userName || "there"}, let&apos;s personalize your experience
                </h2>
                <p className="mt-2 text-center text-lg" style={{ color: "var(--app-muted)" }}>Complete this before starting your study flow.</p>

                <div
                  className="mt-6 space-y-4 rounded-2xl border p-4 md:p-5"
                  style={{
                    borderColor: "var(--app-border)",
                    backgroundColor: "color-mix(in srgb, var(--app-card) 82%, transparent)",
                  }}
                >
                  <label className="block text-sm font-semibold">
                    What would you like us to call you?
                    <input
                      value={preferredName}
                      onChange={(event) => setPreferredName(event.target.value)}
                      className="mt-2 w-full rounded-xl border bg-white/80 px-4 py-3 outline-none"
                      style={{ borderColor: "var(--app-border)" }}
                      placeholder="Preferred name"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Language
                    <select
                      value={preferredLanguage}
                      onChange={(event) => setPreferredLanguage(event.target.value)}
                      className="mt-2 w-full rounded-xl border bg-white/80 px-4 py-3 outline-none"
                      style={{ borderColor: "var(--app-border)" }}
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
                      className="mt-2 w-full rounded-xl border bg-white/80 px-4 py-3 outline-none"
                      style={{ borderColor: "var(--app-border)" }}
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
                      className="mt-2 w-full rounded-xl border bg-white/80 px-4 py-3 outline-none"
                      style={{ borderColor: "var(--app-border)" }}
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
                        style={{
                          backgroundColor: i === 0
                            ? "var(--app-accent-strong)"
                            : "color-mix(in srgb, var(--app-accent) 22%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onCompleteOnboarding()}
                    disabled={isSavingOnboarding || !onboardingValid}
                    className="cursor-pointer rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_24px_color-mix(in_srgb,var(--app-accent)_42%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
                    style={{
                      background: "linear-gradient(90deg, var(--app-accent-strong), var(--app-accent))",
                      boxShadow: "0 10px 20px color-mix(in srgb, var(--app-accent) 35%, transparent)",
                    }}
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
                    <p className="mt-4 text-xl" style={{ color: "var(--app-muted)" }}>{WELCOME_SLIDES[welcomeSlide].subtitle}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {WELCOME_SLIDES.map((_, index) => (
                    <span
                      key={`welcome-dot-${index}`}
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: index === welcomeSlide ? 22 : 8,
                        backgroundColor: index === welcomeSlide
                          ? "var(--app-accent-strong)"
                          : "color-mix(in srgb, var(--app-accent) 22%, transparent)",
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


