"use client";

import { useState } from "react";
import { AUTHOR_MAX, BODY_MAX } from "@/types/comment";

type Props = {
  onSubmit: (input: { author: string; body: string }) => Promise<void>;
  /** 답글 폼은 조금 더 작고 취소 버튼이 붙는다 */
  compact?: boolean;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
};

export default function CommentForm({
  onSubmit,
  compact = false,
  placeholder = "따뜻한 한마디를 남겨주세요",
  submitLabel = "남기기",
  onCancel,
  autoFocus = false,
}: Props) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = body.trim();
  const disabled = sending || trimmed.length === 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;

    setSending(true);
    setError(null);
    try {
      await onSubmit({ author: author.trim(), body: trimmed });
      setAuthor("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 저장하지 못했습니다");
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-300/70 dark:border-white/10 dark:bg-white/[0.06] dark:placeholder:text-stone-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="text"
        value={author}
        maxLength={AUTHOR_MAX}
        onChange={(event) => setAuthor(event.target.value)}
        placeholder="이름 (비워두면 익명)"
        className={fieldClass}
      />
      <textarea
        value={body}
        maxLength={BODY_MAX}
        autoFocus={autoFocus}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className={`${fieldClass} resize-none leading-relaxed`}
      />

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
          {trimmed.length}/{BODY_MAX}
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full border border-white/60 bg-white/70 px-4 py-1.5 text-xs font-semibold shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.1] dark:hover:bg-white/[0.16]"
        >
          {sending ? "보내는 중…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
