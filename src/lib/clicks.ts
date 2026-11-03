import { getDb } from "./mongodb";

const COLLECTION = "clicks";

export async function incrementClick(linkId: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .collection<{ _id: string; count: number }>(COLLECTION)
    .findOneAndUpdate(
      { _id: linkId },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

  return result?.count ?? null;
}

export async function getClickCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  if (!db) return {};

  const docs = await db
    .collection<{ _id: string; count: number }>(COLLECTION)
    .find({})
    .toArray();

  return Object.fromEntries(docs.map((doc) => [doc._id, doc.count]));
}
