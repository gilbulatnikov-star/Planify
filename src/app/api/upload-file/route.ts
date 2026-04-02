import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";

const ALLOWED_EXTS  = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = ("." + (file.name.split(".").pop() ?? "")).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: "ניתן להעלות PDF, JPG, PNG, WEBP בלבד" },
        { status: 400 },
      );
    }

    const fileName = `${randomUUID()}${ext}`;
    const filePath = join(process.cwd(), "public", "uploads", fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ fileUrl: `/uploads/${fileName}`, fileName: file.name });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "שגיאה בהעלאה" },
      { status: 500 },
    );
  }
}
