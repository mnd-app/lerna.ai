import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthNav from "./components/auth-nav";
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
  title: "mnd.app",
  description: "AI-powered study platform for notes, summaries, and quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const key = "mnd-theme";
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
          className="sticky top-0 z-30 border-b backdrop-blur"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-card)" }}
        >
          <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold"
                style={{
                  color: "white",
                  background:
                    "linear-gradient(135deg, var(--app-accent-strong), var(--app-accent))",
                }}
              >
                M
              </span>
              <span style={{ color: "var(--app-fg)" }}>mnd.app</span>
            </Link>
            <div className="flex items-center gap-5 text-sm" style={{ color: "var(--app-muted)" }}>
              <Link href="/dashboard" className="hover:opacity-80">
                Dashboard
              </Link>
              <Link href="/upload" className="hover:opacity-80">
                Upload
              </Link>
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
