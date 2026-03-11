import crypto from "crypto";
import path from "path";
import { promises as fs } from "fs";
import { isSupabaseConfigured, supabaseFetch } from "@/lib/supabase-rest";

export type SubjectSourceType = "audio" | "youtube" | "paste_notes" | "document";

// Backward-compatible exports kept to avoid stale build/import failures.
// Upload limits are now enforced via lib/auth.ts (FREE_UPLOAD_LIMIT).
export const FREE_STUDY_SET_LIMIT = 3;
export class StudySetLimitError extends Error {
  limit: number;

  constructor(limit = FREE_STUDY_SET_LIMIT) {
    super(`Deprecated study set limit reference (${limit}).`);
    this.name = "StudySetLimitError";
    this.limit = limit;
  }
}

export type SubjectRecord = {
  id: string;
  userId: string | null;
  topicName: string;
  sourceType: SubjectSourceType;
  notesText?: string;
  youtubeUrl?: string;
  fileName?: string;
  explanation?: string;
  questions?: string[];
  flashcards?: Array<{ front: string; back: string }>;
  createdAt: string;
};

type SubjectStore = {
  subjects: SubjectRecord[];
};

type SupabaseSubjectRow = {
  id: string;
  user_id: string | null;
  topic_name: string;
  source_type: SubjectSourceType;
  notes_text: string | null;
  youtube_url: string | null;
  file_name: string | null;
  explanation: string | null;
  questions: string[] | null;
  flashcards: Array<{ front: string; back: string }> | null;
  created_at: string | null;
};

const SUBJECT_STORE_PATH = path.join(process.cwd(), "data", "subjects.json");

function mapSubjectRow(row: SupabaseSubjectRow): SubjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    topicName: row.topic_name,
    sourceType: row.source_type,
    notesText: row.notes_text ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    fileName: row.file_name ?? undefined,
    explanation: row.explanation ?? undefined,
    questions: row.questions ?? undefined,
    flashcards: row.flashcards ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function toSubjectInsertRow(input: {
  id?: string;
  userId: string | null;
  topicName: string;
  sourceType: SubjectSourceType;
  notesText?: string;
  youtubeUrl?: string;
  fileName?: string;
  explanation?: string;
  questions?: string[];
  flashcards?: Array<{ front: string; back: string }>;
  createdAt?: string;
}): SupabaseSubjectRow {
  return {
    id: input.id ?? crypto.randomUUID(),
    user_id: input.userId,
    topic_name: input.topicName,
    source_type: input.sourceType,
    notes_text: input.notesText ?? null,
    youtube_url: input.youtubeUrl ?? null,
    file_name: input.fileName ?? null,
    explanation: input.explanation ?? null,
    questions: input.questions ?? null,
    flashcards: input.flashcards ?? null,
    created_at: input.createdAt ?? null,
  };
}

async function ensureStore(): Promise<void> {
  const dir = path.dirname(SUBJECT_STORE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(SUBJECT_STORE_PATH);
  } catch {
    await fs.writeFile(SUBJECT_STORE_PATH, JSON.stringify({ subjects: [] }, null, 2), "utf8");
  }
}

async function readStore(): Promise<SubjectStore> {
  await ensureStore();
  const raw = await fs.readFile(SUBJECT_STORE_PATH, "utf8");
  const parsed = JSON.parse(raw) as SubjectStore;
  return { subjects: parsed.subjects ?? [] };
}

