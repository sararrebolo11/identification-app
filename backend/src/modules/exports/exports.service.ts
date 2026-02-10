import ExcelJS from "exceljs";
import { prisma } from "../../prisma";

export async function exportPersonsToExcel(ownerId: string) {
  const persons = await prisma.person.findMany({
    include: {
      documents: true,
    },
    where: {
      ownerId,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pessoas");

  sheet.columns = [
    { header: "Nome", key: "fullName", width: 30 },
    { header: "Data Nascimento", key: "dateOfBirth", width: 15 },
    { header: "Telefone", key: "phone", width: 15 },
    { header: "Morada", key: "address", width: 30 },
    { header: "Código Postal", key: "postalCode", width: 15 },
    { header: "Tipo Documento", key: "docType", width: 20 },
    { header: "Nº Documento", key: "docNumber", width: 20 },
    { header: "País", key: "country", width: 10 },
    { header: "Observações", key: "notes", width: 30 },
  ];

  persons.forEach((person) => {
  // Caso a pessoa NÃO tenha documentos
  if (person.documents.length === 0) {
    sheet.addRow({
      fullName: person.fullName,
      dateOfBirth: person.dateOfBirth
        ? new Date(person.dateOfBirth).toISOString().split("T")[0]
        : "",
      phone: person.phone ?? "",
      address: person.address ?? "",
      postalCode: person.postalCode ?? "",
      docType: "",
      docNumber: "",
      country: "",
      notes: person.notes ?? "",
    });
  }

  // Caso a pessoa TENHA documentos
  person.documents.forEach((doc) => {
    sheet.addRow({
      fullName: person.fullName,
      dateOfBirth: person.dateOfBirth
        ? new Date(person.dateOfBirth).toISOString().split("T")[0]
        : "",
      phone: person.phone ?? "",
      address: person.address ?? "",
      postalCode: person.postalCode ?? "",
      docType: doc.type,
      docNumber: doc.documentNumber,
      notes: person.notes ?? "",
    });
  });
});

  return workbook;
}
