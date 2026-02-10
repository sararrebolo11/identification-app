import { Router, Request } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";
import { requireRole } from "../../middleware/role";
import {
  createDocument,
  listDocuments,
  getDocumentById,
  updateDocument,
} from "./documents.service";
import { prisma } from "../../prisma";
import { DocumentType } from "@prisma/client";
import { badRequest } from "../../utils/http";

const router = Router();

export const createDocumentSchema = z.object({
  personId: z.string().uuid(),
  type: z.nativeEnum(DocumentType),
  documentNumber: z.string().min(1),
  nationality: z.string().optional().nullable(),
  nif: z.string().regex(/^\d{9}$/).optional().nullable(),
  drivingCategories: z.string().optional().nullable(),
  residenceType: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
});

export const updateDocumentSchema = z.object({
  documentNumber: z.string().min(1).optional(),
  nationality: z.string().optional().nullable(),
  nif: z.string().regex(/^\d{9}$/).optional().nullable(),
  drivingCategories: z.string().optional().nullable(),
  residenceType: z.string().optional().nullable(),
  placeOfBirth: z.string().optional().nullable(),
});

const listDocumentsQuerySchema = z.object({
  type: z.nativeEnum(DocumentType).optional(),
  documentNumber: z.string().optional(),
  personId: z.string().uuid().optional(),
});

// Criar documento
router.post(
  "/",
  auth,
  requireRole(Role.ADMIN, Role.USER),
  async (req, res) => {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, "Dados inválidos", parsed.error.flatten());
    }

    try {
      const person = await prisma.person.findFirst({
        where: {
          id: parsed.data.personId,
          ownerId: req.user!.id,
        },
      });

      if (!person) {
        return res.status(404).json({ message: "Pessoa não encontrada" });
      }

      const document = await createDocument({
        ...parsed.data,
        ownerId: req.user!.id,
      });
      res.status(201).json(document);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Erro ao criar documento" });
    }
  }
);

// Listar documentos (com filtros)
router.get("/", auth, async (req, res) => {
  const parsed = listDocumentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { type, documentNumber, personId } = parsed.data;

  const documents = await listDocuments({
    type,
    documentNumber,
    personId,
    ownerId: req.user!.id,
  });

  res.json(documents);
});

// Obter documento por ID
router.get(
  "/:id",
  auth,
  async (req: Request<{ id: string }>, res) => {
    const document = await getDocumentById(req.params.id, req.user!.id);

    if (!document) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    res.json(document);
  }
);

// Editar documento
router.put(
  "/:id",
  auth,
  requireRole(Role.ADMIN, Role.USER),
  async (req: Request<{ id: string }>, res) => {
    const parsed = updateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, "Dados inválidos", parsed.error.flatten());
    }

    const existing = await getDocumentById(req.params.id, req.user!.id);

    if (!existing) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    const document = await updateDocument(req.params.id, parsed.data);
    res.json(document);
  }
);

export default router;
