import { createHash, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  AUTHOR_MAX,
  BODY_MAX,
  DEFAULT_AUTHOR,
  LEGACY_PASSWORD,
  MAX_DEPTH,
  PASSWORD_LENGTH,
  isValidPassword,
  type CommentItem,
} from "@/types/comment";

const COLLECTION = "comments";
const LIST_LIMIT = 500;

type CommentDoc = {
  _id: ObjectId;
  parentId: ObjectId | null;
  depth: number;
  author: string;
  body: string;
  createdAt: Date;
  updatedAt?: Date | null;
  /** 숫자 4자리 비밀번호의 해시. 기존 댓글에는 없다 (= 0000) */
  passwordHash?: string;
};

export class CommentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** 댓글 id를 섞어서 해시하므로 같은 비밀번호라도 저장값이 달라진다 */
function hashPassword(password: string, id: string) {
  return createHash("sha256").update(`linknamu:${id}:${password}`).digest("hex");
}

function assertPassword(doc: CommentDoc, password: unknown) {
  if (!isValidPassword(password)) {
    throw new CommentError(`비밀번호 ${PASSWORD_LENGTH}자리 숫자를 입력해 주세요`);
  }
  const id = doc._id.toHexString();
  // 비밀번호가 없던 기존 댓글은 0000으로 확인한다
  const expected = doc.passwordHash ?? hashPassword(LEGACY_PASSWORD, id);
  const actual = hashPassword(password, id);
  const ok =
    expected.length === actual.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  if (!ok) {
    throw new CommentError("비밀번호가 맞지 않습니다", 403);
  }
}

function assertBody(value: unknown): string {
  const body = typeof value === "string" ? value.trim() : "";
  if (!body) {
    throw new CommentError("댓글 내용을 입력해 주세요");
  }
  if (body.length > BODY_MAX) {
    throw new CommentError(`댓글은 ${BODY_MAX}자까지 쓸 수 있습니다`);
  }
  return body;
}

function toItem(doc: CommentDoc): CommentItem {
  return {
    id: doc._id.toHexString(),
    parentId: doc.parentId ? doc.parentId.toHexString() : null,
    depth: doc.depth,
    author: doc.author,
    body: doc.body,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new CommentError("댓글 기능을 사용할 수 없습니다", 503);
  }
  return db;
}

async function requireComment(id: unknown) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new CommentError("댓글을 찾을 수 없습니다", 404);
  }
  const db = await requireDb();
  const collection = db.collection<CommentDoc>(COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) {
    throw new CommentError("댓글을 찾을 수 없습니다", 404);
  }
  return { collection, doc };
}

export async function listComments(): Promise<CommentItem[]> {
  const db = await requireDb();
  const docs = await db
    .collection<CommentDoc>(COLLECTION)
    .find({})
    .sort({ createdAt: 1 })
    .limit(LIST_LIMIT)
    .toArray();

  return docs.map(toItem);
}

export async function createComment(input: {
  author?: unknown;
  body?: unknown;
  parentId?: unknown;
  password?: unknown;
}): Promise<CommentItem> {
  const body = assertBody(input.body);

  if (!isValidPassword(input.password)) {
    throw new CommentError(
      `수정·삭제에 쓸 비밀번호 ${PASSWORD_LENGTH}자리 숫자를 입력해 주세요`
    );
  }

  const rawAuthor = typeof input.author === "string" ? input.author.trim() : "";
  const author = (rawAuthor || DEFAULT_AUTHOR).slice(0, AUTHOR_MAX);

  const db = await requireDb();
  const collection = db.collection<CommentDoc>(COLLECTION);

  let parentId: ObjectId | null = null;
  let depth = 0;

  if (input.parentId != null && input.parentId !== "") {
    if (typeof input.parentId !== "string" || !ObjectId.isValid(input.parentId)) {
      throw new CommentError("답글을 달 댓글을 찾을 수 없습니다", 404);
    }
    const parent = await collection.findOne({ _id: new ObjectId(input.parentId) });
    if (!parent) {
      throw new CommentError("답글을 달 댓글을 찾을 수 없습니다", 404);
    }
    if (parent.depth >= MAX_DEPTH) {
      throw new CommentError(`답글은 ${MAX_DEPTH}번까지만 달 수 있습니다`);
    }
    parentId = parent._id;
    depth = parent.depth + 1;
  }

  const id = new ObjectId();
  const doc: CommentDoc = {
    _id: id,
    parentId,
    depth,
    author,
    body,
    createdAt: new Date(),
    updatedAt: null,
    passwordHash: hashPassword(input.password, id.toHexString()),
  };

  await collection.insertOne(doc);
  return toItem(doc);
}

/** 비밀번호를 확인하고 내용을 고친다 */
export async function updateComment(
  id: unknown,
  input: { body?: unknown; password?: unknown }
): Promise<CommentItem> {
  const { collection, doc } = await requireComment(id);
  assertPassword(doc, input.password);

  const body = assertBody(input.body);
  const updatedAt = new Date();
  await collection.updateOne({ _id: doc._id }, { $set: { body, updatedAt } });

  return toItem({ ...doc, body, updatedAt });
}

/** 비밀번호를 확인하고 댓글과 그 아래 답글까지 지운다. 지워진 id 목록을 돌려준다 */
export async function deleteComment(
  id: unknown,
  password: unknown
): Promise<string[]> {
  const { collection, doc } = await requireComment(id);
  assertPassword(doc, password);

  // 자식 답글을 따라 내려가며 지울 대상을 모은다
  const ids = [doc._id];
  let frontier = [doc._id];
  for (let level = doc.depth; level < MAX_DEPTH && frontier.length > 0; level += 1) {
    const children = await collection
      .find({ parentId: { $in: frontier } }, { projection: { _id: 1 } })
      .toArray();
    frontier = children.map((child) => child._id);
    ids.push(...frontier);
  }

  await collection.deleteMany({ _id: { $in: ids } });
  return ids.map((value) => value.toHexString());
}
