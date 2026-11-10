import { NextResponse } from "next/server";
import { GalleryError, deleteImages, listImages, saveImage } from "@/lib/gallery";
import { MAX_FILES_PER_UPLOAD } from "@/types/gallery";

export const dynamic = "force-dynamic";

function fail(error: unknown, fallback: string) {
  if (error instanceof GalleryError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    const images = await listImages();
    return NextResponse.json(
      { images },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return fail(error, "이미지를 불러오지 못했습니다");
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData().catch(() => null);
    if (!form) {
      throw new GalleryError("이미지를 다시 선택해 주세요");
    }

    const files = form
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      throw new GalleryError("올릴 이미지를 선택해 주세요");
    }
    if (files.length > MAX_FILES_PER_UPLOAD) {
      throw new GalleryError(
        `한 번에 ${MAX_FILES_PER_UPLOAD}장까지 올릴 수 있습니다`
      );
    }

    // 한 장이 막혀도 나머지는 올라가게 한다
    const images = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        images.push(await saveImage(file));
      } catch (error) {
        errors.push(
          error instanceof GalleryError ? error.message : "업로드에 실패했습니다"
        );
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: errors.join("\n") }, { status: 400 });
    }

    return NextResponse.json(
      { images, errors: errors.length > 0 ? errors : undefined },
      { status: 201 }
    );
  } catch (error) {
    return fail(error, "이미지를 올리지 못했습니다");
  }
}

/** 여러 장을 한 번에 지운다 */
export async function DELETE(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const deletedIds = await deleteImages(payload?.ids, payload?.password);
    return NextResponse.json({ deletedIds });
  } catch (error) {
    return fail(error, "이미지를 삭제하지 못했습니다");
  }
}
