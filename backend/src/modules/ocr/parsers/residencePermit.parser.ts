import { ParsedResidencePermit } from "./types";

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
      const sameLine = line.replace(labels[0], "").trim();
      if (sameLine) return sameLine;
      const candidate = lines[i + 1] ?? "";
      return candidate.trim() || null;
    }
  }
  return null;
}

export function parseResidencePermit(text: string): ParsedResidencePermit {
  const normalized = normalize(text);
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  const documentNumber =
    fixDigits(normalized).match(/\b[A-Z]{2}\d{7}\b/)?.[0] ?? null;

  const fullName =
    extractAfterLabel(lines, [/NAME/i, /NOME/i]) ??
    normalized.match(/NAME\s*[:\-]?\s*([A-Z\s]+)/i)?.[1]?.trim() ??
    null;

  const residenceType =
    extractAfterLabel(lines, [/TYPE/i, /TIPO/i]) ??
    normalized.match(/TYPE\s*[:\-]?\s*([A-Z\s]+)/i)?.[1]?.trim() ??
    null;

  return {
    type: "TITULO_RESIDENCIA",
    documentNumber,
    fullName,
    residenceType,
  };
}
