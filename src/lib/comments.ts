import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  AUTHOR_MAX,
  BODY_MAX,
  DEFAULT_AUTHOR,
  MAX_DEPTH,
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
};

export class CommentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function toItem(doc: CommentDoc): CommentItem {
  return {
    id: doc._id.toHexString(),
    parentId: doc.parentId ? doc.parentId.toHexString() : null,
    depth: doc.depth,
    author: doc.author,
    body: doc.body,
    createdAt: doc.createdAt.toISOString(),
  };
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new CommentError("댓글 기능을 사용할 수 없습니다", 503);
  }
  return db;
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
}): Promise<CommentItem> {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) {
    throw new CommentError("댓글 내용을 입력해 주세요");
  }
  if (body.length > BODY_MAX) {
    throw new CommentError(`댓글은 ${BODY_MAX}자까지 쓸 수 있습니다`);
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

  const doc: CommentDoc = {
    _id: new ObjectId(),
    parentId,
    depth,
    author,
    body,
    createdAt: new Date(),
  };

  await collection.insertOne(doc);
  return toItem(doc);
}
