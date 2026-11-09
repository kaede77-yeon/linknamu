import { NextResponse } from "next/server";
import { getClickCounts } from "@/lib/clicks";
import { links } from "@/data/profile";

export const dynamic = "force-dynamic";

// 모든 링크의 클릭 수를 한 번에 돌려준다
export async function GET() {
  try {
    const stored = await getClickCounts();
    const counts = Object.fromEntries(
      links.map((link) => [link.id, stored[link.id] ?? 0])
    );
    return NextResponse.json(
      { counts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("클릭 수 조회 실패", error);
    return NextResponse.json({ error: "클릭 수 조회 실패" }, { status: 500 });
  }
}
