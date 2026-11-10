import Link from "next/link";
import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `나만의 갤러리 | 링크나무`,
  description: `${profile.name}의 사진 갤러리`,
};

export default function GalleryPage() {
  return (
    <main className="flex min-h-screen w-full justify-center px-6 py-14 sm:py-20">
      <section className="relative w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-white/60 bg-white/50 px-3.5 py-2 text-xs font-medium shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
          >
            ← 링크나무
          </Link>
          <ThemeToggle />
        </div>

        <header className="mt-8 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.02em]">
            🖼 나만의 갤러리
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            사진을 올리고 바둑판으로 모아 봅니다. 사진을 누르면 크게 볼 수 있어요.
          </p>
        </header>

        <Gallery />
      </section>
    </main>
  );
}
