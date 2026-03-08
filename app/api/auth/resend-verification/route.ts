import { NextResponse } from "next/server";
import {
  createVerificationToken,
  getCurrentUserFromCookieHeader,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.verified) {
      return NextResponse.json({ message: "Email is already verified." });
    }

    const token = createVerificationToken(user.id);
    const origin = new URL(request.url).origin;
    const verificationUrl = `${origin}/verify-email?token=${encodeURIComponent(token)}`;

    return NextResponse.json({
      message: "Verification link generated.",
      verificationUrl,
    });
  } catch {
    return NextResponse.json({ error: "Failed to resend verification." }, { status: 500 });
  }
}
