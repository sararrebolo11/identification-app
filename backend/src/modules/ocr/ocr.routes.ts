import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import { auth } from "../../middleware/auth";
import { extractTextFromImage } from "./ocr.service";
import { parseDocument } from "./document.factory";
import { DocumentType } from "@prisma/client";
import { createFromCitizenCard } from "./ocr.create.service";
import { isParsedCitizenCard } from "./parsers/typeGuards";
import { promises as fs } from "fs";
import { badRequest } from "../../utils/http";

const router = Router();

const ocrTypeSchema = z.object({
  type: z.nativeEnum(DocumentType),
});

const ocrConfirmSchema = z.object({
  fullName: z.string().min(1),
  documentNumber: z.string().min(1),
  dateOfBirth: z.string().optional().nullable(),
  nif: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  parsed: z
    .object({
      type: z.literal("CARTAO_CIDADAO"),
      nationality: z.string().optional().nullable(),
      nif: z.string().optional().nullable(),
    })
    .passthrough(),
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Ficheiro inválido"));
    } else {
      cb(null, true);
    }
  },
});

async function safeUnlink(filePath?: string) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignorar falhas de limpeza (ficheiro já removido, etc.)
  }
}

/**
 * 🔹 OCR + parsing (preview)
 */
router.post(
  "/document",
  auth,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    let frontPath: string | undefined;
    let backPath: string | undefined;
    try {
      const parsedBody = ocrTypeSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return badRequest(res, "Dados inválidos", parsedBody.error.flatten());
      }

      const documentType = parsedBody.data.type;

      const files = req.files as {
        front?: Express.Multer.File[];
        back?: Express.Multer.File[];
    } | undefined;

    const frontImage = files?.front?.[0];
    const backImage = files?.back?.[0];
    frontPath = frontImage?.path;
    backPath = backImage?.path;

      if (!frontImage) {
        return res.status(400).json({
          message: "Imagem da frente é obrigatória",
        });
      }

      if (
        documentType === DocumentType.CARTAO_CIDADAO &&
        !backImage
      ) {
        return res.status(400).json({
          message: "O verso é obrigatório para o Cartão de Cidadão",
        });
      }

      const frontText = await extractTextFromImage(frontImage.path);
      const backText = backImage
        ? await extractTextFromImage(backImage.path)
        : "";

      const parsed = parseDocument(documentType, frontText, backText);
      return res.json({
        parsed,
      });
    } catch (error) {
        console.error("ERRO OCR CREATE:", error);

        res.status(500).json({
            message: "Erro ao processar documento",
            error: error instanceof Error ? error.message : String(error),
        });
    } finally {
      await safeUnlink(frontPath);
      await safeUnlink(backPath);
    }
  }
);

/**
 * 🔹 OCR + criação automática (Cartão de Cidadão)
 */
export function requiresBack(type: DocumentType): boolean {
  return (
    type === DocumentType.CARTAO_CIDADAO ||
    type === DocumentType.CARTA_CONDUCAO
  );
}

router.post(
  "/document/create",
  auth,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    let frontPath: string | undefined;
    let backPath: string | undefined;
    try {
      const parsedBody = ocrTypeSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return badRequest(res, "Dados inválidos", parsedBody.error.flatten());
      }

      const documentType = parsedBody.data.type;

      const files = req.files as {
        front?: Express.Multer.File[];
        back?: Express.Multer.File[];
      };

      const frontImage = files?.front?.[0];
      const backImage = files?.back?.[0];
      frontPath = frontImage?.path;
      backPath = backImage?.path;

      if (!frontImage) {
        return res.status(400).json({
          message: "A frente do documento é obrigatória",
        });
      }

      if (requiresBack(documentType) && !backImage) {
        return res.status(400).json({
          message: "Este tipo de documento exige frente e verso",
        });
      }

      /* =======================
         OCR
         ======================= */
      const frontText = await extractTextFromImage(frontImage.path);
      const backText = backImage
        ? await extractTextFromImage(backImage.path)
        : "";

      const parsed = parseDocument(
        documentType,
        frontText,
        backText
      );

      if (!isParsedCitizenCard(parsed)) {
        return res.status(400).json({
          message: "Parser inválido para Cartão de Cidadão",
        });
      }

      /* =======================
         CONFIRMAR SEMPRE
         ======================= */
      return res.status(200).json({
        status: "NEEDS_CONFIRMATION",
        parsed,
      });
    } catch (err) {
      console.error("ERRO OCR CREATE:", err);
      return res.status(500).json({
        message: "Erro ao processar documento",
      });
    } finally {
      await safeUnlink(frontPath);
      await safeUnlink(backPath);
    }
  }
);

router.post("/document/confirm", auth, async (req, res) => {
  const parsedBody = ocrConfirmSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return badRequest(res, "Dados inválidos", parsedBody.error.flatten());
  }

  const {
    fullName,
    documentNumber,
    dateOfBirth,
    nif,
    phone,
    address,
    postalCode,
    notes,
    parsed,
  } = parsedBody.data;

  /* =======================
     VALIDAÇÕES BÁSICAS
     ======================= */
  if (parsed.type !== "CARTAO_CIDADAO") {
    return res.status(400).json({
      message: "Tipo de documento inválido",
    });
  }

  /* =======================
     NORMALIZAÇÃO
     ======================= */
  const normalizedFullName = fullName.trim().toUpperCase();
  const normalizedDocumentNumber = documentNumber.replace(/\s+/g, "");
  const normalizedNif = nif?.replace(/\s+/g, "") ?? null;

  try {
    /* =======================
       CRIAÇÃO (SERVIÇO)
       ======================= */
    const created = await createFromCitizenCard({
      ownerId: req.user!.id,
      // Pessoa
      fullName: normalizedFullName,
      dateOfBirth: dateOfBirth || null,
      nif: normalizedNif,
      phone: phone || null,
      address: address || null,
      postalCode: postalCode || null,
      notes: notes || null,

      // Documento
      documentNumber: normalizedDocumentNumber,
      nationality: parsed.nationality ?? "PRT",
    });

    return res.status(201).json({
      status: "CREATED",
      person: created.person,
      document: created.document,
    });
  } catch (err: any) {
        console.error("OCR CONFIRM ERROR:", err);

        if (err.message === "DOCUMENT_ALREADY_EXISTS") {
            return res.status(409).json({
            message: "Documento já registado",
            });
        }

        return res.status(500).json({
            message: "Erro ao criar registo",
        });
    }
});

export default router;
