import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

// Creates a signed JWT valid for 60 seconds, containing just the userId
export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(SECRET);
}

// Verifies + decodes the token, returns userId or null
export async function consumeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.userId as string) ?? null;
  } catch {
    return null;
  }
}
