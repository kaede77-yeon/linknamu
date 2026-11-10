import { NextResponse } from "next/server";
import { CommentError, deleteComment, updateComment } from "@/lib/comments";

export const dynamic = "force-dynamic";

type Context = { params: { id: string } };

function fail(error: unknown, fallback: string) {
  if (error instanceof CommentError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const payload = await request.json().catch(() => ({}));
    const comment = await updateComment(params.id, {
      body: payload?.body,
      password: payload?.password,
    });
    return NextResponse.json({ comment });
  } catch (error) {
    return fail(error, "댓글을 수정하지 못했습니다");
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const payload = await request.json().catch(() => ({}));
    const deletedIds = await deleteComment(params.id, payload?.password);
    return NextResponse.json({ deletedIds });
  } catch (error) {
    return fail(error, "댓글을 삭제하지 못했습니다");
  }
}
