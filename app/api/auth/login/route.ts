import { NextResponse } from "next/server";
import {
  createSessionToken,
  findUserByEmail,
  setSessionCookie,
  toPublicUser,
  validatePassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !validatePassword(user, password)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionToken = createSessionToken(user.id);
    const response = NextResponse.json({
      user: toPublicUser(user),
      message: user.verified
        ? "Login successful."
        : "Login successful. Please verify your email.",
    });
    setSessionCookie(response, sessionToken);
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to login." }, { status: 500 });
  }
}
