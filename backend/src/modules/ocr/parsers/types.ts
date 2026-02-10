export interface ParsedDocumentBase {
  documentNumber: string | null;
}

/* ======================
   DOCUMENTOS
   ====================== */

export interface ParsedCitizenCard extends ParsedDocumentBase {
  type: "CARTAO_CIDADAO";
  fullName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  nif: string | null;
}

export interface ParsedPassport extends ParsedDocumentBase {
  type: "PASSAPORTE";
  issuingCountry: string | null;
  placeOfBirth: string | null;
}

export interface ParsedDrivingLicense extends ParsedDocumentBase {
  type: "CARTA_CONDUCAO";
  fullName: string | null;
  categories: string[] | null;
}

export interface ParsedResidencePermit extends ParsedDocumentBase {
  type: "TITULO_RESIDENCIA";
  fullName: string | null;
  residenceType: string | null;
}

/* ======================
   UNION FINAL
   ====================== */

export type ParsedDocument =
  | ParsedCitizenCard
  | ParsedPassport
  | ParsedDrivingLicense
  | ParsedResidencePermit;