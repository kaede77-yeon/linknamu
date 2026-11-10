"use client";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 화면 낭독기에 읽히는 이름 (댓글·갤러리에서 함께 쓴다) */
  label?: string;
};

/** 현재 페이지 주변 번호만 보여준다 (모바일에서 줄이 넘치지 않게) */
function pageWindow(page: number, totalPages: number, span = 2): number[] {
  let start = Math.max(1, page - span);
  let end = Math.min(totalPages, page + span);

  // 양 끝에서는 반대쪽을 더 보여줘 폭을 일정하게 유지한다
  const size = span * 2 + 1;
  if (end - start + 1 < size) {
    if (start === 1) end = Math.min(totalPages, start + size - 1);
    else start = Math.max(1, end - size + 1);
  }

  const pages: number[] = [];
  for (let value = start; value <= end; value += 1) pages.push(value);
  return pages;
}

const BASE =
  "flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-xs font-medium tabular-nums transition duration-300 disabled:cursor-not-allowed disabled:opacity-35";
const QUIET = `${BASE} border border-white/60 bg-white/55 shadow-[0_6px_18px_-12px_rgba(120,84,60,0.35)] backdrop-blur-md hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]`;
const CURRENT = `${BASE} border border-amber-300/70 bg-amber-100/70 font-semibold text-stone-800 shadow-[0_6px_18px_-12px_rgba(120,84,60,0.45)] backdrop-blur-md dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100`;

export default function Pagination({
  page,
  totalPages,
  onChange,
  label = "페이지",
}: Props) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label={label}
      className="mt-8 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className={QUIET}
      >
        ‹
      </button>

      {pages[0] > 1 && (
        <span className="px-1 text-xs text-stone-400 dark:text-stone-500">…</span>
      )}

      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-current={value === page ? "page" : undefined}
          className={value === page ? CURRENT : QUIET}
        >
          {value}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <span className="px-1 text-xs text-stone-400 dark:text-stone-500">…</span>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className={QUIET}
      >
        ›
      </button>
    </nav>
  );
}
