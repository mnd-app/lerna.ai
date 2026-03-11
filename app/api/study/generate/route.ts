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

type StudyInputFile = {
  name: string;
  mimeType: string;
  data?: string;
  extractedText?: string;
};

function supportsGeminiInlineMime(mimeType: string): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/")
  );
}

function normalizeInputFiles(value: unknown): StudyInputFile[] {
  if (!Array.isArray(value)) return [];

  const normalized: StudyInputFile[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Partial<StudyInputFile>;
    const name = String(record.name ?? "").trim();
    const mimeType = String(record.mimeType ?? "").trim();
    const data = typeof record.data === "string" ? record.data.trim() : undefined;
    const extractedText =
      typeof record.extractedText === "string" ? record.extractedText.trim() : undefined;

    if (!name || !mimeType) continue;

    normalized.push({
      name,
      mimeType,
      data,
      extractedText,
    });
  }

  return normalized.slice(0, 3);
}

function extractSegmentTitlesFromNotes(notes: string, topicTitle: string): string[] {
  const cleanedLines = notes
    .split("\n")
    .map((line) =>
      line
        .replace(/^#+\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .filter((line) => !/^infer a likely topic/i.test(line));

  const headingCandidates = cleanedLines.filter((line) => {
    if (/^[-*]\s*/.test(line) || /^\d+\.\s*/.test(line)) return false;
    if (line.length < 4 || line.length > 72) return false;
    if (/[.!?]$/.test(line)) return false;
    const wordCount = line.split(/\s+/).length;
    return wordCount >= 1 && wordCount <= 8;
  });

  const unique = Array.from(
    new Set(
      headingCandidates.map((line) => line.replace(/:$/, "").trim()).filter(Boolean),
    ),
  ).filter((line) => line.toLowerCase() !== topicTitle.toLowerCase());

  if (unique.length >= 3) return unique.slice(0, 5);

  return ["Core Ideas", "Key Details", "Important Examples", "Review Priorities"];
}

function buildStructuredExplanation(topicTitle: string, notes: string): string {
  const segmentTitles = extractSegmentTitlesFromNotes(notes, topicTitle);
  const notePreview = notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .slice(0, 320);

  return [
    `# ${topicTitle}`,
    "",
    "## What This Material Covers",
    notePreview
      ? `${topicTitle} is organized below into the major parts that appear in the uploaded material. Start with the core ideas first, then move into the details, examples, and anything your class is likely to test. ${notePreview}`
      : `${topicTitle} is organized below into the major parts that should guide your review of the uploaded material.`,
    "",
    "## Major Segments",
    ...segmentTitles.flatMap((segment, index) => [
      `### ${index + 1}. ${segment}`,
      `- Focus on what this section says about **${segment}** and how it connects to the rest of the material.`,
      "- Pull out the definitions, claims, processes, formulas, or supporting facts that are repeated in your notes.",
      "- Add one concrete example, class case, or diagram cue from the upload when you review this section.",
      "",
    ]),
    "## Roadmap To Study",
    `1. Start with **${segmentTitles[0]}** so you understand the foundation of ${topicTitle}.`,
    `2. Move to **${segmentTitles[1] ?? "Key Details"}** and turn the main ideas into short summary notes.`,
    `3. Review **${segmentTitles[2] ?? "Important Examples"}** and connect them to definitions, formulas, or arguments from the upload.`,
    `4. Finish with **${segmentTitles[3] ?? "Review Priorities"}** and test yourself without looking back at the material.`,
    "5. Revisit weak areas and convert them into flashcards or self-quiz prompts.",
    "",
    "## What To Memorize",
    "- Key terms, definitions, formulas, dates, or steps that are repeated in the material.",
    "- Any vocabulary or short-answer facts your instructor would expect you to recall quickly.",
    "- One example or application for each major segment.",
    "",
    "## Likely Review Questions",
    `- What are the major segments inside ${topicTitle}?`,
    `- How would you explain ${topicTitle} section by section in your own words?`,
    "- Which parts are definitions or must-memorize facts, and which parts are examples or applications?",
  ].join("\n");
}

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
  const segmentTitles = extractSegmentTitlesFromNotes(input.notes, topicTitle);
  return {
    topicTitle,
    explanation: buildStructuredExplanation(topicTitle, input.notes),
    questions: [
      `What is the main idea behind ${topicTitle}?`,
      `What are the major segments inside ${topicTitle}?`,
      `Which section should you study first, and why?`,
      `What are the most important terms connected to ${topicTitle}?`,
      `How would you explain ${segmentTitles[0]} in simple language?`,
      `What example or case best illustrates ${segmentTitles[1] ?? topicTitle}?`,
      `Which facts or processes from ${topicTitle} need to be memorized?`,
      `What mistake do students often make when studying ${topicTitle}?`,
    ],
    flashcards: [
      { front: "Main idea", back: `${topicTitle} core concept` },
      { front: "Segment 1", back: segmentTitles[0] ?? "Core ideas" },
      { front: "Segment 2", back: segmentTitles[1] ?? "Key details" },
      { front: "Exam focus", back: "Know sections and examples" },
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
      files?: StudyInputFile[];
    };
    const notes = body.notes?.trim() ?? "";
    if (!notes) {
      return NextResponse.json({ error: "Notes are required." }, { status: 400 });
    }
    const sourceType = body.sourceType ?? "paste_notes";
    const uploadedFiles = normalizeInputFiles(body.files);
    const fallbackOutput = buildFallbackStudyOutput({
      notes,
      topicHint: body.topicHint,
      fileNames: body.fileNames,
    });

    const prompt = [
      "You are lerna.ai, a high-quality study tutor.",
      "Use the actual uploaded material and source text as your primary evidence.",
      "Do not write a generic overview. Build the study guide from what is actually in the upload.",
      "Return ONLY valid JSON with this exact shape:",
      "{",
      '  "topicTitle": "string",',
      '  "explanation": "string markdown with headings and bullet points",',
      '  "questions": ["question 1", "question 2", "... up to 10"],',
      '  "flashcards": [{"front":"...", "back":"..."}]',
      "}",
      "Rules:",
      "- topicTitle must be concise and accurate.",
      "- explanation must be in-depth, specific, and clear for students.",
      "- explanation must follow this exact structure:",
      "  # Topic title",
      "  ## What This Material Covers",
      "  ## Major Segments",
      "  ### 1. Segment Name",
      "  - bullet points tied to that segment",
      "  ## Roadmap To Study",
      "  1. numbered steps in the order the student should study",
      "  ## What To Memorize",
      "  ## Likely Review Questions",
      "- identify the major segments or sections from the uploaded material itself.",
      "- for each major segment, explain the actual ideas, details, formulas, processes, or examples found in the material.",
      "- roadmap to study must tell the student the order to review the segments and how to approach them.",
      "- do not fill the explanation with generic study advice unless it is tied to a segment from the material.",
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
              contents: [
                {
                  parts: [
                    { text: prompt },
                    ...uploadedFiles.flatMap((file) => {
                      const parts: Array<
                        | { text: string }
                        | { inlineData: { mimeType: string; data: string } }
                      > = [{ text: `Uploaded file: ${file.name}` }];

                      if (file.extractedText) {
                        parts.push({
                          text: `Extracted text from ${file.name}:\n${file.extractedText.slice(0, 20_000)}`,
                        });
                      }

                      if (file.data && supportsGeminiInlineMime(file.mimeType)) {
                        parts.push({
                          inlineData: {
                            mimeType: file.mimeType,
                            data: file.data,
                          },
                        });
                      }

                      return parts;
                    }),
                  ],
                },
              ],
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
