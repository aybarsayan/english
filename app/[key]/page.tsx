import { timingSafeEqual } from "crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VoiceHome from "@/components/VoiceHome";

// Hidden route: /<UNLIMITED_KEY> opens the voice page without time limits.
// Any other single-segment path falls through to the normal 404 page.
const UNLIMITED_KEY = "UDFBbksN";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function isValidKey(key: string): boolean {
  const given = Buffer.from(key);
  const expected = Buffer.from(UNLIMITED_KEY);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export default async function UnlimitedHome({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isValidKey(key)) notFound();
  return <VoiceHome unlimited />;
}
