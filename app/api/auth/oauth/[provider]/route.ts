import { NextResponse } from "next/server";

const PROVIDER_CONFIG: Record<string, string | undefined> = {
  google: process.env.GOOGLE_CLIENT_ID,
  apple: process.env.APPLE_CLIENT_ID,
  phone: process.env.PHONE_AUTH_ENABLED,
  facebook: process.env.FACEBOOK_CLIENT_ID,
  discord: process.env.DISCORD_CLIENT_ID,
};

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const configValue = PROVIDER_CONFIG[provider];
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!configValue) {
    const authUrl = new URL("/auth", url.origin);
    authUrl.searchParams.set("mode", "login");
    authUrl.searchParams.set("next", next);
    authUrl.searchParams.set(
      "error",
      `${provider} login is not configured yet. Add provider credentials in environment variables.`,
    );
    return NextResponse.redirect(authUrl);
  }

  const authUrl = new URL("/auth", url.origin);
  authUrl.searchParams.set("mode", "login");
  authUrl.searchParams.set("next", next);
  authUrl.searchParams.set(
    "error",
    `${provider} login wiring is ready, but callback exchange is not implemented yet.`,
  );
  return NextResponse.redirect(authUrl);
}
