"use client";

import { useState } from "react";
import { AUTHOR_MAX, BODY_MAX, PASSWORD_LENGTH } from "@/types/comment";

export type CommentFormInput = {
  author: string;
  body: string;
  password: string;
};

type Props = {
  onSubmit: (input: CommentFormInput) => Promise<void>;
  /** 답글·수정 폼은 조금 더 작고 취소 버튼이 붙는다 */
  compact?: boolean;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** 수정 폼은 이름을 받지 않고 기존 내용으로 시작한다 */
  mode?: "create" | "edit";
  initialBody?: string;
};

export const FIELD_CLASS =
  "w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-300/70 dark:border-white/10 dark:bg-white/[0.06] dark:placeholder:text-stone-500";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, PASSWORD_LENGTH);
}

export default function CommentForm({
  onSubmit,
  compact = false,
  placeholder = "따뜻한 한마디를 남겨주세요",
  submitLabel = "남기기",
  onCancel,
  autoFocus = false,
  mode = "create",
  initialBody = "",
}: Props) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState(initialBody);
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = body.trim();
  const passwordReady = password.length === PASSWORD_LENGTH;
  const disabled = sending || trimmed.length === 0 || !passwordReady;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;

    setSending(true);
    setError(null);
    try {
      await onSubmit({ author: author.trim(), body: trimmed, password });
      if (mode === "create") {
        setAuthor("");
        setBody("");
      }
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 저장하지 못했습니다");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      {mode === "create" && (
        <input
          type="text"
          value={author}
          maxLength={AUTHOR_MAX}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="이름 (비워두면 익명)"
          className={FIELD_CLASS}
        />
      )}
      <textarea
        value={body}
        maxLength={BODY_MAX}
        autoFocus={autoFocus}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className={`${FIELD_CLASS} resize-none leading-relaxed`}
      />
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={password}
        maxLength={PASSWORD_LENGTH}
        onChange={(event) => setPassword(onlyDigits(event.target.value))}
        placeholder={
          mode === "edit"
            ? `비밀번호 숫자 ${PASSWORD_LENGTH}자리`
            : `비밀번호 숫자 ${PASSWORD_LENGTH}자리 (수정·삭제할 때 필요해요)`
        }
        className={`${FIELD_CLASS} tracking-[0.4em]`}
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
