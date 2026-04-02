import crypto from "crypto";

// In-process one-time tokens for admin impersonation (TTL 60s)
const tokens = new Map<string, { userId: string; expiresAt: number }>();

export function createToken(userId: string): string {
  const now = Date.now();
  // Clean expired
  for (const [t, v] of tokens) {
    if (v.expiresAt < now) tokens.delete(t);
  }
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { userId, expiresAt: now + 60_000 });
  return token;
}

export function consumeToken(token: string): string | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  tokens.delete(token);
  return entry.userId;
}