async function writeStore(store: SubjectStore): Promise<void> {
  await ensureStore();
  await fs.writeFile(SUBJECT_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function createSubject(input: {
  userId: string | null;
  topicName?: string;
  sourceType: SubjectSourceType;
  notesText?: string;
  youtubeUrl?: string;
  fileName?: string;
  explanation?: string;
  questions?: string[];
  flashcards?: Array<{ front: string; back: string }>;
}): Promise<SubjectRecord> {
  const subject = toSubjectInsertRow({
    userId: input.userId,
    topicName:
      input.topicName?.trim() ||
      `Untitled ${input.sourceType} (${new Date().toLocaleDateString("en-US")})`,
    sourceType: input.sourceType,
    notesText: input.notesText?.trim() || undefined,
    youtubeUrl: input.youtubeUrl?.trim() || undefined,
    fileName: input.fileName?.trim() || undefined,
    explanation: input.explanation?.trim() || undefined,
    questions: input.questions,
    flashcards: input.flashcards,
    createdAt: new Date().toISOString(),
  });

  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<SupabaseSubjectRow[]>("/rest/v1/subjects", {
      method: "POST",
      query: { select: "*" },
      headers: { Prefer: "return=representation" },
      body: subject,
    });
    return mapSubjectRow(rows[0]);
  }

  const store = await readStore();
  const localSubject = mapSubjectRow(subject);
  store.subjects.unshift(localSubject);
  await writeStore(store);
  return localSubject;
}

export async function renameSubject(input: {
  id: string;
  userId: string | null;
  topicName: string;
}): Promise<SubjectRecord | null> {
  const normalized = input.topicName.trim();
  if (!normalized) return null;

  if (isSupabaseConfigured()) {
    const filters: Record<string, string> = {
      id: `eq.${input.id}`,
      select: "*",
    };
    filters.user_id = input.userId ? `eq.${input.userId}` : "is.null";

    const rows = await supabaseFetch<SupabaseSubjectRow[]>("/rest/v1/subjects", {
      method: "PATCH",
      query: filters,
      headers: { Prefer: "return=representation" },
      body: {
        topic_name: normalized,
      },
    });

    return rows[0] ? mapSubjectRow(rows[0]) : null;
  }

  const store = await readStore();

  const subject = store.subjects.find((item) => item.id === input.id);
  if (!subject) return null;

  if (input.userId && subject.userId !== input.userId) return null;
  if (!input.userId && subject.userId !== null) return null;

  subject.topicName = normalized;
  await writeStore(store);
  return subject;
}

export async function deleteSubject(input: {
  id: string;
  userId: string | null;
}): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const filters: Record<string, string> = {
      id: `eq.${input.id}`,
      select: "id",
    };
    filters.user_id = input.userId ? `eq.${input.userId}` : "is.null";

    const rows = await supabaseFetch<Array<{ id: string }>>("/rest/v1/subjects", {
      method: "DELETE",
      query: filters,
      headers: { Prefer: "return=representation" },
    });
    return rows.length > 0;
  }

  const store = await readStore();
  const index = store.subjects.findIndex((item) => item.id === input.id);
  if (index < 0) return false;

  const subject = store.subjects[index];
  if (input.userId && subject.userId !== input.userId) return false;
  if (!input.userId && subject.userId !== null) return false;

  store.subjects.splice(index, 1);
  await writeStore(store);
  return true;
}

export async function listSubjects(userId: string | null): Promise<SubjectRecord[]> {
  if (isSupabaseConfigured()) {
    const filters: Record<string, string | number> = {
      select: "*",
      order: "created_at.desc",
      limit: userId ? 50 : 20,
    };
    filters.user_id = userId ? `eq.${userId}` : "is.null";
    const rows = await supabaseFetch<SupabaseSubjectRow[]>("/rest/v1/subjects", {
      query: filters,
    });
    return rows.map(mapSubjectRow);
  }

  const store = await readStore();
  if (!userId) return store.subjects.slice(0, 20);
  return store.subjects.filter((item) => item.userId === userId).slice(0, 50);
}

export async function findSubjectById(id: string): Promise<SubjectRecord | null> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<SupabaseSubjectRow[]>("/rest/v1/subjects", {
      query: {
        select: "*",
        id: `eq.${id}`,
        limit: 1,
      },
    });
    return rows[0] ? mapSubjectRow(rows[0]) : null;
  }

  const store = await readStore();
  return store.subjects.find((item) => item.id === id) ?? null;
}

export async function updateSubjectGeneratedContent(input: {
  id: string;
  explanation?: string;
  questions?: string[];
  flashcards?: Array<{ front: string; back: string }>;
}): Promise<SubjectRecord | null> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<SupabaseSubjectRow[]>("/rest/v1/subjects", {
      method: "PATCH",
      query: {
        id: `eq.${input.id}`,
        select: "*",
      },
      headers: { Prefer: "return=representation" },
      body: {
        explanation: input.explanation,
        questions: input.questions,
        flashcards: input.flashcards,
      },
    });
    return rows[0] ? mapSubjectRow(rows[0]) : null;
  }

  const store = await readStore();
  const subject = store.subjects.find((item) => item.id === input.id);
  if (!subject) return null;

  if (input.explanation !== undefined) subject.explanation = input.explanation;
  if (input.questions !== undefined) subject.questions = input.questions;
  if (input.flashcards !== undefined) subject.flashcards = input.flashcards;

  await writeStore(store);
  return subject;
}
