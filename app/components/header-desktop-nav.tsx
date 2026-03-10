"use client";

import { usePathname } from "next/navigation";
import AuthNav from "./auth-nav";
import PrimaryNav from "./primary-nav";
import StudyroomHeaderActions from "./studyroom-header-actions";
import ThemeToggle from "./theme-toggle";

export default function HeaderDesktopNav() {
  const pathname = usePathname();
  const isStudyroomHome = pathname === "/studyroom";
  const isStudyroomRoute =
    pathname === "/studyroom" || pathname.startsWith("/studyroom/");

  if (isStudyroomHome) {
    return (
      <div className="hidden min-w-0 items-center md:flex">
        <StudyroomHeaderActions />
      </div>
    );
  }

  if (isStudyroomRoute) {
    return null;
  }

  return (
    <div
      className="hidden min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap pr-0.5 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex"
      style={{ color: "var(--app-muted)" }}
    >
      <PrimaryNav />
      <AuthNav />
      <ThemeToggle />
    </div>
  );
}
