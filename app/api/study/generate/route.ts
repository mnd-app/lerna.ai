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
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Server is missing GEMINI_API_KEY." }, { status: 500 });
    }

    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (user && !user.onboardingCompleted) {
      return NextResponse.json({ error: "Complete onboarding first." }, { status: 403 });
    }
    if (user) {
      await assertUserCanUpload(user.id);
    }
    const body = (await request.json()) as { notes?: string };
    const notes = body.notes?.trim() ?? "";
    if (!notes) {
      return NextResponse.json({ error: "Notes are required." }, { status: 400 });
    }

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

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gemini request failed: ${errorText}` }, { status: 502 });
    }

    const raw = await response.json();
    const text = extractText(raw);
    const parsed = safeParseJson(text);
    if (!parsed) {
      return NextResponse.json({ error: "Failed to parse generated study content." }, { status: 502 });
    }

    const subject = await createSubject({
      userId: user?.id ?? null,
      topicName: parsed.topicTitle,
      sourceType: "paste_notes",
      notesText: notes,
      explanation: parsed.explanation,
      questions: parsed.questions,
      flashcards: parsed.flashcards,
    });

    if (user) {
      await incrementUserUploadUsage(user.id);
    }

    return NextResponse.json({
      subject,
      content: parsed,
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
