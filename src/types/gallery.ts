// 서버·클라이언트가 함께 쓰는 갤러리 타입 (여기서는 mongodb를 import 하지 않는다)

/** 한 장당 최대 용량 */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
/** 한 번에 올릴 수 있는 장수 */
export const MAX_FILES_PER_UPLOAD = 10;

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

export type GalleryImage = {
  id: string;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: string; // ISO 문자열
};

export function imageUrl(id: string) {
  return `/api/gallery/${id}`;
}

export function downloadUrl(id: string) {
  return `/api/gallery/${id}?download=1`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
