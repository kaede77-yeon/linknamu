import Link from "next/link";
import type { Metadata } from "next";
import CommentSection from "@/components/CommentSection";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${profile.name}에게 댓글쓰기 | 링크나무`,
  description: `${profile.name}에게 한마디를 남겨보세요`,
};

export default function CommentsPage() {
  return (
    <main className="flex min-h-screen w-full justify-center px-6 py-14 sm:py-20">
      <section className="relative w-full max-w-md">
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
            💬 {profile.name}에게 댓글쓰기
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            자유롭게 한마디 남겨주세요. 답글은 2번까지 달 수 있어요.
            비밀번호 숫자 4자리를 적어두면 나중에 수정·삭제할 수 있어요.
          </p>
        </header>

        <CommentSection />
      </section>
    </main>
  );
}
