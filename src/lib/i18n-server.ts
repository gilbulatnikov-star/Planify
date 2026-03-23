import { auth } from "@/auth";
import { he } from "./he";
import { en } from "./en";

/** Server-side translation helper — reads locale from session */
export async function getT() {
  const session = await auth();
  const locale = session?.user?.locale ?? "he";
  return locale === "en" ? en : he;
}

/** Server-side locale getter */
export async function getLocale() {
  const session = await auth();
  return (session?.user?.locale ?? "he") as "he" | "en";
}
