"use client";

import { useState } from "react";
import type { LinkItem } from "@/data/profile";

type Props = {
  link: LinkItem;
  /** 서버에서 받아온 클릭 수. 아직 받지 못했으면 undefined */
  count?: number;
};

export default function LinkCard({ link, count }: Props) {
  // 내가 방금 누른 횟수. 서버 값이 늦게 도착해도 덮어쓰이지 않도록 따로 센다
  const [myClicks, setMyClicks] = useState(0);
  const displayCount = (count ?? 0) + myClicks;

  // 링크 이동을 막지 않도록 집계는 백그라운드로 보낸다
  function handleClick() {
    setMyClicks((prev) => prev + 1);
    const url = `/api/links/${link.id}/click`;
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
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
      className="flex items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/55 px-6 py-5 shadow-[0_8px_24px_-12px_rgba(120,84,60,0.28)] backdrop-blur-md transition duration-300 hover:border-white/80 hover:bg-white/75 hover:shadow-[0_12px_28px_-12px_rgba(120,84,60,0.34)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300/70 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)] dark:hover:border-white/20 dark:hover:bg-white/[0.1]"
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold tracking-[-0.01em]">
          {link.title}
        </span>
        {link.description && (
          <span className="mt-0.5 block truncate text-sm text-stone-500 dark:text-stone-400">
            {link.description}
          </span>
        )}
      </span>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-stone-400 dark:text-stone-500">
        {displayCount.toLocaleString()}회
      </span>
    </a>
  );
}
