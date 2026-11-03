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
    <main className="flex min-h-screen w-full justify-center px-6 py-14 sm:py-20">
      <section className="relative w-full max-w-md">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mt-6">
          <Profile />
        </div>

        <nav className="mt-12 flex flex-col gap-4 sm:gap-5">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} initialCount={counts[link.id]} />
          ))}
        </nav>
      </section>
    </main>
  );
}
