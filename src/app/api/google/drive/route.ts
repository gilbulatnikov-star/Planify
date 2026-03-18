/**
 * Google Drive API Route
 *
 * Handles folder creation and file uploads to Google Drive.
 *
 * ── SETUP TO ENABLE ────────────────────────────────────────────────────────
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable "Google Drive API" on your project
 * 3. Create OAuth2 credentials (same as Google Calendar if already created)
 *    - Add scope: https://www.googleapis.com/auth/drive.file
 * 4. Add to .env:
 *    GOOGLE_CLIENT_ID=your_client_id
 *    GOOGLE_CLIENT_SECRET=your_client_secret
 *    GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
 *    GOOGLE_REFRESH_TOKEN=your_refresh_token  (from OAuth2 flow)
 *    GOOGLE_DRIVE_ROOT_FOLDER_ID=optional_parent_folder_id
 * 5. Install: npm install googleapis
 * ────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

// ── POST /api/google/drive ─────────────────────────────────────────────────
// Body: { action: "create_folder" | "upload_file", ... }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "Google Drive לא מוגדר. הוסף GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET ל-.env",
        setupRequired: true,
      },
      { status: 501 }
    );
  }

  try {
    // Full implementation using googleapis:
    // const { google } = await import("googleapis");
    // const auth = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URI
    // );
    // auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    // const drive = google.drive({ version: "v3", auth });

    if (action === "create_folder") {
      const { folderName, parentFolderId } = body;
      // const folder = await drive.files.create({
      //   requestBody: {
      //     name: folderName,
      //     mimeType: "application/vnd.google-apps.folder",
      //     parents: [parentFolderId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? "root"],
      //   },
      //   fields: "id, webViewLink",
      // });
      // return NextResponse.json({ folderId: folder.data.id, folderUrl: folder.data.webViewLink });

      void folderName; void parentFolderId;
      return NextResponse.json({ error: "Google Drive not yet authorized. Set GOOGLE_REFRESH_TOKEN." }, { status: 501 });
    }

    if (action === "upload_file") {
      const { fileName, fileBase64, mimeType, folderId } = body;
      // const media = { mimeType, body: Buffer.from(fileBase64, "base64") };
      // const file = await drive.files.create({
      //   requestBody: { name: fileName, parents: [folderId ?? "root"] },
      //   media,
      //   fields: "id, webViewLink",
      // });
      // return NextResponse.json({ fileId: file.data.id, fileUrl: file.data.webViewLink });

      void fileName; void fileBase64; void mimeType; void folderId;
      return NextResponse.json({ error: "Google Drive not yet authorized. Set GOOGLE_REFRESH_TOKEN." }, { status: 501 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google Drive error" },
      { status: 500 }
    );
  }
}
