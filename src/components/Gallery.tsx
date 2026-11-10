"use client";

import { useEffect, useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import PasswordPrompt from "@/components/PasswordPrompt";
import {
  MAX_FILES_PER_UPLOAD,
  downloadUrl,
  imageUrl,
  type GalleryImage,
} from "@/types/gallery";

const PILL =
  "rounded-full border border-white/60 bg-white/60 px-3.5 py-2 text-xs font-medium shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]";

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [askPassword, setAskPassword] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/gallery", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "이미지를 불러오지 못했습니다");
        return data as { images: GalleryImage[] };
      })
      .then((data) => setImages(data.images ?? []))
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setImages([]);
        setError(err.message);
      });

    return () => controller.abort();
  }, []);

  async function upload(files: FileList) {
    const picked = Array.from(files).slice(0, MAX_FILES_PER_UPLOAD);
    if (picked.length === 0) return;

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      for (const file of picked) form.append("files", file);

      const res = await fetch("/api/gallery", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "이미지를 올리지 못했습니다");

      const added = (data.images ?? []) as GalleryImage[];
      setImages((prev) => [...added, ...(prev ?? [])]);
      setMessage(`${added.length}장을 올렸어요`);
      // 일부만 막힌 경우도 알려준다
      if (data.errors) setError((data.errors as string[]).join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지를 올리지 못했습니다");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function leaveSelectMode() {
    setSelecting(false);
    setSelected(new Set());
    setAskPassword(false);
  }

  async function removeSelected(password: string) {
    const ids = Array.from(selected);
    const res = await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error ?? "이미지를 삭제하지 못했습니다");
    }

    const gone = new Set<string>(data?.deletedIds ?? ids);
    setImages((prev) => (prev ?? []).filter((item) => !gone.has(item.id)));
    setMessage(`${gone.size}장을 지웠어요`);
    setError(null);
    leaveSelectMode();
  }

  /** 고른 이미지를 한 장씩 내려받는다 */
  function downloadSelected() {
    const list = (images ?? []).filter((item) => selected.has(item.id));
    for (const item of list) {
      const anchor = document.createElement("a");
      anchor.href = downloadUrl(item.id);
      anchor.download = item.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    setMessage(`${list.length}장을 내려받는 중이에요`);
  }

  const list = images ?? [];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          // display:none이면 일부 모바일 브라우저가 프로그램 클릭을 막는다.
          // 화면에서만 숨기고, 버튼과 겹치지 않게 탭 순서에서는 뺀다
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            if (event.target.files) void upload(event.target.files);
          }}
        />

        {!selecting ? (
          <>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className={PILL}
            >
              {uploading ? "올리는 중…" : "＋ 사진 올리기"}
            </button>
            <button
              type="button"
              disabled={list.length === 0}
              onClick={() => setSelecting(true)}
              className={PILL}
            >
              선택
            </button>
            <span className="ml-auto text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
              {images ? `${list.length}장` : "불러오는 중…"}
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={downloadSelected}
              className={PILL}
            >
              ⤓ 내려받기
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => setAskPassword(true)}
              className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3.5 py-2 text-xs font-medium text-rose-600 shadow-[0_6px_18px_-10px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:bg-rose-100/90 disabled:cursor-not-allowed disabled:opacity-45 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/20"
            >
              🗑 삭제
            </button>
            <button type="button" onClick={leaveSelectMode} className={PILL}>
              취소
            </button>
            <span className="ml-auto text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
              {selected.size}장 선택
            </span>
          </>
        )}
      </div>

      {askPassword && (
        <div className="mt-4 rounded-3xl border border-white/60 bg-white/55 px-5 py-4 shadow-[0_8px_24px_-12px_rgba(120,84,60,0.28)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06]">
          <PasswordPrompt
            danger
            confirmLabel={`${selected.size}장 삭제하기`}
            label="사진을 지우려면 관리자 비밀번호를 입력해 주세요."
            onCancel={() => setAskPassword(false)}
            onConfirm={removeSelected}
          />
        </div>
      )}

      {message && !error && (
        <p className="mt-4 rounded-2xl border border-white/60 bg-white/55 px-4 py-3 text-xs text-stone-600 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-300">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 whitespace-pre-line rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-xs text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </p>
      )}

      {images && list.length === 0 && (
        <p className="mt-5 rounded-3xl border border-dashed border-white/70 px-5 py-12 text-center text-sm text-stone-400 dark:border-white/10 dark:text-stone-500">
          아직 사진이 없어요. 첫 사진을 올려보세요 🖼
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((item, index) => {
          const isSelected = selected.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => (selecting ? toggle(item.id) : setViewing(index))}
                className={`group relative block aspect-square w-full overflow-hidden rounded-2xl border bg-white/40 shadow-[0_8px_24px_-14px_rgba(120,84,60,0.35)] backdrop-blur-md transition duration-300 hover:shadow-[0_10px_28px_-12px_rgba(120,84,60,0.45)] dark:bg-white/[0.04] ${
                  isSelected
                    ? "border-amber-400/80 ring-2 ring-amber-300/70"
                    : "border-white/60 dark:border-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(item.id)}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                {selecting && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                      isSelected
                        ? "border-amber-400 bg-amber-400 text-white"
                        : "border-white/70 bg-black/25 text-transparent backdrop-blur-md"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {viewing !== null && list.length > 0 && (
        <Lightbox
          images={list}
          index={Math.min(viewing, list.length - 1)}
          onMove={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
