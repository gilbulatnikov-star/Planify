import { NextRequest, NextResponse } from "next/server";

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
      "HTTP-Referer": "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages,
      max_tokens: 2048,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { mode, content, instruction, platform, duration, messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "מפתח AI לא מוגדר — הוסף OPENROUTER_API_KEY ל-.env" },
        { status: 500 }
      );
    }

    if (mode === "chat") {
      const contextNote = content?.trim()
        ? `[התסריט הנוכחי של המשתמש:\n${content}\n---]\n`
        : "";

      const history = (messages as ChatMessage[]).map((m, i) => ({
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

      // Parse structured update response
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
      userMessage = `כתוב לי תסריט וידאו על הנושא הבא: "${instruction}"
פלטפורמה: ${platform || "YouTube"}
${duration ? `אורך: ${duration}` : ""}

תן לי תסריט מלא עם: ✦ הוק פותח חזק ✦ גוף עניין ✦ סיום עם קריאה לפעולה.
פרמט: כתוב את התסריט ישר, ללא הסברים מיותרים.`;
    } else if (mode === "upgrade") {
      userMessage = `שדרג לי את התסריט הזה. שפר: ✦ ההוק (10 השניות הראשונות) ✦ הפייסינג ✦ הנוסח — שיהיה יותר טבעי ואנושי.

התסריט הנוכחי:
${content}

החזר לי רק את התסריט המשודרג, ללא הסברים.`;
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    let result = await callOpenRouter([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);

    // Strip any SCRIPT_UPDATE/END_SCRIPT markers the AI may have included
    const upgradeMatch = result.match(/SCRIPT_UPDATE\n([\s\S]*?)\nEND_SCRIPT/);
    if (upgradeMatch) result = upgradeMatch[1].trim();

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI script error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
