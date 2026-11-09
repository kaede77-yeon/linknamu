"use client";

import CommentForm from "@/components/CommentForm";
import { MAX_DEPTH, type CommentNode } from "@/types/comment";

type Props = {
  node: CommentNode;
  replyTo: string | null;
  onReplyOpen: (id: string | null) => void;
  onReply: (
    parentId: string,
    input: { author: string; body: string }
  ) => Promise<void>;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CommentThread({
  node,
  replyTo,
  onReplyOpen,
  onReply,
}: Props) {
  const canReply = node.depth < MAX_DEPTH;
  const isReplying = replyTo === node.id;

  return (
    <li>
      <article className="rounded-3xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_24px_-12px_rgba(120,84,60,0.28)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-semibold tracking-[-0.01em]">
            {node.author}
          </span>
          <time
            dateTime={node.createdAt}
            className="shrink-0 text-[11px] tabular-nums text-stone-400 dark:text-stone-500"
          >
            {formatDate(node.createdAt)}
          </time>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {node.body}
        </p>

        {canReply && !isReplying && (
          <button
            type="button"
            onClick={() => onReplyOpen(node.id)}
            className="mt-3 text-xs font-medium text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
          >
            답글 쓰기
          </button>
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
        <ul className="mt-3 flex flex-col gap-3 border-l border-stone-300/60 pl-3 sm:pl-5 dark:border-white/10">
          {node.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              node={reply}
              replyTo={replyTo}
              onReplyOpen={onReplyOpen}
              onReply={onReply}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
