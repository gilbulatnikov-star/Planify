import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXTS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
    }

    const ext = ("." + (file.name.split(".").pop() ?? "")).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: "ניתן להעלות PDF, JPG, PNG בלבד" },
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
