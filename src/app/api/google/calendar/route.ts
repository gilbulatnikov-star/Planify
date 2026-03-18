/**
 * Google Calendar API Route
 *
 * This route handles full OAuth2 synchronization with Google Calendar.
 * Currently wired for the quick-add URL approach (no auth required).
 * To enable full API sync, follow the setup steps below.
 *
 * ── SETUP TO ENABLE FULL SYNC ──────────────────────────────────────────────
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project → Enable "Google Calendar API"
 * 3. Create OAuth2 credentials (Web application)
 *    - Authorized redirect URI: http://localhost:3000/api/google/callback
 * 4. Add to .env:
 *    GOOGLE_CLIENT_ID=your_client_id
 *    GOOGLE_CLIENT_SECRET=your_client_secret
 *    GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
 * 5. Install: npm install googleapis
 * ────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

// ── Quick-add URL builder (no auth required) ──────────────────────────────
// Used by the frontend buttons. Generates a Google Calendar "add event" URL.
export function buildGoogleCalendarUrl({
  title,
  startDate,
  endDate,
  description,
  location,
}: {
  title: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  location?: string;
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0];
  const end = endDate ?? new Date(startDate.getTime() + 3600000); // +1 hour
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(startDate)}/${fmt(end)}`,
    ...(description ? { details: description } : {}),
    ...(location ? { location } : {}),
    sf: "true",
    output: "xml",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── POST /api/google/calendar ─────────────────────────────────────────────
// Full API sync endpoint — requires OAuth2 setup (see above).
export async function POST(req: NextRequest) {
  const { title, startDate, endDate, description, calendarId = "primary" } = await req.json();

  // Check for required Google credentials
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    // Fallback: return a quick-add URL the frontend can open
    const url = buildGoogleCalendarUrl({
      title,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      description,
    });
    return NextResponse.json({ quickAddUrl: url, mode: "quick_add" });
  }

  try {
    // Full API sync using googleapis (install with: npm install googleapis)
    // const { google } = await import("googleapis");
    // const auth = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URI
    // );
    // auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    // const calendar = google.calendar({ version: "v3", auth });
    // const event = await calendar.events.insert({
    //   calendarId,
    //   requestBody: {
    //     summary: title,
    //     description,
    //     start: { dateTime: new Date(startDate).toISOString() },
    //     end: { dateTime: new Date(endDate ?? startDate).toISOString() },
    //   },
    // });
    // return NextResponse.json({ eventId: event.data.id, htmlLink: event.data.htmlLink });

    return NextResponse.json(
      { error: "Full API sync not yet configured. Set GOOGLE_REFRESH_TOKEN to enable." },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google Calendar error" },
      { status: 500 }
    );
  }

  void calendarId; // suppress unused warning until full sync is enabled
}
