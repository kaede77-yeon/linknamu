import { NextResponse } from "next/server";
import { GalleryError, readImage } from "@/lib/gallery";

export const dynamic = "force-dynamic";

type Context = { params: { id: string } };

/** 이미지 원본을 돌려준다. ?download=1이면 내려받기로 처리 */
export async function GET(request: Request, { params }: Context) {
  try {
    const { image, bytes } = await readImage(params.id);
    const download = new URL(request.url).searchParams.get("download") === "1";

    const headers = new Headers({
      "Content-Type": image.contentType,
      "Content-Length": String(bytes.length),
      // GridFS id는 바뀌지 않으므로 오래 캐시해도 된다
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    if (download) {
      headers.set(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(image.name)}`
      );
    }

    return new NextResponse(new Uint8Array(bytes), { headers });
  } catch (error) {
    if (error instanceof GalleryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("이미지를 불러오지 못했습니다", error);
    return NextResponse.json(
      { error: "이미지를 불러오지 못했습니다" },
      { status: 500 }
    );
  }
}
