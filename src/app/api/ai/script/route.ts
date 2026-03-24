import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_CONTENT_LEN = 50_000;
const MAX_INSTRUCTION_LEN = 5_000;
const MAX_MESSAGES = 50;

const SYSTEM_PROMPT = `אתה עוזר כתיבת תסריטי וידאו ברמה עולמית. אתה עוזר למשתמש לכתוב, לשפר ולייעץ על תסריטים לYouTube, TikTok, Instagram Reels, פודקאסטים ווידאו מסחרי.

סגנון התקשורת שלך:
- טבעי, אנושי ושיחתי — כמו שיחה עם עמית קריאטיבי מנוסה
- ישיר ובטוח — לא מסובב, לא מחמיא לשווא
- קצר כשאפשר — לא מרצה, מדבר
- מותאם פלטפורמה: יודע ש-TikTok שונה מ-YouTube

כשהמשתמש מבקש לשנות / לשפר / לערוך את התסריט — ענה בפורמט הבא בדיוק:
SCRIPT_UPDATE
[התסריט המלא המעודכן כאן]
END_SCRIPT
[משפט קצר אחד המתאר מה שינית — למשל: "חידדתי את ההוק וקיצרתי את הגוף"]

כשהמשתמש שואל שאלה שאינה דורשת שינוי בתסריט — ענה ישר, ללא הפורמט הזה.
תמיד תענה בעברית אלא אם המשתמש כותב באנגלית.
לעולם אל תגיד "בוודאי!", "כמובן!" או כל פתיח רובוטי.`;

type ChatMessage = { role: "user" | "assistant"; text: string };

async function callOpenRouter(messages: { role: string; content: string }[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "https://planify.app",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages,
      max_tokens: 2048,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    throw new Error("AI service unavailable");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mode, content, instruction, platform, duration, messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured" },
        { status: 500 }
      );
    }

    // Input length validation
    if (content && typeof content === "string" && content.length > MAX_CONTENT_LEN) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }
    if (instruction && typeof instruction === "string" && instruction.length > MAX_INSTRUCTION_LEN) {
      return NextResponse.json({ error: "Instruction too long" }, { status: 400 });
    }
    if (messages && Array.isArray(messages) && messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: "Too many messages" }, { status: 400 });
    }

    if (mode === "chat") {
      const contextNote = content?.trim()
        ? `[התסריט הנוכחי של המשתמש:\n${content}\n---]\n`
        : "";

      const history = (messages as ChatMessage[]).slice(-MAX_MESSAGES).map((m, i) => ({
        role: m.role,
        content:
          i === messages.length - 1 && m.role === "user"
            ? contextNote + m.text
            : m.text,
      }));

      const raw = await callOpenRouter([
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ]);

      const scriptMatch = raw.match(/SCRIPT_UPDATE\n([\s\S]*?)\nEND_SCRIPT\n?([\s\S]*)/);
      if (scriptMatch) {
        return NextResponse.json({
          updatedScript: scriptMatch[1].trim(),
          result: scriptMatch[2].trim() || "עדכנתי את התסריט",
        });
      }

      return NextResponse.json({ result: raw });
    }

    let userMessage = "";

    if (mode === "generate") {
      const safeInstruction = (instruction ?? "").slice(0, MAX_INSTRUCTION_LEN);
      const safePlatform = (platform ?? "YouTube").slice(0, 50);
      userMessage = `כתוב לי תסריט וידאו על הנושא הבא: "${safeInstruction}"
פלטפורמה: ${safePlatform}
${duration ? `אורך: ${String(duration).slice(0, 20)}` : ""}

תן לי תסריט מלא עם: ✦ הוק פותח חזק ✦ גוף עניין ✦ סיום עם קריאה לפעולה.
פרמט: כתוב את התסריט ישר, ללא הסברים מיותרים.`;
    } else if (mode === "upgrade") {
      const safeContent = (content ?? "").slice(0, MAX_CONTENT_LEN);
      userMessage = `שדרג לי את התסריט הזה. שפר: ✦ ההוק (10 השניות הראשונות) ✦ הפייסינג ✦ הנוסח — שיהיה יותר טבעי ואנושי.

התסריט הנוכחי:
${safeContent}

החזר לי רק את התסריט המשודרג, ללא הסברים.`;
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    let result = await callOpenRouter([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);

    const upgradeMatch = result.match(/SCRIPT_UPDATE\n([\s\S]*?)\nEND_SCRIPT/);
    if (upgradeMatch) result = upgradeMatch[1].trim();

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI script error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
