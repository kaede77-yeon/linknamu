import LinkList from "@/components/LinkList";
import Profile from "@/components/Profile";
import ThemeToggle from "@/components/ThemeToggle";
import { links } from "@/data/profile";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full justify-center px-6 py-14 sm:py-20">
      <section className="relative w-full max-w-md">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mt-6">
          <Profile />
        </div>

        <LinkList links={links} />
      </section>
    </main>
  );
}
