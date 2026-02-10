export type DocumentType =
  | "CARTAO_CIDADAO"
  | "CARTA_CONDUCAO"
  | "TITULO_RESIDENCIA"
  | "PASSAPORTE";

export type Document = {
  id?: string;
  type: DocumentType;
  documentNumber: string;
  nationality?: string | null;
  nif?: string | null;
  drivingCategories?: string | null;
  residenceType?: string | null;
  placeOfBirth?: string | null;
};

export type ParsedCitizenCard = {
  type: "CARTAO_CIDADAO";
  fullName?: string | null;
  documentNumber?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  nif?: string | null;
};

export type Person = {
  id: string;
  fullName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  nif?: string | null;
  cc?: string | null;
  documents?: Document[];
};
