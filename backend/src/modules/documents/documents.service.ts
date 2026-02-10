import { prisma } from "../../prisma";
import { DocumentType } from "@prisma/client";

export async function createDocument(data: {
  personId: string;
  ownerId: string;
  type: DocumentType;

  documentNumber: string;

  // 🔹 específicos (opcionais)
  nationality?: string | null;
  nif?: string | null;

  drivingCategories?: string | null;

  residenceType?: string | null;

  placeOfBirth?: string | null;
}) {
  return prisma.document.create({
    data: {
      personId: data.personId,
      ownerId: data.ownerId,
      type: data.type,

      documentNumber: data.documentNumber,

      nationality: data.nationality ?? null,
      nif: data.nif ?? null,

      drivingCategories: data.drivingCategories ?? null,

      residenceType: data.residenceType ?? null,

      placeOfBirth: data.placeOfBirth ?? null,
    },
  });
}

export async function listDocuments(filters?: {
  type?: DocumentType;
  documentNumber?: string;
  personId?: string;
  ownerId?: string;
}) {
  return prisma.document.findMany({
    where: {
      type: filters?.type,
      documentNumber: filters?.documentNumber,
      personId: filters?.personId,
      ownerId: filters?.ownerId,
    },
    include: {
      person: true,
    },
  });
}

export async function getDocumentById(id: string, ownerId?: string) {
  return prisma.document.findFirst({
    where: {
      id,
      ownerId: ownerId ?? undefined,
    },
    include: { person: true },
  });
}

export async function updateDocument(
  id: string,
  data: {
    documentNumber?: string;

    nationality?: string | null;
    nif?: string | null;

    drivingCategories?: string | null;

    residenceType?: string | null;

    placeOfBirth?: string | null;
  }
) {
  return prisma.document.update({
    where: { id },
    data: {
      documentNumber: data.documentNumber,

      nationality: data.nationality,
      nif: data.nif,

      drivingCategories: data.drivingCategories,

      residenceType: data.residenceType,

      placeOfBirth: data.placeOfBirth,
    },
  });
}
