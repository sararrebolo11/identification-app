import { prisma } from "../../prisma";

interface CreatePersonInput {
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  notes?: string;
  ownerId: string;
}

export async function createPerson(data: CreatePersonInput) {
  return prisma.person.create({
    data: {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : undefined,
      phone: data.phone,
      address: data.address,
      postalCode: data.postalCode,
      notes: data.notes,
      ownerId: data.ownerId,
    },
  });
}

export async function listPersons(filters: {
  name?: string;
  dateOfBirth?: string;
  ownerId: string;
}) {
  return prisma.person.findMany({
    where: {
      fullName: filters?.name
        ? { contains: filters.name, mode: "insensitive" }
        : undefined,
      dateOfBirth: filters?.dateOfBirth
        ? new Date(filters.dateOfBirth)
        : undefined,
      ownerId: filters.ownerId,
    },
    include: {
      documents: true,
    },
  });
}

export async function getPersonById(id: string) {
  return prisma.person.findUnique({
    where: { id },
    include: { documents: true },
  });
}

export async function updatePerson(
  id: string,
  data: {
    fullName?: string;
    dateOfBirth?: string | null;
    cc?: string | null;
    nif?: string | null;
    phone?: string | null;
    address?: string | null;
    postalCode?: string | null;
    notes?: string | null;
  }
) {
  return prisma.person.update({
    where: { id },
    data: {
      fullName: data.fullName,
      dateOfBirth:
        data.dateOfBirth === undefined
          ? undefined
          : data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : null,
      cc: data.cc === undefined ? undefined : data.cc,
      nif: data.nif === undefined ? undefined : data.nif,
      phone: data.phone,
      address: data.address,
      postalCode: data.postalCode,
      notes: data.notes,
    },
  });
}

export async function deletePerson(id: string) {
  return prisma.person.delete({
    where: { id },
  });
}
