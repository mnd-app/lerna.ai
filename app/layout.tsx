import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthNav from "./components/auth-nav";
import PrimaryNav from "./components/primary-nav";
import ThemeToggle from "./components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "lerna.ai",
  description: "AI-powered study platform for notes, summaries, and quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const key = "lerna-theme";
                  const saved = localStorage.getItem(key);
                  const theme =
                    saved === "dark" || saved === "light"
                      ? saved
                      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch {}
              })();
            `,
          }}
        />
        <header
          className="sticky top-0 z-30 backdrop-blur-xl"
          style={{
            backgroundColor: "var(--app-bg)",
            boxShadow: "none",
          }}
        >
          <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold"
                style={{
                  color: "white",
                  background:
                    "linear-gradient(135deg, var(--app-accent-strong), var(--app-accent))",
                  boxShadow: "0 8px 18px color-mix(in srgb, var(--app-accent) 35%, transparent)",
                }}
              >
                L
              </span>
              <span style={{ color: "var(--app-fg)" }}>lerna.ai</span>
            </Link>
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--app-muted)" }}>
              <PrimaryNav />
              <AuthNav />
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
