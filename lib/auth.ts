import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";

export type OAuthProvider = "google" | "discord" | "apple" | "facebook" | "phone";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  preferredName: string;
  preferredLanguage: string;
  heardFrom: string;
  learnerType: string;
  onboardingCompleted: boolean;
  passwordHash: string;
  passwordSalt: string;
  oauthProviders: Partial<Record<OAuthProvider, string>>;
  verified: boolean;
  bio: string;
  createdAt: string;
  updatedAt: string;
};

type AuthStore = {
  users: UserRecord[];
};

type BaseTokenPayload = {
  sub: string;
  purpose: "session" | "verify";
  exp: number;
};

export type SessionPayload = BaseTokenPayload & {
  purpose: "session";
};

export type VerifyPayload = BaseTokenPayload & {
  purpose: "verify";
};

export type PublicUser = Omit<UserRecord, "passwordHash" | "passwordSalt">;

const AUTH_STORE_PATH = path.join(process.cwd(), "data", "auth-users.json");
const SESSION_COOKIE_NAME = "lerna_session";
const DEFAULT_SECRET = "dev-only-secret-change-me";
const TOKEN_SECRET = process.env.AUTH_SECRET ?? DEFAULT_SECRET;

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input: string): string {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(input).digest("base64url");
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 120_000, 32, "sha256").toString("hex");
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, segment) => {
    const [rawKey, ...rawValue] = segment.trim().split("=");
    if (!rawKey || rawValue.length === 0) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
}

async function ensureStore(): Promise<void> {
  const dir = path.dirname(AUTH_STORE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(AUTH_STORE_PATH);
  } catch {
    const emptyStore: AuthStore = { users: [] };
    await fs.writeFile(AUTH_STORE_PATH, JSON.stringify(emptyStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<AuthStore> {
  await ensureStore();
  const raw = await fs.readFile(AUTH_STORE_PATH, "utf8");
  const parsed = JSON.parse(raw) as { users?: Partial<UserRecord>[] };
  const users = (parsed.users ?? []).map((user) => ({
    id: user.id ?? crypto.randomUUID(),
    email: (user.email ?? "").toLowerCase().trim(),
    name: user.name ?? "User",
    preferredName: user.preferredName ?? "",
    preferredLanguage: user.preferredLanguage ?? "",
    heardFrom: user.heardFrom ?? "",
    learnerType: user.learnerType ?? "",
    onboardingCompleted: user.onboardingCompleted ?? false,
    passwordHash: user.passwordHash ?? "",
    passwordSalt: user.passwordSalt ?? "",
    oauthProviders: user.oauthProviders ?? {},
    verified: user.verified ?? false,
    bio: user.bio ?? "",
    createdAt: user.createdAt ?? new Date().toISOString(),
    updatedAt: user.updatedAt ?? new Date().toISOString(),
  }));

  return { users };
}

async function writeStore(store: AuthStore): Promise<void> {
  await ensureStore();
  await fs.writeFile(AUTH_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredName: user.preferredName,
    preferredLanguage: user.preferredLanguage,
    heardFrom: user.heardFrom,
    learnerType: user.learnerType,
    onboardingCompleted: user.onboardingCompleted,
    oauthProviders: user.oauthProviders ?? {},
    verified: user.verified,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const store = await readStore();
  const normalized = email.toLowerCase().trim();
  return store.users.find((user) => user.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const store = await readStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function findUserByProvider(
  provider: OAuthProvider,
  providerUserId: string,
): Promise<UserRecord | null> {
  const store = await readStore();
  return (
    store.users.find((user) => user.oauthProviders?.[provider] === providerUserId) ?? null
  );
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  const store = await readStore();
  const normalizedEmail = input.email.toLowerCase().trim();

  if (store.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("EMAIL_EXISTS");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    preferredName: "",
    preferredLanguage: "",
    heardFrom: "",
    learnerType: "",
    onboardingCompleted: false,
    passwordHash: hashPassword(input.password, salt),
    passwordSalt: salt,
    oauthProviders: {},
    verified: false,
    bio: "",
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  await writeStore(store);
  return user;
}

export function validatePassword(user: UserRecord, password: string): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const candidateHash = hashPassword(password, user.passwordSalt);
  const a = Buffer.from(user.passwordHash, "hex");
  const b = Buffer.from(candidateHash, "hex");

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function markUserVerified(userId: string): Promise<UserRecord | null> {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;

  user.verified = true;
  user.updatedAt = new Date().toISOString();
  await writeStore(store);
  return user;
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; bio?: string },
): Promise<UserRecord | null> {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;

  if (typeof input.name === "string") user.name = input.name.trim();
  if (typeof input.bio === "string") user.bio = input.bio.trim();
  user.updatedAt = new Date().toISOString();

  await writeStore(store);
  return user;
}

export async function completeUserOnboarding(
  userId: string,
  input: {
    preferredName: string;
    preferredLanguage: string;
    heardFrom: string;
    learnerType: string;
  },
): Promise<UserRecord | null> {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;

  user.preferredName = input.preferredName.trim();
  user.preferredLanguage = input.preferredLanguage.trim();
  user.heardFrom = input.heardFrom.trim();
  user.learnerType = input.learnerType.trim();
  user.onboardingCompleted = true;
  user.updatedAt = new Date().toISOString();

  await writeStore(store);
  return user;
}

export async function upsertOAuthUser(input: {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
  verified: boolean;
}): Promise<UserRecord> {
  const store = await readStore();
  const normalizedEmail = input.email.toLowerCase().trim();
  const now = new Date().toISOString();

  let user =
    store.users.find(
      (entry) => entry.oauthProviders?.[input.provider] === input.providerUserId,
    ) ?? store.users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: input.name.trim() || "User",
      preferredName: "",
      preferredLanguage: "",
      heardFrom: "",
      learnerType: "",
      onboardingCompleted: false,
      passwordHash: "",
      passwordSalt: "",
      oauthProviders: { [input.provider]: input.providerUserId },
      verified: input.verified,
      bio: "",
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
  } else {
    user.email = normalizedEmail;
    user.name = input.name.trim() || user.name;
    user.oauthProviders[input.provider] = input.providerUserId;
    user.verified = user.verified || input.verified;
    user.updatedAt = now;
  }

  await writeStore(store);
  return user;
}

function createToken(payload: Omit<BaseTokenPayload, "exp">, expiresInSec: number): string {
  const body: BaseTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function createSessionToken(userId: string): string {
  return createToken({ sub: userId, purpose: "session" }, 60 * 60 * 24 * 14);
}

export function createVerificationToken(userId: string): string {
  return createToken({ sub: userId, purpose: "verify" }, 60 * 60 * 24);
}

export function verifyToken(token: string): BaseTokenPayload | null {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const a = Buffer.from(providedSignature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as BaseTokenPayload;
    if (!payload?.sub || !payload?.purpose || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionTokenFromCookie(cookieHeader: string | null): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

export async function getCurrentUserFromCookieHeader(
  cookieHeader: string | null,
): Promise<UserRecord | null> {
  const token = getSessionTokenFromCookie(cookieHeader);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.purpose !== "session") return null;
  return findUserById(payload.sub);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
