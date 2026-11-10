"use client";

import { useState } from "react";
import { PASSWORD_LENGTH } from "@/types/comment";
import { FIELD_CLASS, onlyDigits } from "@/components/CommentForm";

type Props = {
  label: string;
  confirmLabel: string;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
  /** 되돌릴 수 없는 작업이면 버튼을 빨갛게 */
  danger?: boolean;
};

/** 비밀번호 숫자 4자리만 받아서 확인하는 작은 폼 (삭제 확인용) */
export default function PasswordPrompt({
  label,
  confirmLabel,
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = working || password.length !== PASSWORD_LENGTH;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled) return;

    setWorking(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리하지 못했습니다");
      setWorking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        value={password}
        maxLength={PASSWORD_LENGTH}
        onChange={(event) => setPassword(onlyDigits(event.target.value))}
        placeholder={`비밀번호 숫자 ${PASSWORD_LENGTH}자리`}
        className={`${FIELD_CLASS} tracking-[0.4em]`}
      />

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={disabled}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
            danger
              ? "border-rose-200/80 bg-rose-50/80 text-rose-600 hover:bg-rose-100/90 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/20"
              : "border-white/60 bg-white/70 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.1] dark:hover:bg-white/[0.16]"
          }`}
        >
          {working ? "확인 중…" : confirmLabel}
        </button>
      </div>
    </form>
  );
}
