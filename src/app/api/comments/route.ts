import { NextResponse } from "next/server";
import { CommentError, createComment, listComments } from "@/lib/comments";

export const dynamic = "force-dynamic";

function fail(error: unknown, fallback: string) {
  if (error instanceof CommentError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    const comments = await listComments();
    return NextResponse.json(
      { comments },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return fail(error, "댓글을 불러오지 못했습니다");
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const comment = await createComment({
      author: payload?.author,
      body: payload?.body,
      parentId: payload?.parentId,
      password: payload?.password,
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return fail(error, "댓글을 저장하지 못했습니다");
  }
}
