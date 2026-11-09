"use client";

import { useEffect, useState } from "react";
import CommentForm from "@/components/CommentForm";
import CommentThread from "@/components/CommentThread";
import { buildCommentTree, type CommentItem } from "@/types/comment";

export default function CommentSection() {
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/comments", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "댓글을 불러오지 못했습니다");
        return data as { comments: CommentItem[] };
      })
      .then((data) => setComments(data.comments ?? []))
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        setComments([]);
        setLoadError(error.message);
      });

    return () => controller.abort();
  }, []);

  async function submit(input: {
    author: string;
    body: string;
    parentId?: string | null;
  }) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error ?? "댓글을 저장하지 못했습니다");
    }

    const created = data.comment as CommentItem;
    setComments((prev) => [...(prev ?? []), created]);
    setReplyTo(null);
    setLoadError(null);
  }

  const tree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="mt-8">
      <div className="rounded-3xl border border-white/60 bg-white/55 px-5 py-5 shadow-[0_8px_24px_-12px_rgba(120,84,60,0.28)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)]">
        <CommentForm onSubmit={(input) => submit({ ...input, parentId: null })} />
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-[-0.01em]">
          남겨진 댓글
        </h2>
        <span className="text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
          {comments ? `${comments.length}개` : "불러오는 중…"}
        </span>
      </div>

      {loadError && (
        <p className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-xs text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {loadError}
        </p>
      )}

      {comments && comments.length === 0 && !loadError && (
        <p className="mt-4 rounded-3xl border border-dashed border-white/70 px-5 py-8 text-center text-sm text-stone-400 dark:border-white/10 dark:text-stone-500">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요 🌱
        </p>
      )}

      <ul className="mt-5 flex flex-col gap-8">
        {tree.map((node) => (
          <CommentThread
            key={node.id}
            node={node}
            replyTo={replyTo}
            onReplyOpen={setReplyTo}
            onReply={(parentId, input) => submit({ ...input, parentId })}
          />
        ))}
      </ul>
    </div>
  );
}
