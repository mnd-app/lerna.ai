"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectSourceType = "audio" | "youtube" | "paste_notes" | "document";

type SubjectRecord = {
  id: string;
  topicName: string;
  sourceType: SubjectSourceType;
};

const MAX_CHARS = 12000;

export default function UploadPage() {
  const router = useRouter();

  const [sourceType, setSourceType] = useState<SubjectSourceType>("paste_notes");
  const [notes, setNotes] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [documentFileName, setDocumentFileName] = useState("");
  const [audioFileName, setAudioFileName] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const remainingChars = useMemo(() => MAX_CHARS - notes.length, [notes.length]);

  useEffect(() => {
    let mounted = true;
    async function checkAccess() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (mounted) router.replace("/auth?mode=login&next=/studyroom");
          return;
        }
        const payload = (await response.json()) as {
          user?: { onboardingCompleted?: boolean };
        };
        if (!payload.user?.onboardingCompleted) {
          if (mounted) router.replace("/studyroom");
          return;
        }
      } catch {
        if (mounted) router.replace("/studyroom");
      } finally {
        if (mounted) setIsCheckingAccess(false);
      }
    }
    void checkAccess();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function onDocumentFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocumentFileName(file.name);
    setError(null);

    if (file.name.toLowerCase().endsWith(".txt")) {
      const text = await file.text();
      setNotes(text.slice(0, MAX_CHARS));
    }
  }

  function onAudioFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAudioFileName(file.name);
    setError(null);
  }

  async function onStartStudying(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (sourceType === "youtube" && !youtubeUrl.trim()) {
      setError("Please add a YouTube link.");
      return;
    }

    if (sourceType === "audio" && !audioFileName.trim()) {
      setError("Please choose an audio file.");
      return;
    }

    if (sourceType === "paste_notes" && !notes.trim()) {
      setError("Please paste notes first.");
      return;
    }

    if (sourceType === "document" && !documentFileName.trim()) {
      setError("Please upload a PDF/Word file.");
      return;
    }

    setIsProcessing(true);

    try {
      if (sourceType === "paste_notes") {
        const response = await fetch("/api/study/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });

        const payload = (await response.json()) as { error?: string; subject?: SubjectRecord };
        if (!response.ok || !payload.subject) {
          if (response.status === 402) {
            router.push("/pricing");
            return;
          }
          setError(payload.error ?? "Failed to generate study content.");
          return;
        }

        router.push(`/studyroom/${payload.subject.id}`);
        return;
      }

      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          youtubeUrl: sourceType === "youtube" ? youtubeUrl : undefined,
          fileName: sourceType === "audio" ? audioFileName : sourceType === "document" ? documentFileName : undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string; subject?: SubjectRecord };
      if (!response.ok || !payload.subject) {
        if (response.status === 402) {
          router.push("/pricing");
          return;
        }
        setError(payload.error ?? "Failed to save source.");
        return;
      }

      router.push(`/studyroom/${payload.subject.id}`);
    } catch {
      setError("Unable to process the source right now.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (isCheckingAccess) {
    return (
      <main className="min-h-[calc(100vh-56px)] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm" style={{ color: "var(--app-muted)" }}>Checking access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="ui-panel rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-kicker">Subject Intake</p>
              <h1 className="mt-2 text-4xl font-bold md:text-5xl">Add Learning Source</h1>
              <p className="ui-muted mt-3">
                Choose a source and click Start Studying. You will be taken to your study page.
              </p>
            </div>
            <Link href="/dashboard" className="ui-btn-secondary text-sm">
              Back to Dashboard
            </Link>
          </div>
        </section>

        <form onSubmit={onStartStudying} className="ui-panel rounded-3xl space-y-5 p-6 md:p-7">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setSourceType("audio")}
              className={`ui-btn-chip ${sourceType === "audio" ? "active" : ""}`}
            >
              Audio from Class
            </button>
            <button
              type="button"
              onClick={() => setSourceType("youtube")}
              className={`ui-btn-chip ${sourceType === "youtube" ? "active" : ""}`}
            >
              YouTube Link
            </button>
            <button
              type="button"
              onClick={() => setSourceType("paste_notes")}
              className={`ui-btn-chip ${sourceType === "paste_notes" ? "active" : ""}`}
            >
              Paste Notes
            </button>
            <button
              type="button"
              onClick={() => setSourceType("document")}
              className={`ui-btn-chip ${sourceType === "document" ? "active" : ""}`}
            >
              PDF / Word File
            </button>
          </div>

          {sourceType === "audio" ? (
            <div className="ui-card space-y-2 rounded-2xl p-4">
              <label className="block text-sm font-medium" htmlFor="audioUpload">
                Upload class audio
              </label>
              <input
                id="audioUpload"
                type="file"
                accept="audio/*"
                onChange={onAudioFileChange}
                className="ui-input block w-full cursor-pointer text-sm"
              />
              {audioFileName ? <p className="ui-muted text-sm">Selected: {audioFileName}</p> : null}
            </div>
          ) : null}

          {sourceType === "youtube" ? (
            <label className="ui-card block rounded-2xl p-4 text-sm font-medium">
              YouTube link
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="ui-input mt-2"
              />
            </label>
          ) : null}

          {sourceType === "paste_notes" ? (
            <div className="ui-card space-y-4 rounded-2xl p-4">
              <label className="block text-sm font-medium" htmlFor="notes">
                Paste notes text
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value.slice(0, MAX_CHARS))}
                placeholder="Paste lecture notes here..."
                className="ui-input h-64 p-4 text-sm"
              />

              <div className="ui-muted flex items-center justify-between text-sm">
                <p>Character limit: {MAX_CHARS.toLocaleString()}</p>
                <p>{Math.max(remainingChars, 0).toLocaleString()} remaining</p>
              </div>
            </div>
          ) : null}

          {sourceType === "document" ? (
            <div className="ui-card space-y-2 rounded-2xl p-4">
              <label className="block text-sm font-medium" htmlFor="documentUpload">
                Upload PDF/Word file
              </label>
              <input
                id="documentUpload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf"
                onChange={onDocumentFileChange}
                className="ui-input block w-full cursor-pointer text-sm"
              />
              {documentFileName ? <p className="ui-muted text-sm">Selected: {documentFileName}</p> : null}
            </div>
          ) : null}

          <button type="submit" disabled={isProcessing} className="ui-btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70">
            {isProcessing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                Processing...
              </>
            ) : (
              "Start Studying"
            )}
          </button>
        </form>

        {error ? <div className="ui-panel rounded-2xl p-4">{error}</div> : null}
      </div>
    </main>
  );
}
