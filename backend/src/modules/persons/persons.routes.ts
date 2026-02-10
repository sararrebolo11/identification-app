import { Router, Request } from "express";
import { z } from "zod";
import { listPersons, updatePerson } from "./persons.service";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/role";
import { deletePerson } from "./persons.service";
import { prisma } from "../../prisma";
import { Prisma, Role } from "@prisma/client";
import { badRequest } from "../../utils/http";

const router = Router();

export const createPersonSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  nif: z
    .string()
    .regex(/^\d{9}$/)
    .optional()
    .nullable(),
  cc: z
    .string()
    .regex(/^\d{8}$/)
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\d{9}$/)
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  postalCode: z
    .string()
    .regex(/^\d{4}-\d{3}$/)
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePersonSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  cc: z
    .string()
    .regex(/^\d{8}$/)
    .optional()
    .nullable(),
  nif: z
    .string()
    .regex(/^\d{9}$/)
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\d{9}$/)
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  postalCode: z
    .string()
    .regex(/^\d{4}-\d{3}$/)
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

const listPersonsQuerySchema = z.object({
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

router.get("/ping", (_req, res) => {
  res.json({ ok: true });
});

// Listar / filtrar pessoas
router.get("/", auth, async (req, res) => {
  const parsed = listPersonsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const persons = await listPersons({
    name: parsed.data.name,
    dateOfBirth: parsed.data.dateOfBirth,
    ownerId: req.user!.id,
  });
  res.json(persons);
});

// Obter pessoa por ID
router.get(
  "/:id",
  auth,
  async (req: Request<{ id: string }>, res) => {
    const person = await prisma.person.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id,
      },
      include: {
        documents: true,
      },
    });

    if (!person) {
      return res.status(404).json({ message: "Pessoa não encontrada" });
    }

    res.json(person);
  }
);

// Criar pessoa
router.post("/", auth, async (req, res) => {
  const parsed = createPersonSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const {
    fullName,
    dateOfBirth,
    nif,
    cc,
    phone,
    address,
    postalCode,
    notes,
  } = parsed.data;

  const normalizedCc = cc ? cc.replace(/\s+/g, "").trim() : null;

  try {
    if (normalizedCc) {
      const existing = await prisma.document.findFirst({
        where: {
          type: "CARTAO_CIDADAO",
          documentNumber: normalizedCc,
          ownerId: req.user!.id,
        },
        select: { id: true },
      });

      if (existing) {
        return res.status(409).json({
          message: "Já existe um registo com esse Nº CC",
        });
      }
    }

    const person = await prisma.person.create({
      data: {
        fullName: fullName.trim().toUpperCase(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nif: nif ?? null,
        cc: normalizedCc,
        phone: phone ?? null,
        address: address ?? null,
        postalCode: postalCode ?? null,
        notes: notes ?? null,

        ownerId: req.user!.id,

        documents: normalizedCc
          ? {
              create: [
                {
                  type: "CARTAO_CIDADAO",
                  documentNumber: normalizedCc,
                  ownerId: req.user!.id,
                },
              ],
            }
          : undefined,
      },
    });

    res.status(201).json(person);
  } catch (err) {
    console.error(err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Documento já existe com esse número",
      });
    }
    res.status(500).json({
      message: "Erro ao criar pessoa",
    });
  }
});

// Editar pessoa
router.put(
  "/:id",
  auth,
  requireRole(Role.ADMIN, Role.USER),
  async (req: Request<{ id: string }>, res) => {
    const parsed = updatePersonSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, "Dados inválidos", parsed.error.flatten());
    }

    const existing = await prisma.person.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Pessoa não encontrada" });
    }

    const { cc, ...personData } = parsed.data;
    const normalizedCc =
      cc === undefined ? undefined : cc ? cc.replace(/\s+/g, "").trim() : "";

    const person = await updatePerson(req.params.id, {
      ...personData,
      cc:
        normalizedCc === undefined
          ? undefined
          : normalizedCc
            ? normalizedCc
            : null,
    });

    if (normalizedCc !== undefined) {
      const existingCc = await prisma.document.findFirst({
        where: {
          personId: req.params.id,
          type: "CARTAO_CIDADAO",
        },
      });

      if (!normalizedCc && existingCc) {
        await prisma.document.delete({ where: { id: existingCc.id } });
      } else if (normalizedCc && existingCc) {
        await prisma.document.update({
          where: { id: existingCc.id },
          data: { documentNumber: normalizedCc },
        });
      } else if (normalizedCc && !existingCc) {
        await prisma.document.create({
          data: {
            personId: req.params.id,
            type: "CARTAO_CIDADAO",
            documentNumber: normalizedCc,
            ownerId: req.user!.id,
          },
        });
      }
    }

    res.json(person);
  }
);

// Apagar pessoa
router.delete(
  "/:id",
  auth,
  requireRole(Role.ADMIN, Role.USER),
  async (req: Request<{ id: string }>, res) => {
    const existing = await prisma.person.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Pessoa não encontrada" });
    }

    await deletePerson(req.params.id);
    res.status(204).send();
  }
);

export default router;
