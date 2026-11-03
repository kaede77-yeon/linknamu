"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "밝은 화면으로 전환" : "어두운 화면으로 전환"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full border border-white/60 bg-white/50 p-2 text-base leading-none shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
