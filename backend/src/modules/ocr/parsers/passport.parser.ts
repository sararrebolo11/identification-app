import { ParsedPassport } from "./types";

function normalize(text: string) {
  return text
    .replace(/[^\S\r\n]+/g, " ")
    .toUpperCase();
}

function fixDigits(text: string) {
  return text
    .replace(/O/g, "0")
    .replace(/I/g, "1");
}

function extractAfterLabel(lines: string[], labels: RegExp[]) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (labels.some((r) => r.test(line))) {
      // try same line first
      const sameLine = line.replace(labels[0], "").trim();
      if (sameLine) return sameLine;
      const candidate = lines[i + 1] ?? "";
      return candidate.trim() || null;
    }
  }
  return null;
}

export function parsePassport(text: string): ParsedPassport {
  const normalized = normalize(text);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  // número do passaporte: 6-9 alfanuméricos e com pelo menos 1 dígito
  const candidates =
    fixDigits(normalized).match(/\b[A-Z0-9]{6,9}\b/g) ?? [];
  const scored = candidates
    .filter((c) => !/^PASSP0RT$/.test(c) && !/^PASSPORT$/.test(c))
    .map((c) => {
      const digits = (c.match(/\d/g) ?? []).length;
      const letters = (c.match(/[A-Z]/g) ?? []).length;
      return { c, digits, letters };
    })
    .filter((x) => x.digits >= 3 && x.letters >= 1)
    .sort((a, b) => b.digits - a.digits);

  const documentNumber = scored[0]?.c ?? null;

  const issuingCountry =
    normalized.match(/PASSPORT\s+([A-Z]{3})/)?.[1] ?? null;

  const placeOfBirth =
    extractAfterLabel(lines, [/PLACE OF BIRTH/i, /LIEU DE NAISSANCE/i, /LOCAL DE NASCIMENTO/i]) ??
    normalized.match(/PLACE OF BIRTH\s*[:\-]?\s*([A-Z\s]+)/i)?.[1]?.trim() ??
    null;

  return {
    type: "PASSAPORTE",
    documentNumber,
    issuingCountry,
    placeOfBirth,
  };
}
