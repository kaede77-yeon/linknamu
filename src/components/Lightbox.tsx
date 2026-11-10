"use client";

import { useCallback, useEffect } from "react";
import {
  downloadUrl,
  formatBytes,
  imageUrl,
  type GalleryImage,
} from "@/types/gallery";

type Props = {
  images: GalleryImage[];
  index: number;
  onMove: (index: number) => void;
  onClose: () => void;
};

/** 이미지를 크게 보는 전체 화면 보기 */
export default function Lightbox({ images, index, onMove, onClose }: Props) {
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const move = useCallback(
    (step: number) => {
      const next = index + step;
      if (next >= 0 && next < images.length) onMove(next);
    },
    [index, images.length, onMove]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }
    window.addEventListener("keydown", onKeyDown);
    // 뒤 배경이 스크롤되지 않게 막는다
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [move, onClose]);

  if (!image) return null;

  const roundButton =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-lg text-white backdrop-blur-md transition hover:bg-black/60 disabled:opacity-25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="min-w-0 truncate text-xs text-white/70">
          {image.name} · {formatBytes(image.size)}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={downloadUrl(image.id)}
            download={image.name}
            className="rounded-full border border-white/25 bg-black/40 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/60"
          >
            ⤓ 내려받기
          </a>
          <button type="button" onClick={onClose} className={roundButton} aria-label="닫기">
            ✕
          </button>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pb-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!hasPrev}
          aria-label="이전 이미지"
          className={roundButton}
        >
          ‹
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(image.id)}
          alt={image.name}
          className="max-h-full min-h-0 max-w-full rounded-2xl object-contain shadow-2xl"
        />
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!hasNext}
          aria-label="다음 이미지"
          className={roundButton}
        >
          ›
        </button>
      </div>

      <p className="pb-5 text-center text-[11px] tabular-nums text-white/50">
        {index + 1} / {images.length}
      </p>
    </div>
  );
}
