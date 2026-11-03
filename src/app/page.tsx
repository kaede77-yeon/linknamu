import LinkCard from "@/components/LinkCard";
import Profile from "@/components/Profile";
import ThemeToggle from "@/components/ThemeToggle";
import { links } from "@/data/profile";
import { getClickCounts } from "@/lib/clicks";

export const dynamic = "force-dynamic";

export default async function Home() {
  let counts: Record<string, number> = {};
  try {
    counts = await getClickCounts();
  } catch (error) {
    console.error("클릭 수 조회 실패", error);
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-8">
      {/* 와이어프레임의 둥근 프레임 */}
      <section className="relative w-full max-w-sm rounded-[2rem] border border-slate-300 bg-white px-6 pb-10 pt-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mt-2">
          <Profile />
        </div>

        <nav className="mt-8 flex flex-col gap-4">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} initialCount={counts[link.id]} />
          ))}
        </nav>
      </section>
    </main>
  );
}
