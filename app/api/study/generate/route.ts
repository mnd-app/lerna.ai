import { NextResponse } from "next/server";
import { createSubject } from "@/lib/subjects";
import {
  assertUserCanUpload,
  FREE_UPLOAD_LIMIT,
  getCurrentUserFromCookieHeader,
  incrementUserUploadUsage,
  UploadLimitError,
} from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type StudyOutput = {
  topicTitle: string;
  explanation: string;
  questions: string[];
  flashcards: Array<{ front: string; back: string }>;
};

function inferTopicTitle(input: {
  notes: string;
  topicHint?: string;
  fileNames?: string[];
}): string {
  const explicit = input.topicHint?.trim();
  if (explicit) return explicit;

  const firstFile = input.fileNames?.find(Boolean)?.trim();
  if (firstFile) {
    const withoutExt = firstFile.replace(/\.[a-z0-9]+$/i, "");
    const normalized = withoutExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    if (normalized) return normalized;
  }

  const firstMeaningfulLine = input.notes
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.toLowerCase().startsWith("infer a likely topic"));

  if (firstMeaningfulLine) {
    return firstMeaningfulLine.replace(/^#+\s*/, "").slice(0, 80).trim() || "New Study Set";
  }

  return "New Study Set";
}

function buildFallbackStudyOutput(input: {
  notes: string;
  topicHint?: string;
  fileNames?: string[];
}): StudyOutput {
  const topicTitle = inferTopicTitle(input);
  return {
    topicTitle,
    explanation: [
      `# ${topicTitle}`,
      "",
      "## Overview",
      `${topicTitle} has been saved and organized into a starter study set. Lerna could not fully expand the material from the upload itself, so this version gives you a clean structure to begin reviewing right away.`,
      "",
      "## What To Review First",
      "- Read through the original upload and identify the main concept, definition, or argument.",
      "- Highlight any formulas, key terms, dates, or class-specific examples tied to this topic.",
      "- Turn unclear sections into follow-up questions for StudyBoard review.",
      "",
      "## How To Study This Topic",
      "1. Start with the core idea and explain it in your own words.",
      "2. Write down the three most important supporting points from your material.",
      "3. Use flashcards for definitions, processes, or vocabulary that must be memorized.",
      "4. Practice answering questions without looking back at the notes.",
      "",
      "## Exam Focus",
      "- Know the main definition or purpose of the topic.",
      "- Be able to describe how it works or why it matters.",
      "- Review one example, application, or class case connected to it.",
    ].join("\n"),
    questions: [
      `What is the main idea behind ${topicTitle}?`,
      `Why is ${topicTitle} important in this course?`,
      `What are the most important terms connected to ${topicTitle}?`,
      `How would you explain ${topicTitle} in simple language?`,
      `What example or case best illustrates ${topicTitle}?`,
      `What mistake do students often make when studying ${topicTitle}?`,
    ],
    flashcards: [
      { front: "Main idea", back: `${topicTitle} core concept` },
      { front: "Why it matters", back: "Important for class understanding" },
      { front: "Key term", back: "Review vocabulary from notes" },
      { front: "Exam focus", back: "Know definition and example" },
    ],
  };
}

function safeParseJson(text: string): StudyOutput | null {
  const trimmed = text.trim();
  const cleaned = trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<StudyOutput>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.topicTitle !== "string") return null;
    if (typeof parsed.explanation !== "string") return null;
    if (!Array.isArray(parsed.questions)) return null;
    if (!Array.isArray(parsed.flashcards)) return null;
    return {
      topicTitle: parsed.topicTitle.trim() || "lerna.ai",
      explanation: parsed.explanation.trim(),
      questions: parsed.questions.map((q) => String(q)).filter(Boolean).slice(0, 12),
      flashcards: parsed.flashcards
        .map((item) => ({
          front: String((item as { front?: string }).front ?? "").trim(),
          back: String((item as { back?: string }).back ?? "").trim(),
        }))
        .filter((item) => item.front && item.back),
    };
  } catch {
    return null;
  }
}

