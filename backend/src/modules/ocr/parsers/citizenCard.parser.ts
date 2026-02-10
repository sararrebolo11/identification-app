import { ParsedCitizenCard } from "./types";

/* =======================
   HELPERS
   ======================= */
function normalize(text: string) {
  return text
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/0(?=[A-Z])/g, "O")
    .replace(/1(?=[A-Z])/g, "I")
    .toUpperCase();
}

function fixOcrDigits(text: string) {
  return text
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/B/g, "8")
    .replace(/Z/g, "2");
}

function normalizeDate(d: string) {
  const [day, month, year] = d.split(/[\/\-]/);
  return `${year}-${month}-${day}`;
}

function isValidNif(nif: string) {
  if (!/^\d{9}$/.test(nif)) return false;
  return true;
}

function extractDateNearLabel(
  lines: string[],
  labels: RegExp[]
): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (labels.some((r) => r.test(line))) {
      const candidate = lines[i + 1] ?? "";
      const m = candidate.match(/\b(\d{2})[\/\-\s](\d{2})[\/\-\s](\d{4})\b/);
      if (m) {
        return `${m[3]}-${m[2]}-${m[1]}`;
      }
    }
  }
  return null;
}

/* =======================
   MAIN PARSER
   ======================= */
export function parseCitizenCard(
  frontText: string,
  backText: string
): ParsedCitizenCard {
  
  const front = normalize(frontText);
  const back = normalize(backText);

  const frontLines = front
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);
  const backLines = back
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  /* =======================
   NOME COMPLETO (POR CONTEXTO)
   ======================= */

  function cleanNameLine(line: string) {
    return line
      .replace(/[^A-ZÀ-Ü\s]/g, " ") // remove lixo OCR
      .replace(/\s+/g, " ")
      .trim();
  }

let firstNames: string | null = null;
let surnames: string | null = null;

for (let i = 0; i < frontLines.length; i++) {
  const line = frontLines[i];

  // APELIDOS
  if (/APELIDO/i.test(line) && frontLines[i + 1]) {
    surnames = cleanNameLine(frontLines[i + 1]);
  }

  // NOME PRÓPRIO
  if (/NOME/i.test(line) && frontLines[i + 1]) {
    firstNames = cleanNameLine(frontLines[i + 1]);
  }
}

const fullName =
  firstNames && surnames
    ? `${firstNames} ${surnames}`
    : firstNames ?? surnames ?? null;

  /* =======================
     Nº CARTÃO DE CIDADÃO
     ======================= */
  const ccRegex = /\b\d{8}\b/;

  /* =======================
   DATA DE NASCIMENTO (REAL OCR)
   ======================= */

// normaliza dígitos primeiro
  const frontFixed = fixOcrDigits(front);
  const backFixed = fixOcrDigits(back);

  const documentNumber =
    frontFixed.match(ccRegex)?.[0].replace(/\s+/g, "") ?? null;

// aceita datas com espaços
  const dateFromLabel = extractDateNearLabel(frontLines, [
    /DATA\s+DE\s+NASC/i,
    /NASCIMENTO/i,
  ]);

  const dateRegex = /\b(\d{2})\s(\d{2})\s(\d{4})\b/g;
  const matches = [...frontFixed.matchAll(dateRegex)];

  const birthMatch =
    matches
      .map((m) => ({
        day: m[1],
        month: m[2],
        year: Number(m[3]),
      }))
      .filter((d) => d.year > 1900 && d.year < 2015)
      .sort((a, b) => a.year - b.year)[0] ?? null;

  const dateOfBirth =
    dateFromLabel ??
    (birthMatch
      ? `${birthMatch.year}-${birthMatch.month}-${birthMatch.day}`
      : null);

  /* =======================
     NIF
     ======================= */
  const nifRegex = /\b[1235689]\d{8}\b/g;
  const nifCandidate =
    backFixed.match(nifRegex)?.[0] ??
    frontFixed.match(nifRegex)?.[0] ??
    null;
  const nif =
    nifCandidate && isValidNif(nifCandidate)
      ? nifCandidate
      : null;

  /* =======================
     RESULTADO FINAL
     ======================= */
     
  return {
    type: "CARTAO_CIDADAO",
    fullName,
    documentNumber,
    dateOfBirth,
    nif,
    nationality: "PRT",
  };
}
