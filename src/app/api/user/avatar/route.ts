import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/user/avatar
 * Serves the current user's avatar image from the DB.
 * Used when the image is stored as base64 (not a URL) so we avoid
 * putting large data in the JWT session cookie.
 */
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (!user?.image) {
    return new NextResponse(null, { status: 404 });
  }

  // If the image is a data URI (base64), extract and serve it as binary
  const dataUriMatch = user.image.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1];
    const buffer = Buffer.from(dataUriMatch[2], "base64");
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // If it's already a URL, redirect to it
  return NextResponse.redirect(user.image);
}
