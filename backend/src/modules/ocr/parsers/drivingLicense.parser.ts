import { ParsedDrivingLicense } from "./types";

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

export function parseDrivingLicense(
  frontText: string,
  backText: string
): ParsedDrivingLicense {
  const front = normalize(frontText);
  const back = normalize(backText);

  const frontLines = front
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);
  const backLines = back
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  /* =======================
     NOME (1.) — FRENTE
     ======================= */
  const fullName =
    extractAfterLabel(frontLines, [/^1\./, /\bNOME\b/i]) ??
    front.match(/\b1\.?\s*([A-ZÀ-Ú\s]{5,})\b/)?.[1]?.trim() ??
    null;

  /* =======================
     Nº CARTA (5.) — FRENTE
     ======================= */
  const documentNumber =
    fixDigits(front).match(/\b5\.?\s*(?:N[ºO0]\s*)?([A-Z0-9]{6,12})\b/)?.[1] ??
    extractAfterLabel(frontLines, [/^5\./])?.match(/[A-Z0-9]{6,12}/)?.[0] ??
    null;

  /* =======================
     CATEGORIAS (9.) — VERSO
     ======================= */
  const categoriesRaw =
    extractAfterLabel(backLines, [/^9\./, /CATEGORIAS?/i]) ??
    back.match(/\b9\.?\s*(?:CATEGORIAS?)?\s*([A-Z0-9,\s]+)/)?.[1] ??
    null;

  const categories = categoriesRaw
    ? (categoriesRaw.match(/\b[A-Z]{1,2}\d?\b/g) ?? [])
        .filter((c) => !/^CATEGORIAS?$/.test(c))
    : null;

  return {
    type: "CARTA_CONDUCAO",
    fullName,
    documentNumber,
    categories,
  };
}