function extractText(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "candidates" in payload &&
    Array.isArray(payload.candidates)
  ) {
    for (const candidate of payload.candidates) {
      if (
        candidate &&
        typeof candidate === "object" &&
        "content" in candidate &&
        candidate.content &&
        typeof candidate.content === "object" &&
        "parts" in candidate.content &&
        Array.isArray(candidate.content.parts)
      ) {
        for (const part of candidate.content.parts) {
          if (
            part &&
            typeof part === "object" &&
            "text" in part &&
            typeof part.text === "string" &&
            part.text.trim()
          ) {
            return part.text.trim();
          }
        }
      }
    }
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (user && !user.onboardingCompleted) {
      return NextResponse.json({ error: "Complete onboarding first." }, { status: 403 });
    }
    if (user) {
      await assertUserCanUpload(user.id);
    }
    const body = (await request.json()) as {
      notes?: string;
      sourceType?: "audio" | "youtube" | "paste_notes" | "document";
      topicHint?: string;
      fileNames?: string[];
    };
    const notes = body.notes?.trim() ?? "";
    if (!notes) {
      return NextResponse.json({ error: "Notes are required." }, { status: 400 });
    }
    const sourceType = body.sourceType ?? "paste_notes";
    const fallbackOutput = buildFallbackStudyOutput({
      notes,
      topicHint: body.topicHint,
      fileNames: body.fileNames,
    });

    const prompt = [
      "You are lerna.ai, a high-quality study tutor.",
      "Return ONLY valid JSON with this exact shape:",
      "{",
      '  "topicTitle": "string",',
      '  "explanation": "string markdown with headings and bullet points",',
      '  "questions": ["question 1", "question 2", "... up to 10"],',
      '  "flashcards": [{"front":"...", "back":"..."}]',
      "}",
      "Rules:",
      "- topicTitle must be concise and accurate.",
      "- explanation must be in-depth and clear for students.",
      "- include 8-10 questions.",
      "- include flashcards for all medium-to-high importance concepts in the notes.",
      "- flashcards must be concise and easy to memorize.",
      "- each flashcard front should be very short (3-8 words).",
      "- each flashcard back should be very short (5-12 words).",
      "- each flashcard back must preserve the original meaning, just in a shorter form.",
      "- think of each back as a compressed definition, not a vague phrase.",
      "- avoid long paragraphs in flashcards.",
      "",
      "NOTES:",
      notes,
    ].join("\n");
    let parsed: StudyOutput | null = null;

    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
          {
            method: "POST",
            headers: {
              "x-goog-api-key": GEMINI_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 3200,
              },
            }),
          },
        );

        if (response.ok) {
          const raw = await response.json();
          const text = extractText(raw);
          parsed = safeParseJson(text);
        }
      } catch {
        parsed = null;
      }
    }

    const output = parsed ?? fallbackOutput;

    const subject = await createSubject({
      userId: user?.id ?? null,
      topicName: output.topicTitle,
      sourceType,
      notesText: notes,
      fileName: body.fileNames?.[0],
      explanation: output.explanation,
      questions: output.questions,
      flashcards: output.flashcards,
    });

    if (user) {
      await incrementUserUploadUsage(user.id);
    }

    return NextResponse.json({
      subject,
      content: output,
      message: "Study content generated and saved.",
    });
  } catch (error) {
    if (error instanceof UploadLimitError) {
      return NextResponse.json(
        {
          error: `Free plan allows up to ${FREE_UPLOAD_LIMIT} uploads total across all methods. Upgrade to Pro for unlimited access.`,
          code: "UPLOAD_LIMIT_REACHED",
          limit: FREE_UPLOAD_LIMIT,
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "Unexpected error while generating study content." }, { status: 500 });
  }
}
