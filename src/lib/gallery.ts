import { createHash, timingSafeEqual } from "crypto";
import { Readable } from "stream";
import { GridFSBucket, ObjectId, type Db } from "mongodb";
import { getDb } from "./mongodb";
import {
  ALLOWED_TYPES,
  MAX_FILE_BYTES,
  type GalleryImage,
} from "@/types/gallery";

const BUCKET = "gallery";
const LIST_LIMIT = 300;
const NAME_MAX = 120;

/** .env.local에 GALLERY_ADMIN_PASSWORD가 없으면 0000 */
const ADMIN_PASSWORD = process.env.GALLERY_ADMIN_PASSWORD ?? "0000";

export class GalleryError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type GalleryFileDoc = {
  _id: ObjectId;
  filename: string;
  length: number;
  uploadDate: Date;
  contentType?: string;
  metadata?: { contentType?: string } | null;
};

async function requireBucket(): Promise<{ db: Db; bucket: GridFSBucket }> {
  const db = await getDb();
  if (!db) {
    throw new GalleryError("갤러리 기능을 사용할 수 없습니다", 503);
  }
  return { db, bucket: new GridFSBucket(db, { bucketName: BUCKET }) };
}

function toImage(doc: GalleryFileDoc): GalleryImage {
  return {
    id: doc._id.toHexString(),
    name: doc.filename,
    contentType: doc.metadata?.contentType ?? doc.contentType ?? "image/jpeg",
    size: doc.length,
    uploadedAt: doc.uploadDate.toISOString(),
  };
}

/** 관리자 비밀번호 확인 (삭제할 때만 쓴다) */
export function assertAdminPassword(password: unknown) {
  if (typeof password !== "string" || password.length === 0) {
    throw new GalleryError("관리자 비밀번호를 입력해 주세요");
  }
  const expected = createHash("sha256").update(ADMIN_PASSWORD).digest();
  const actual = createHash("sha256").update(password).digest();
  if (!timingSafeEqual(expected, actual)) {
    throw new GalleryError("비밀번호가 맞지 않습니다", 403);
  }
}

export async function listImages(): Promise<GalleryImage[]> {
  const { bucket } = await requireBucket();
  const docs = (await bucket
    .find({})
    .sort({ uploadDate: -1 })
    .limit(LIST_LIMIT)
    .toArray()) as unknown as GalleryFileDoc[];
  return docs.map(toImage);
}

export async function saveImage(file: File): Promise<GalleryImage> {
  const contentType = file.type || "";
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new GalleryError(`${file.name || "이 파일"}은 지원하지 않는 형식입니다`);
  }
  if (file.size === 0) {
    throw new GalleryError(`${file.name || "이 파일"}이 비어 있습니다`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new GalleryError(
      `${file.name || "이 파일"}이 너무 큽니다 (한 장에 ${Math.round(
        MAX_FILE_BYTES / (1024 * 1024)
      )}MB까지)`
    );
  }

  const { bucket } = await requireBucket();
  const name = (file.name || "image").slice(0, NAME_MAX);
  const buffer = Buffer.from(await file.arrayBuffer());

  const id = new ObjectId();
  const upload = bucket.openUploadStreamWithId(id, name, {
    metadata: { contentType },
  });

  await new Promise<void>((resolve, reject) => {
    upload.once("error", reject);
    upload.once("finish", () => resolve());
    Readable.from(buffer).pipe(upload);
  });

  return {
    id: id.toHexString(),
    name,
    contentType,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
  };
}

export async function readImage(id: unknown): Promise<{
  image: GalleryImage;
  bytes: Buffer;
}> {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new GalleryError("이미지를 찾을 수 없습니다", 404);
  }
  const { bucket } = await requireBucket();
  const objectId = new ObjectId(id);
  const docs = (await bucket
    .find({ _id: objectId })
    .limit(1)
    .toArray()) as unknown as GalleryFileDoc[];
  const doc = docs[0];
  if (!doc) {
    throw new GalleryError("이미지를 찾을 수 없습니다", 404);
  }

  const chunks: Buffer[] = [];
  const stream = bucket.openDownloadStream(objectId);
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.once("error", reject);
    stream.once("end", () => resolve());
  });

  return { image: toImage(doc), bytes: Buffer.concat(chunks) };
}

export async function deleteImages(
  ids: unknown,
  password: unknown
): Promise<string[]> {
  assertAdminPassword(password);

  const list = Array.isArray(ids) ? ids : [ids];
  const objectIds = list.filter(
    (value): value is string => typeof value === "string" && ObjectId.isValid(value)
  );
  if (objectIds.length === 0) {
    throw new GalleryError("지울 이미지를 선택해 주세요");
  }

  const { bucket } = await requireBucket();
  const deleted: string[] = [];
  for (const value of objectIds) {
    try {
      await bucket.delete(new ObjectId(value));
      deleted.push(value);
    } catch {
      // 이미 지워진 이미지는 넘어간다
    }
  }

  if (deleted.length === 0) {
    throw new GalleryError("이미지를 찾을 수 없습니다", 404);
  }
  return deleted;
}
