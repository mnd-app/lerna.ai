import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthNav from "./components/auth-nav";
import MobileNav from "./components/mobile-nav";
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
  icons: {
    icon: "/lerna-brand.svg",
    shortcut: "/lerna-brand.svg",
    apple: "/lerna-brand.svg",
  },
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
          <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-2.5 sm:px-4 md:h-16 md:gap-4 md:px-6">
            <Link href="/" className="flex items-center gap-2 overflow-visible text-sm font-semibold tracking-wide">
              <img
                src="/lerna-brand.svg"
                alt="lerna"
                className="h-7 w-auto object-contain sm:h-9 md:h-10"
                loading="eager"
              />
            </Link>
            <div
              className="hidden min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap pr-0.5 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex"
              style={{ color: "var(--app-muted)" }}
            >
              <PrimaryNav />
              <AuthNav />
              <ThemeToggle />
            </div>
            <div className="md:hidden">
              <MobileNav />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

