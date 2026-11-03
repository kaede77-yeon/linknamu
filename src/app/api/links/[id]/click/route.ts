import { NextResponse } from "next/server";
import { incrementClick } from "@/lib/clicks";
import { links } from "@/data/profile";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!links.some((link) => link.id === params.id)) {
    return NextResponse.json({ error: "unknown link" }, { status: 404 });
  }

  try {
    const count = await incrementClick(params.id);
    return NextResponse.json({ id: params.id, count });
  } catch (error) {
    console.error("클릭 수 집계 실패", error);
    return NextResponse.json({ id: params.id, count: null });
  }
}
