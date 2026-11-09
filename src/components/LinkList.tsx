"use client";

import { useEffect, useState } from "react";
import LinkCard from "@/components/LinkCard";
import type { LinkItem } from "@/data/profile";

type Props = {
  links: LinkItem[];
};

export default function LinkList({ links }: Props) {
  // null = 아직 받지 못한 상태 (카드에서 0회로 표시된다)
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/clicks", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("조회 실패"))))
      .then((data: { counts?: Record<string, number> }) => {
        setCounts(data.counts ?? {});
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          console.error("클릭 수 조회 실패", error);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <nav className="mt-12 flex flex-col gap-4 sm:gap-5">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} count={counts?.[link.id]} />
      ))}
    </nav>
  );
}
