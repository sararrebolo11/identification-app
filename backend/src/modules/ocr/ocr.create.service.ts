import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

type CreateCitizenCardInput = {
  ownerId: string;

  // Pessoa
  fullName: string;
  dateOfBirth?: string | null;
  nif?: string | null;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  notes?: string | null;

  // Documento
  documentNumber: string;
  nationality?: string | null;
};

export async function createFromCitizenCard(
  input: CreateCitizenCardInput
) {
  return prisma.$transaction(async (tx) => {
    /* =======================
       VERIFICAR DUPLICADO
       ======================= */
    const existingDocument = await tx.document.findFirst({
      where: {
        type: "CARTAO_CIDADAO",
        documentNumber: input.documentNumber,
        ownerId: input.ownerId,
      },
      include: {
        person: true,
      },
    });

    if (existingDocument) {
      const error = new Error("DOCUMENT_ALREADY_EXISTS");
      throw error;
    }

    /* =======================
       CRIAR PESSOA
       ======================= */
    const person = await tx.person.create({
      data: {
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth
          ? new Date(input.dateOfBirth)
          : null,
        nif: input.nif ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        postalCode: input.postalCode ?? null,
        notes: input.notes ?? null,

        ownerId: input.ownerId,
      },
    });

    /* =======================
       CRIAR DOCUMENTO
       ======================= */
    const document = await tx.document.create({
      data: {
        type: "CARTAO_CIDADAO",
        documentNumber: input.documentNumber,
        nationality: input.nationality ?? "PRT",
        personId: person.id,
        ownerId: input.ownerId,
      },
    });

    return { person, document };
  });
}
