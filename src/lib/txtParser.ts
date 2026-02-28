"use client";

export type ParsedTxt = {
  text: string;
  encoding: string;
};

function hasUtf8Bom(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
}

function hasUtf16LeBom(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe;
}

function hasUtf16BeBom(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff;
}

function looksLikeUtf16Le(bytes: Uint8Array): boolean {
  const sample = Math.min(bytes.length, 4000);
  if (sample < 8) return false;

  let zeroOdd = 0;
  let checked = 0;
  for (let i = 1; i < sample; i += 2) {
    if (bytes[i] === 0) zeroOdd++;
    checked++;
  }

  return checked > 0 && zeroOdd / checked > 0.35;
}

function looksLikeUtf16Be(bytes: Uint8Array): boolean {
  const sample = Math.min(bytes.length, 4000);
  if (sample < 8) return false;

  let zeroEven = 0;
  let checked = 0;
  for (let i = 0; i < sample; i += 2) {
    if (bytes[i] === 0) zeroEven++;
    checked++;
  }

  return checked > 0 && zeroEven / checked > 0.35;
}

function decode(bytes: Uint8Array, encoding: string, fatal = false): string {
  return new TextDecoder(encoding, { fatal }).decode(bytes);
}

export async function parseTxt(file: File): Promise<ParsedTxt> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (hasUtf8Bom(bytes)) {
    return { text: decode(bytes, "utf-8"), encoding: "utf-8-bom" };
  }

  if (hasUtf16LeBom(bytes)) {
    return { text: decode(bytes, "utf-16le"), encoding: "utf-16le-bom" };
  }

  if (hasUtf16BeBom(bytes)) {
    return { text: decode(bytes, "utf-16be"), encoding: "utf-16be-bom" };
  }

  try {
    return { text: decode(bytes, "utf-8", true), encoding: "utf-8" };
  } catch {
    // Fallback handled below.
  }

  if (looksLikeUtf16Le(bytes)) {
    return { text: decode(bytes, "utf-16le"), encoding: "utf-16le" };
  }

  if (looksLikeUtf16Be(bytes)) {
    return { text: decode(bytes, "utf-16be"), encoding: "utf-16be" };
  }

  return { text: decode(bytes, "windows-1252"), encoding: "windows-1252" };
}
