type QueryValue = string | number | boolean;

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVER_KEY =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export class SupabaseRequestError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "SupabaseRequestError";
    this.status = status;
    this.details = details;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVER_KEY);
}

function buildSupabaseUrl(
  path: string,
  query?: Record<string, QueryValue | null | undefined>,
): URL {
  const url = new URL(path, SUPABASE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export async function supabaseFetch<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    query?: Record<string, QueryValue | null | undefined>;
    headers?: Record<string, string>;
  },
): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const usesLegacyJwt = !SUPABASE_SERVER_KEY.startsWith("sb_");

  const response = await fetch(buildSupabaseUrl(path, options?.query), {
    method: options?.method ?? "GET",
    headers: {
      apikey: SUPABASE_SERVER_KEY,
      ...(usesLegacyJwt ? { Authorization: `Bearer ${SUPABASE_SERVER_KEY}` } : {}),
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const raw = await response.text();
  const parsed = raw ? safeJsonParse(raw) : null;

  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof parsed.message === "string"
        ? parsed.message
        : `Supabase request failed with status ${response.status}.`;
    throw new SupabaseRequestError(message, response.status, parsed);
  }

  return parsed as T;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
