"use client";

import { useState } from "react";
import type { LinkItem } from "@/data/profile";

type Props = {
  link: LinkItem;
  initialCount?: number;
};

export default function LinkCard({ link, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);

  // 링크 이동을 막지 않도록 집계는 백그라운드로 보낸다
  function handleClick() {
    setCount((prev) => prev + 1);
    const url = `/api/links/${link.id}/click`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { method: "POST", keepalive: true }).catch(() => {});
    }
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <span className="min-w-0">
        <span className="block truncate font-medium">{link.title}</span>
        {link.description && (
          <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
            {link.description}
          </span>
        )}
      </span>
      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
        {count.toLocaleString()} 클릭
      </span>
    </a>
  );
}
