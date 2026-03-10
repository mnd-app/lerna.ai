import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import HeaderDesktopNav from "./components/header-desktop-nav";
import MobileNav from "./components/mobile-nav";
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
    icon: "/lerna-favicon.svg",
    shortcut: "/lerna-favicon.svg",
    apple: "/lerna-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
            backgroundColor: "color-mix(in srgb, var(--app-card) 42%, transparent)",
            borderBottom: "1px solid color-mix(in srgb, var(--app-border) 62%, transparent)",
            boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 12%, transparent)",
            backdropFilter: "blur(16px) saturate(145%)",
            WebkitBackdropFilter: "blur(16px) saturate(145%)",
          }}
        >
          <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-2.5 sm:px-4 md:h-16 md:gap-4 md:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2 overflow-visible text-sm font-semibold tracking-wide">
              <img
                src="/lerna-mobile-logo.svg"
                alt="lerna"
                className="h-12 w-auto object-contain md:hidden"
                loading="eager"
              />
              <img
                src="/lerna-web-logo.svg"
                alt="lerna"
                className="hidden h-10 w-auto object-contain md:block"
                loading="eager"
              />
            </Link>
            <HeaderDesktopNav />
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

