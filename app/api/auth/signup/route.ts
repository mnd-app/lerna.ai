import { NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  PasswordValidationError,
  createVerificationToken,
  setSessionCookie,
  toPublicUser,
} from "@/lib/auth";
import { getPasswordValidationError } from "@/lib/password-rules";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 },
      );
    }

    const user = await createUser({ name, email, password });
    const sessionToken = createSessionToken(user.id);
    const verificationToken = createVerificationToken(user.id);
    const origin = new URL(request.url).origin;
    const verificationUrl = `${origin}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    const response = NextResponse.json({
      user: toPublicUser(user),
      verificationUrl,
      message: "Account created. Verify your email to unlock all features.",
    });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    if (error instanceof PasswordValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
