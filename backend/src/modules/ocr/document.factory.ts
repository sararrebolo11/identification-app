import { DocumentType } from "@prisma/client";

import { parseCitizenCard } from "./parsers/citizenCard.parser";
import { parsePassport } from "./parsers/passport.parser";
import { parseDrivingLicense } from "./parsers/drivingLicense.parser";
import { parseResidencePermit } from "./parsers/residencePermit.parser";

import {
  ParsedCitizenCard,
  ParsedPassport,
  ParsedDrivingLicense,
  ParsedResidencePermit,
} from "./parsers/types";

/**
 * Tipo de retorno possível do parsing
 */
export type ParsedDocument =
  | ParsedCitizenCard
  | ParsedPassport
  | ParsedDrivingLicense
  | ParsedResidencePermit;

/**
 * Factory responsável por escolher o parser correto
 */

export function parseDocument(
  type: DocumentType,
  frontText: string,
  backText?: string
): ParsedDocument {
  switch (type) {
    case DocumentType.CARTAO_CIDADAO:
      return parseCitizenCard(frontText, backText ?? "");

    case DocumentType.PASSAPORTE:
      return parsePassport(frontText);

    case DocumentType.CARTA_CONDUCAO:
      return parseDrivingLicense(frontText, backText ?? "");

    case DocumentType.TITULO_RESIDENCIA:
      return parseResidencePermit(frontText);

    default: {
      const exhaustiveCheck: never = type;
      throw new Error(
        `Parser não implementado para o tipo: ${exhaustiveCheck}`
      );
    }
  }
}