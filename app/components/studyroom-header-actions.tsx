"use client";

import { useEffect, useRef, useState } from "react";

type StudyroomHeaderActionsProps = {
  mobile?: boolean;
};

export default function StudyroomHeaderActions({
  mobile = false,
}: StudyroomHeaderActionsProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"study-sets" | "folders">("study-sets");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("studyboard-search-change", {
        detail: { query: searchQuery },
      }),
    );
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent("studyboard-search-change", {
          detail: { query: "" },
        }),
      );
    };
  }, []);

  useEffect(() => {
    function handleViewSync(event: Event) {
      const customEvent = event as CustomEvent<{ view?: "study-sets" | "folders" }>;
      setActiveView(customEvent.detail?.view === "folders" ? "folders" : "study-sets");
    }

    window.addEventListener("studyboard-view-sync", handleViewSync);

    return () => {
      window.removeEventListener("studyboard-view-sync", handleViewSync);
    };
  }, []);

  return (
    <div
      className={`flex items-center ${mobile ? "gap-2" : "ml-auto gap-3"} text-base`}
      style={{ color: "var(--app-muted)" }}
    >
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          searchOpen
            ? mobile
              ? "w-36 opacity-100"
              : "w-44 opacity-100 sm:w-72"
            : "pointer-events-none w-0 opacity-0"
        }`}
      >
        <div
          className="flex items-center rounded-full border px-3 py-1.5"
          style={{
            borderColor: "var(--app-border)",
            backgroundColor:
              "color-mix(in srgb, var(--app-bg) 90%, var(--app-card) 10%)",
          }}
        >
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search study sets..."
            className="w-full min-w-0 bg-transparent text-sm outline-none"
            style={{ color: "var(--app-fg)" }}
            aria-label="Search study sets"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer text-sm transition hover:opacity-80"
              aria-label="Clear search"
            >
              x
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        aria-label="Search study sets"
        aria-pressed={searchOpen}
        onClick={() => {
          if (searchOpen && !searchQuery) {
            setSearchOpen(false);
            return;
          }
          setSearchOpen(true);
        }}
        className="cursor-pointer transition hover:opacity-80"
      >
        {"\u2315"}
      </button>

      <button
        type="button"
        onClick={() => {
          const nextView = activeView === "folders" ? "study-sets" : "folders";
          setActiveView(nextView);
          window.dispatchEvent(
            new CustomEvent("studyboard-view-change", {
              detail: { view: nextView },
            }),
          );
        }}
        className="cursor-pointer rounded-full border px-3 py-1.5 transition hover:opacity-80"
        style={{
          borderColor:
            activeView === "folders"
              ? "color-mix(in srgb, var(--app-accent) 60%, var(--app-border))"
              : "transparent",
          backgroundColor:
            activeView === "folders"
              ? "color-mix(in srgb, var(--app-accent) 14%, transparent)"
              : "transparent",
          color: activeView === "folders" ? "var(--app-fg)" : "var(--app-muted)",
        }}
      >
        Folders
      </button>
    </div>
  );
}
