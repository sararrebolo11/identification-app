import { ParsedDocument } from "../document.factory";
import { ParsedCitizenCard } from "./types";

export function isParsedCitizenCard(
  parsed: ParsedDocument
): parsed is ParsedCitizenCard {
  return parsed.type === "CARTAO_CIDADAO";
}
