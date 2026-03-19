import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTS = [".pdf", ".jpg", ".jpeg", ".png"];

const SYSTEM_PROMPT = `You are a strict financial document analyzer. Your job is to extract data from Israeli invoices, receipts, and financial documents.

FIRST: Determine if this is a valid financial/accounting document (invoice, receipt, bill, tax invoice, קבלה, חשבונית מס).
- Valid: invoices, receipts, bills, payment confirmations, tax documents
- INVALID: selfies, landscape photos, screenshots of non-financial content, ID cards, personal photos, menus without totals

Return ONLY a valid JSON object (no markdown, no code blocks, just raw JSON):

If NOT a valid financial document:
{"isValidDocument": false}

If IS a valid financial document:
{
  "isValidDocument": true,
  "type": "Expense",
  "vendorName": "business name here",
  "date": "YYYY-MM-DD",
  "totalAmount": 1500,
  "description": "תיאור קצר 3-4 מילים בעברית"
}

Rules for the fields:
- "type": "Expense" if it's a receipt/bill FROM a vendor (camera store, gas, services received). "Income" if it's an invoice Gil Productions issued TO a client.
- "vendorName": the supplier/business name in the document
- "date": document date in YYYY-MM-DD format. Use today if not found.
- "totalAmount": the final total amount as a plain number (no ₪ symbol, no commas). E.g. 1500.00
- "description": 3-4 Hebrew words summarizing what was purchased/billed`;

async function callVisionModel(base64Image: string, mimeType: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            { type: "text", text: "Analyze this document and return the JSON." },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callTextModel(text: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the extracted text from a PDF document. Analyze it and return the JSON.\n\n${text.slice(0, 4000)}`,
        },
      ],
      max_tokens: 512,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseAIResponse(raw: string): Record<string, unknown> {
  // Strip markdown code blocks if present
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Find first { ... } block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in AI response");
  return JSON.parse(match[0]);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
    }

    // Strict file type validation
    const ext = ("." + (file.name.split(".").pop() ?? "")).toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: "סוג קובץ לא נתמך. ניתן להעלות PDF, JPG, JPEG, PNG בלבד." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "מפתח AI לא מוגדר" }, { status: 500 });
    }

    // Save file to disk
    const fileName = `${randomUUID()}${ext}`;
    const filePath = join(process.cwd(), "public", "uploads", fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    // Call AI based on file type
    let rawAI: string;

    if (file.type === "application/pdf") {
      // Try text extraction first (works for digital PDFs)
      let pdfText = "";
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfMod: any = await import("pdf-parse");
        const pdfParse = pdfMod.default ?? pdfMod;
        const pdfData = await pdfParse(buffer);
        pdfText = pdfData.text;
      } catch {
        // pdf-parse failed — will fall back to vision model
      }

      if (pdfText.trim()) {
        // Digital PDF — use text model
        rawAI = await callTextModel(pdfText);
      } else {
        // Scanned/image PDF — send as base64 to vision model (Gemini supports PDF)
        const base64 = buffer.toString("base64");
        rawAI = await callVisionModel(base64, "application/pdf");
      }
    } else {
      // Image — send as base64 to vision model
      const base64 = buffer.toString("base64");
      rawAI = await callVisionModel(base64, file.type);
    }

    // Parse AI JSON
    let parsed: Record<string, unknown>;
    try {
      parsed = parseAIResponse(rawAI);
    } catch {
      return NextResponse.json(
        { error: "ה-AI לא הצליח לנתח את המסמך. נסה שוב." },
        { status: 422 }
      );
    }

    // Document validation check
    if (!parsed.isValidDocument) {
      return NextResponse.json(
        { error: "נא להעלות מסמך חשבונאי בלבד", isInvalidDocument: true },
        { status: 422 }
      );
    }

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      isValidDocument: true,
      type: (parsed.type as string) === "Income" ? "invoice" : "expense",
      vendorName: parsed.vendorName ?? "",
      date: parsed.date ?? new Date().toISOString().split("T")[0],
      totalAmount: parsed.totalAmount ?? null,
      description: parsed.description ?? "",
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בהעלאת הקובץ" },
      { status: 500 }
    );
  }
}
