import { Router } from "express";
import { z } from "zod";
import { login } from "./auth.service";
import { badRequest } from "../../utils/http";
import { prisma } from "../../prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../../utils/mailer";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(6),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { email, password } = parsed.data;

  try {
    const result = await login(email, password);

    res.json({
      token: result.token,
    });
  } catch {
    res.status(401).json({ message: "Email ou password inválidos" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Resposta genérica para não expor emails válidos
  if (!user) {
    return res.json({ message: "Se o email existir, será enviado um link." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
    },
  });

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendResetEmail(email, link);
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return res.status(500).json({ message: "Erro ao enviar email" });
  }

  return res.json({ message: "Se o email existir, será enviado um link." });
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { token, newPassword } = parsed.data;
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Token inválido ou expirado" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  return res.json({ message: "Password alterada com sucesso" });
});

export default router;
