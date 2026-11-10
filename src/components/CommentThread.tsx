"use client";

import { useState } from "react";
import CommentForm from "@/components/CommentForm";
import PasswordPrompt from "@/components/PasswordPrompt";
import { MAX_DEPTH, type CommentNode } from "@/types/comment";

type Props = {
  node: CommentNode;
  replyTo: string | null;
  onReplyOpen: (id: string | null) => void;
  onReply: (
    parentId: string,
    input: { author: string; body: string; password: string }
  ) => Promise<void>;
  onEdit: (id: string, input: { body: string; password: string }) => Promise<void>;
  onDelete: (id: string, password: string) => Promise<void>;
  /** 형제 중 마지막이면 연결선을 꺾임에서 끊는다 */
  isLast?: boolean;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const LINE = "border-stone-300/70 dark:border-white/15";
const LINE_BG = "bg-stone-300/70 dark:bg-white/15";
const ACTION_CLASS =
  "text-xs font-medium text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100";

export default function CommentThread({
  node,
  replyTo,
  onReplyOpen,
  onReply,
  onEdit,
  onDelete,
  isLast = true,
}: Props) {
  const [action, setAction] = useState<"none" | "edit" | "delete">("none");

  const canReply = node.depth < MAX_DEPTH;
  const isReplying = replyTo === node.id;
  const isReply = node.depth > 0;
  const idle = action === "none" && !isReplying;

  return (
    <li className={isReply ? "relative pt-6 pl-6 sm:pl-9" : undefined}>
      {isReply && (
        <>
          {/* 부모에서 내려와 카드로 꺾여 들어가는 ㄴ자 연결선 */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 h-11 w-5 rounded-bl-xl border-b border-l sm:w-8 ${LINE}`}
          />
          {/* 아래 형제가 더 있으면 세로선을 끝까지 내린다 */}
          {!isLast && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-0 left-0 top-11 w-px ${LINE_BG}`}
            />
          )}
        </>
      )}

      <article
        className={`rounded-3xl border border-white/60 px-5 py-4 shadow-[0_8px_24px_-12px_rgba(120,84,60,0.28)] backdrop-blur-md dark:border-white/10 dark:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)] ${
          isReply ? "bg-white/45 dark:bg-white/[0.04]" : "bg-white/55 dark:bg-white/[0.06]"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex min-w-0 items-baseline gap-1.5">
            {isReply && (
              <span className="shrink-0 text-[11px] text-stone-400 dark:text-stone-500">
                ↳
              </span>
            )}
            <span className="truncate text-sm font-semibold tracking-[-0.01em]">
              {node.author}
            </span>
          </span>
          <time
            dateTime={node.updatedAt ?? node.createdAt}
            className="shrink-0 text-[11px] tabular-nums text-stone-400 dark:text-stone-500"
          >
            {formatDate(node.createdAt)}
            {node.updatedAt ? " (수정)" : ""}
          </time>
        </div>

        {action === "edit" ? (
          <div className="mt-3">
            <CommentForm
              compact
              autoFocus
              mode="edit"
              initialBody={node.body}
              submitLabel="수정하기"
              placeholder="내용을 고쳐주세요"
              onCancel={() => setAction("none")}
              onSubmit={async (input) => {
                await onEdit(node.id, {
                  body: input.body,
                  password: input.password,
                });
                setAction("none");
              }}
            />
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            {node.body}
          </p>
        )}

        {idle && (
          <div className="mt-3 flex items-center gap-3">
            {canReply && (
              <button
                type="button"
                onClick={() => onReplyOpen(node.id)}
                className={ACTION_CLASS}
              >
                답글 쓰기
              </button>
            )}
            <button
              type="button"
              onClick={() => setAction("edit")}
              className={ACTION_CLASS}
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => setAction("delete")}
              className="text-xs font-medium text-stone-500 transition hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
            >
              삭제
            </button>
          </div>
        )}

        {action === "delete" && (
          <div className="mt-3 border-t border-white/60 pt-3 dark:border-white/10">
            <PasswordPrompt
              danger
              confirmLabel="삭제하기"
              label={
                node.replies.length > 0
                  ? "이 댓글에 달린 답글까지 함께 지워집니다. 비밀번호를 입력해 주세요."
                  : "댓글을 지우려면 비밀번호를 입력해 주세요."
              }
              onCancel={() => setAction("none")}
              onConfirm={(password) => onDelete(node.id, password)}
            />
          </div>
        )}

        {isReplying && (
          <div className="mt-3 border-t border-white/60 pt-3 dark:border-white/10">
            <CommentForm
              compact
              autoFocus
              submitLabel="답글 남기기"
              placeholder={`${node.author}님에게 답글 쓰기`}
              onCancel={() => onReplyOpen(null)}
              onSubmit={(input) => onReply(node.id, input)}
            />
          </div>
        )}
      </article>

      {node.replies.length > 0 && (
        <ul className="flex flex-col pl-3 sm:pl-5">
          {node.replies.map((reply, index) => (
            <CommentThread
              key={reply.id}
              node={reply}
              replyTo={replyTo}
              onReplyOpen={onReplyOpen}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isLast={index === node.replies.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
